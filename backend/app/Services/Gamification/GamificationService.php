<?php

namespace App\Services\Gamification;

use App\Models\User;
use App\Models\Badge;
use App\Models\StudentBadge;
use App\Models\PointTransaction;
use App\Models\Ticket;
use App\Models\ExternalAchievement;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GamificationService
{
    // Aturan poin per aktivitas sesuai Bagian 2 STA
    public const POINTS_EVENT_ATTENDANCE = 50;
    public const POINTS_MICROLEARNING_COMPLETION = 30;
    public const POINTS_QUIZ_COMPLETION = 20;
    public const POINTS_ALL_MATERIALS = 50;
    public const POINTS_CHALLENGE = 100;

    /**
     * Tambahkan poin ke mahasiswa dengan pengecekan anti-duplikasi,
     * pembaruan tier rule-based, dan evaluasi badge otomatis.
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
                ->where('description', 'like', "%[REF:{$referenceKey}]%")
                ->exists();

            if ($alreadyAwarded) {
                return [
                    'success' => false,
                    'status' => 'duplicate',
                    'message' => "Poin untuk aktivitas {$activityName} sudah pernah diberikan sebelumnya (Anti-duplikasi aktif).",
                    'points_awarded' => 0,
                    'total_points' => (int) $user->points,
                    'tier' => $user->tier ?? $user->calculateTier(),
                ];
            }
        }

        return DB::transaction(function () use ($user, $amount, $activityName, $category, $referenceKey) {
            $user = User::lockForUpdate()->find($user->id);
            $previousTier = $user->tier ?? $user->calculateTier();
            $user->points = (int) ($user->points ?? 0) + $amount;
            $newTier = $user->calculateTier();
            $user->tier = $newTier;
            $user->save();

            $description = $activityName . ($referenceKey ? " [REF:{$referenceKey}]" : "");

            $transaction = PointTransaction::create([
                'user_id'     => $user->id,
                'amount'      => $amount,
                'type'        => 'global',
                'description' => $description,
            ]);

            // Evaluasi pembukaan badge secara otomatis
            $unlockedBadges = $this->evaluateAndUnlockBadges($user);

            $tierUpgraded = ($previousTier !== $newTier);

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
     * Evaluasi seluruh syarat badge mahasiswa berdasarkan data tersimpan di MySQL
     */
    public function evaluateAndUnlockBadges(User $user): array
    {
        $newlyUnlocked = [];

        // 1. Hitung partisipasi event yang valid (tickets aktif / checked-in)
        $eventsAttended = Ticket::where('participant_id', $user->id)
            ->whereIn('status', ['active', 'used', 'completed'])
            ->count();

        // 2. Hitung kelulusan microlearning dari external achievements
        $microlearningCompleted = ExternalAchievement::where('user_id', $user->id)
            ->where('achievement_type', 'MICROLEARNING_COMPLETION')
            ->count();

        // 3. Cek apakah ada kuis ber-skor 100
        $hasPerfectScore = ExternalAchievement::where('user_id', $user->id)
            ->where('score', '>=', 100)
            ->exists();

        $allBadges = Badge::where('is_active', true)->get();

        foreach ($allBadges as $badge) {
            $shouldUnlock = false;

            switch ($badge->code) {
                case 'FIRST_STEP':
                    // Mengikuti event pertama
                    $shouldUnlock = ($eventsAttended >= 1);
                    break;

                case 'ACTIVE_STUDENT':
                    // Mengikuti minimal 5 event
                    $shouldUnlock = ($eventsAttended >= 5);
                    break;

                case 'KNOWLEDGE_SEEKER':
                    // Menyelesaikan minimal 5 microlearning
                    $shouldUnlock = ($microlearningCompleted >= 5);
                    break;

                case 'PERFECT_SCORE':
                    // Memperoleh nilai kuis 100
                    $shouldUnlock = $hasPerfectScore;
                    break;

                case 'EVENT_ENTHUSIAST':
                    // Mengikuti minimal 10 event
                    $shouldUnlock = ($eventsAttended >= 10);
                    break;
            }

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
     * Mengambil ringkasan Gamification Dashboard mahasiswa
     */
    public function getDashboardSummary(User $user): array
    {
        $points = (int) ($user->points ?? 0);
        $tier = $user->tier ?? $user->calculateTier();

        // Hitung progress menuju tier berikutnya
        $tierProgress = $this->calculateTierProgressDetails($points, $tier);

        // Hitung badges
        $totalBadgesCount = Badge::where('is_active', true)->count();
        $studentBadges = StudentBadge::with('badge')
            ->where('user_id', $user->id)
            ->get();
        $unlockedBadgesCount = $studentBadges->count();

        // Hitung ranking leaderboard
        $rank = User::where('role', 'participant')
            ->where('points', '>', $points)
            ->count() + 1;

        // Riwayat transaksi poin terbaru
        $recentHistories = PointTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($pt) {
                return [
                    'id'          => $pt->id,
                    'activity'    => $pt->description,
                    'points'      => (int) $pt->amount,
                    'type'        => $pt->type,
                    'date'        => $pt->created_at ? $pt->created_at->format('d M Y, H:i') : '-',
                    'date_raw'    => $pt->created_at,
                    'status'      => 'SUCCESS',
                ];
            });

        return [
            'student' => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'points'   => $points,
                'tier'     => $tier,
                'rank'     => $rank,
            ],
            'tier_progress' => $tierProgress,
            'badges' => [
                'unlocked_count' => $unlockedBadgesCount,
                'total_count'    => $totalBadgesCount,
                'list'           => $studentBadges->map(fn($sb) => [
                    'badge_id'    => $sb->badge_id,
                    'code'        => $sb->badge->code,
                    'name'        => $sb->badge->name,
                    'description' => $sb->badge->description,
                    'criteria'    => $sb->badge->criteria,
                    'icon'        => $sb->badge->icon,
                    'unlocked_at' => $sb->unlocked_at ? $sb->unlocked_at->format('d M Y') : '-',
                ]),
            ],
            'recent_history' => $recentHistories,
        ];
    }

    /**
     * Hitung kalkulasi progress bar dan syarat tier
     */
    public function calculateTierProgressDetails(int $points, string $tier): array
    {
        $tiersConfig = [
            'Silver' => [
                'min' => 0,
                'max' => 499,
                'next_tier' => 'Gold',
                'points_needed' => max(0, 500 - $points),
                'percent' => min(100, round(($points / 500) * 100)),
                'benefits' => [
                    'Akses katalog event umum',
                    'Perolehan poin standar',
                    'Portofolio digital kredensial dasar'
                ]
            ],
            'Gold' => [
                'min' => 500,
                'max' => 999,
                'next_tier' => 'Platinum',
                'points_needed' => max(0, 1000 - $points),
                'percent' => min(100, round((($points - 500) / 500) * 100)),
                'benefits' => [
                    'Semua benefit Silver',
                    'Diskon tiket event hingga 20%',
                    'Prioritas antrean seat reservation (15 Menit Lock)',
                    'Badge khusus Gold Member'
                ]
            ],
            'Platinum' => [
                'min' => 1000,
                'max' => null,
                'next_tier' => 'Maksimal (Diamond Hall of Fame)',
                'points_needed' => 0,
                'percent' => 100,
                'benefits' => [
                    'Semua benefit Gold',
                    'Akses eksklusif workshop & webinar VIP',
                    'Penerbitan Soulbound Token (SBT) portofolio gratis',
                    'Rekomendasi prioritas pada Talent Directory Rekruter Industri',
                    'Bonus kuota cashback poin hingga 100 poin'
                ]
            ],
        ];

        $currentConfig = $tiersConfig[$tier] ?? $tiersConfig['Silver'];

        return [
            'current_tier'     => $tier,
            'current_points'   => $points,
            'next_tier'        => $currentConfig['next_tier'],
            'points_needed'    => $currentConfig['points_needed'],
            'progress_percent' => $currentConfig['percent'],
            'tier_min'         => $currentConfig['min'],
            'tier_max'         => $currentConfig['max'],
            'benefits'         => $currentConfig['benefits'],
            'all_tiers'        => [
                [
                    'name' => 'Silver',
                    'range' => '0 – 499 Poin',
                    'is_current' => ($tier === 'Silver'),
                    'benefits' => $tiersConfig['Silver']['benefits']
                ],
                [
                    'name' => 'Gold',
                    'range' => '500 – 999 Poin',
                    'is_current' => ($tier === 'Gold'),
                    'benefits' => $tiersConfig['Gold']['benefits']
                ],
                [
                    'name' => 'Platinum',
                    'range' => '>= 1000 Poin',
                    'is_current' => ($tier === 'Platinum'),
                    'benefits' => $tiersConfig['Platinum']['benefits']
                ],
            ]
        ];
    }
}
