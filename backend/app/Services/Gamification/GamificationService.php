<?php

namespace App\Services\Gamification;

use App\Models\User;
use App\Models\Badge;
use App\Models\StudentBadge;
use App\Models\PointTransaction;
use App\Models\Ticket;
use App\Models\ExternalAchievement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GamificationService
{
    // ─── Konstanta Global Points per aktivitas ───────────────────────────────
    // Global Points = poin akumulasi untuk tier (TIDAK berkurang saat redeem)
    public const POINTS_EVENT_ATTENDANCE        = 50;
    public const POINTS_MICROLEARNING_COMPLETION = 30;
    public const POINTS_QUIZ_COMPLETION         = 20;
    public const POINTS_ALL_MATERIALS           = 50;
    public const POINTS_CHALLENGE               = 100;

    // ─── Reward Credits per aktivitas (saldo spendable, bisa hangus 12 bulan) ─
    // Besaran default: ~50% dari Global Points aktivitas yang sama
    public const CREDITS_EVENT_ATTENDANCE        = 25;
    public const CREDITS_MICROLEARNING_COMPLETION = 15;
    public const CREDITS_QUIZ_COMPLETION         = 10;

    /**
     * Award Global Points saja (dengan anti-duplikasi dan evaluasi badge).
     * Gunakan ini ketika aktivitas tidak memberikan Reward Credits.
     */
    public function awardPoints(
        User $user,
        int $amount,
        string $activityName,
        string $category = 'general',
        ?string $referenceKey = null
    ): array {
        // Cek anti-duplikasi poin jika referenceKey diberikan
        if ($referenceKey) {
            $alreadyAwarded = PointTransaction::where('user_id', $user->id)
                ->where('type', 'global')
                ->where('description', 'like', "%[REF:{$referenceKey}]%")
                ->exists();

            if ($alreadyAwarded) {
                return [
                    'success'       => false,
                    'status'        => 'duplicate',
                    'message'       => "Poin untuk {$activityName} sudah pernah diberikan (Anti-duplikasi aktif).",
                    'points_awarded' => 0,
                    'total_points'  => (int) $user->points,
                    'tier'          => $user->tier ?? $user->calculateTier(),
                ];
            }
        }

        return DB::transaction(function () use ($user, $amount, $activityName, $referenceKey) {
            $user = User::lockForUpdate()->find($user->id);
            $previousTier = $user->tier ?? $user->calculateTier();
            $user->points = (int) ($user->points ?? 0) + $amount;
            $newTier = $user->calculateTier();
            $user->tier = $newTier;
            $user->save();

            $description = $activityName . ($referenceKey ? " [REF:{$referenceKey}]" : '');

            $transaction = PointTransaction::create([
                'user_id'     => $user->id,
                'amount'      => $amount,
                'type'        => 'global',
                'description' => $description,
            ]);

            $unlockedBadges = $this->evaluateAndUnlockBadges($user);
            $tierUpgraded   = ($previousTier !== $newTier);

            Log::info('Global Points awarded', [
                'user_id'      => $user->id,
                'amount'       => $amount,
                'activity'     => $activityName,
                'tier_changed' => $tierUpgraded ? "{$previousTier} → {$newTier}" : 'no change',
            ]);

            return [
                'success'         => true,
                'status'          => 'awarded',
                'message'         => "Berhasil memperoleh +{$amount} poin untuk {$activityName}!",
                'points_awarded'  => $amount,
                'total_points'    => (int) $user->points,
                'previous_tier'   => $previousTier,
                'current_tier'    => $newTier,
                'tier_upgraded'   => $tierUpgraded,
                'unlocked_badges' => $unlockedBadges,
                'transaction_id'  => $transaction->id,
            ];
        });
    }

    /**
     * Award Global Points DAN Reward Credits sekaligus untuk satu aktivitas.
     * Anti-duplikasi berlaku untuk keduanya via referenceKey yang sama.
     * Global Points → menentukan tier (tidak hangus, tidak berkurang saat redeem).
     * Reward Credits → saldo spendable untuk tukar reward global (hangus 12 bulan).
     */
    public function awardPointsAndCredits(
        User $user,
        int $globalPoints,
        int $rewardCredits,
        string $activityName,
        string $referenceKey
    ): array {
        return DB::transaction(function () use ($user, $globalPoints, $rewardCredits, $activityName, $referenceKey) {
            // Award Global Points
            $pointsResult = $this->awardPoints($user, $globalPoints, $activityName, 'general', $referenceKey);

            if (!$pointsResult['success']) {
                return $pointsResult; // duplikasi — stop
            }

            // Award Reward Credits (reload user agar balance fresh)
            $user = User::lockForUpdate()->find($user->id);
            $creditsResult = $user->addRewardCredits($rewardCredits, $activityName, $referenceKey . '_CREDIT');

            Log::info('Points + Credits awarded', [
                'user_id'        => $user->id,
                'global_points'  => $globalPoints,
                'reward_credits' => $rewardCredits,
                'activity'       => $activityName,
            ]);

            return array_merge($pointsResult, [
                'credits_awarded'      => $creditsResult['amount'],
                'total_reward_credits' => $creditsResult['new_balance'],
                'credits_expires_at'   => $creditsResult['expires_at'] ?? null,
            ]);
        });
    }

    /**
     * Ekspirasi Reward Credits yang melewati expires_at.
     * Dipanggil oleh scheduler (ExpireTransactionsCommand).
     * Mengembalikan jumlah kredit yang diexpirasi.
     */
    public function expireCredits(): int
    {
        // Ambil transaksi kredit positif yang sudah expired dan belum diproses
        $expiredRows = PointTransaction::where('type', 'credit')
            ->where('amount', '>', 0)
            ->where('is_expired', false)
            ->where('expires_at', '<=', now())
            ->get();

        $totalExpired = 0;

        foreach ($expiredRows as $row) {
            DB::transaction(function () use ($row, &$totalExpired) {
                // Tandai sebagai expired agar tidak diproses ulang
                $row->is_expired = true;
                $row->save();

                // Kurangi saldo reward_credits user
                $user = User::lockForUpdate()->find($row->user_id);
                if (!$user) {
                    return;
                }

                // Hanya kurangi sejumlah kredit yang masih aktif (saldo tidak boleh negatif)
                $deduct = min((int) ($user->reward_credits ?? 0), (int) $row->amount);
                if ($deduct > 0) {
                    $user->reward_credits = (int) $user->reward_credits - $deduct;
                    $user->save();

                    // Catat mutasi negatif di ledger untuk audit trail
                    PointTransaction::create([
                        'user_id'     => $user->id,
                        'amount'      => -$deduct,
                        'type'        => 'credit',
                        'description' => "Reward Credits expired [REF_TX:{$row->id}]",
                    ]);

                    $totalExpired += $deduct;

                    Log::info('Reward Credits expired', [
                        'user_id'   => $user->id,
                        'amount'    => $deduct,
                        'origin_tx' => $row->id,
                    ]);
                }
            });
        }

        return $totalExpired;
    }

    /**
     * Hitung saldo Reward Credits user beserta info kredit yang akan segera hangus (30 hari).
     */
    public function getRewardCreditBalance(User $user): array
    {
        $balance = (int) ($user->reward_credits ?? 0);

        // Kredit yang akan hangus dalam 30 hari ke depan
        $expiringCredits = PointTransaction::where('user_id', $user->id)
            ->where('type', 'credit')
            ->where('amount', '>', 0)
            ->where('is_expired', false)
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(30))
            ->get(['amount', 'expires_at', 'description'])
            ->map(fn($t) => [
                'amount'     => (int) $t->amount,
                'expires_at' => $t->expires_at?->format('d M Y'),
                'source'     => $t->description,
            ]);

        return [
            'balance'          => $balance,
            'expiring_soon'    => $expiringCredits->values(),
            'expiring_30d_total' => $expiringCredits->sum('amount'),
        ];
    }

    /**
     * Evaluasi seluruh syarat badge mahasiswa berdasarkan data tersimpan di MySQL.
     */
    public function evaluateAndUnlockBadges(User $user): array
    {
        $newlyUnlocked = [];

        // 1. Partisipasi event (tiket aktif / checked-in)
        $eventsAttended = Ticket::where('participant_id', $user->id)
            ->whereIn('status', ['active', 'used', 'completed'])
            ->count();

        // 2. Kelulusan microlearning dari external achievements
        $microlearningCompleted = ExternalAchievement::where('user_id', $user->id)
            ->where('achievement_type', 'MICROLEARNING_COMPLETION')
            ->count();

        // 3. Skor kuis sempurna
        $hasPerfectScore = ExternalAchievement::where('user_id', $user->id)
            ->where('score', '>=', 100)
            ->exists();

        $allBadges = Badge::where('is_active', true)->get();

        foreach ($allBadges as $badge) {
            $shouldUnlock = match ($badge->code) {
                'FIRST_STEP'       => $eventsAttended >= 1,
                'ACTIVE_STUDENT'   => $eventsAttended >= 5,
                'KNOWLEDGE_SEEKER' => $microlearningCompleted >= 5,
                'PERFECT_SCORE'    => $hasPerfectScore,
                'EVENT_ENTHUSIAST' => $eventsAttended >= 10,
                default            => false,
            };

            if ($shouldUnlock) {
                $alreadyHas = StudentBadge::where('user_id', $user->id)
                    ->where('badge_id', $badge->id)
                    ->exists();

                if (!$alreadyHas) {
                    StudentBadge::create([
                        'user_id'     => $user->id,
                        'badge_id'    => $badge->id,
                        'unlocked_at' => Carbon::now(),
                    ]);

                    $newlyUnlocked[] = [
                        'code'        => $badge->code,
                        'name'        => $badge->name,
                        'description' => $badge->description,
                        'criteria'    => $badge->criteria,
                        'icon'        => $badge->icon,
                    ];
                }
            }
        }

        return $newlyUnlocked;
    }

    /**
     * Ringkasan Gamification Dashboard mahasiswa (data real dari database).
     */
    public function getDashboardSummary(User $user): array
    {
        $globalPoints  = (int) ($user->points ?? 0);
        $rewardCredits = (int) ($user->reward_credits ?? 0);
        $tier          = $user->tier ?? $user->calculateTier();

        $tierProgress    = $this->calculateTierProgressDetails($globalPoints, $tier);
        $totalBadges     = Badge::where('is_active', true)->count();
        $studentBadges   = StudentBadge::with('badge')->where('user_id', $user->id)->get();
        $unlockedBadges  = $studentBadges->count();

        // Peringkat leaderboard berdasarkan Global Points
        $rank = User::where('role', 'participant')
            ->where('points', '>', $globalPoints)
            ->count() + 1;

        // 8 transaksi poin terbaru (global + credit)
        $recentHistories = PointTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(fn($pt) => [
                'id'       => $pt->id,
                'activity' => $pt->description,
                'points'   => (int) $pt->amount,
                'type'     => $pt->type,   // 'global' | 'local' | 'credit'
                'date'     => $pt->created_at?->format('d M Y, H:i') ?? '-',
                'date_raw' => $pt->created_at,
                'status'   => 'SUCCESS',
            ]);

        return [
            'student' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'points'         => $globalPoints,          // Global Points (untuk tier)
                'reward_credits' => $rewardCredits,         // Reward Credits (saldo spendable)
                'tier'           => $tier,
                'rank'           => $rank,
            ],
            'tier_progress'  => $tierProgress,
            'badges' => [
                'unlocked_count' => $unlockedBadges,
                'total_count'    => $totalBadges,
                'list'           => $studentBadges->map(fn($sb) => [
                    'badge_id'    => $sb->badge_id,
                    'code'        => $sb->badge->code,
                    'name'        => $sb->badge->name,
                    'description' => $sb->badge->description,
                    'criteria'    => $sb->badge->criteria,
                    'icon'        => $sb->badge->icon,
                    'unlocked_at' => $sb->unlocked_at?->format('d M Y') ?? '-',
                ]),
            ],
            'recent_history' => $recentHistories,
        ];
    }

    /**
     * Kalkulasi progress bar dan syarat tier.
     * Tier dihitung dari Global Points (tidak dipengaruhi penukaran reward).
     */
    public function calculateTierProgressDetails(int $globalPoints, string $tier): array
    {
        $tiersConfig = [
            'Silver' => [
                'min'           => 0,
                'max'           => 499,
                'next_tier'     => 'Gold',
                'points_needed' => max(0, 500 - $globalPoints),
                'percent'       => min(100, round(($globalPoints / 500) * 100)),
                'benefits'      => [
                    'Akses katalog event umum',
                    'Perolehan poin standar',
                    'Portofolio digital kredensial dasar',
                ],
            ],
            'Gold' => [
                'min'           => 500,
                'max'           => 999,
                'next_tier'     => 'Platinum',
                'points_needed' => max(0, 1000 - $globalPoints),
                'percent'       => min(100, round((($globalPoints - 500) / 500) * 100)),
                'benefits'      => [
                    'Semua benefit Silver',
                    'Diskon tiket event hingga 20%',
                    'Prioritas antrean seat reservation (15 Menit Lock)',
                    'Badge khusus Gold Member',
                ],
            ],
            'Platinum' => [
                'min'           => 1000,
                'max'           => null,
                'next_tier'     => 'Maksimal (Diamond Hall of Fame)',
                'points_needed' => 0,
                'percent'       => 100,
                'benefits'      => [
                    'Semua benefit Gold',
                    'Akses eksklusif workshop & webinar VIP',
                    'Penerbitan Soulbound Token (SBT) portofolio gratis',
                    'Rekomendasi prioritas pada Talent Directory Rekruter Industri',
                    'Bonus kuota cashback poin hingga 100 poin',
                ],
            ],
        ];

        $cfg = $tiersConfig[$tier] ?? $tiersConfig['Silver'];

        return [
            'current_tier'     => $tier,
            'current_points'   => $globalPoints,
            'next_tier'        => $cfg['next_tier'],
            'points_needed'    => $cfg['points_needed'],
            'progress_percent' => $cfg['percent'],
            'tier_min'         => $cfg['min'],
            'tier_max'         => $cfg['max'],
            'benefits'         => $cfg['benefits'],
            'all_tiers'        => [
                ['name' => 'Silver',   'range' => '0 – 499 Poin',  'is_current' => ($tier === 'Silver'),   'benefits' => $tiersConfig['Silver']['benefits']],
                ['name' => 'Gold',     'range' => '500 – 999 Poin','is_current' => ($tier === 'Gold'),     'benefits' => $tiersConfig['Gold']['benefits']],
                ['name' => 'Platinum', 'range' => '>= 1000 Poin',  'is_current' => ($tier === 'Platinum'), 'benefits' => $tiersConfig['Platinum']['benefits']],
            ],
        ];
    }
}

