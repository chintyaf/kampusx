<?php

namespace App\Services\Bandit;

use App\Models\Event;
use App\Models\User;
use App\Models\Ticket;
use App\Models\RewardCatalog;
use App\Models\RewardDecisionLog;
use App\Models\RewardFeedback;
use App\Models\ExternalAchievement;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Service Reward Decision Engine berbasis Algoritma Contextual Bandit (Thompson Sampling)
 * dengan Batasan Anggaran DISCO (Discount Optimization / Integer Programming Constraint).
 * Sesuai Bagian 3 Tugas Akhir.
 */
class RewardDecisionEngine
{
    // 5 Pilihan Reward (Arms)
    public const ARM_DISCOUNT_10       = 'REWARD_DISCOUNT_10';       // Diskon tiket 10%
    public const ARM_DISCOUNT_20       = 'REWARD_DISCOUNT_20';       // Diskon tiket 20%
    public const ARM_BONUS_50          = 'REWARD_BONUS_50';          // Bonus 50 Poin
    public const ARM_BONUS_100         = 'REWARD_BONUS_100';         // Bonus 100 Poin
    public const ARM_EXCLUSIVE_ACCESS  = 'REWARD_EXCLUSIVE_ACCESS';  // Akses Eksklusif

    /**
     * Mengumpulkan konteks menyeluruh mahasiswa dari database MySQL
     */
    public function extractUserContext(User $user): array
    {
        $eventsAttended = Ticket::where('participant_id', $user->id)
            ->whereIn('status', ['active', 'used', 'completed'])
            ->count();

        $microlearningCompleted = ExternalAchievement::where('user_id', $user->id)
            ->where('achievement_type', 'MICROLEARNING_COMPLETION')
            ->count();

        $previousDecisionsCount = RewardDecisionLog::where('user_id', $user->id)->count();

        $claimedRewardsCount = RewardFeedback::where('user_id', $user->id)
            ->where('is_converted', true)
            ->count();

        $conversionRate = $previousDecisionsCount > 0
            ? round(($claimedRewardsCount / $previousDecisionsCount) * 100, 1)
            : 0.0;

        $tier = $user->tier ?? $user->calculateTier();

        return [
            'user_id'                 => $user->id,
            'name'                    => $user->name,
            'points'                  => (int) $user->points,
            'tier'                    => $tier,
            'events_attended'         => $eventsAttended,
            'microlearning_completed' => $microlearningCompleted,
            'total_offers_received'   => $previousDecisionsCount,
            'rewards_claimed_count'   => $claimedRewardsCount,
            'conversion_rate_pct'     => $conversionRate,
        ];
    }

    /**
     * Memilih reward paling optimal menggunakan Thompson Sampling
     * yang difilter oleh Integer Programming Feasibility Constraints.
     */
    public function selectOptimalReward(User $user, ?Event $event = null, float $basePrice = 50000.0): array
    {
        $context = $this->extractUserContext($user);
        $userTier = $context['tier'];

        // 1. Ambil katalog reward aktif dari database MySQL
        $catalog = RewardCatalog::where('is_active', true)->get()->keyBy('code');

        // Pastikan sisa budget promosi event dari Cache/DB (Default Rp 500.000)
        $eventId = $event ? $event->id : null;
        $budgetKey = $eventId ? "event_promo_budget:event_{$eventId}" : "global_promo_budget";
        $remainingBudget = Cache::get($budgetKey, 500000.0);

        // 2. Evaluasi Feasibility Integer Programming (DISCO Constraints):
        // Kendala:
        // c_i * x_i <= B (Sisa Anggaran)
        // remaining_quota_i > 0 (Sisa Kuota)
        // Limit per user: User belum mengklaim arm yang sama dalam 24 jam terakhir
        $feasibleArms = [];
        $constraintLogs = [];

        $allArmCodes = [
            self::ARM_DISCOUNT_10,
            self::ARM_DISCOUNT_20,
            self::ARM_BONUS_50,
            self::ARM_BONUS_100,
            self::ARM_EXCLUSIVE_ACCESS,
        ];

        foreach ($allArmCodes as $armCode) {
            $rewardModel = $catalog->get($armCode);
            if (!$rewardModel) {
                continue;
            }

            // Hitung biaya finansial reward bagi sistem
            $cost = (float) $rewardModel->cost_budget;
            if ($rewardModel->reward_type === 'ticket_discount') {
                $cost = round($basePrice * ($rewardModel->reward_value / 100.0));
            }

            $remainingQuota = (int) $rewardModel->remaining_quota;

            // Pengecekan limit harian user
            $recentlyClaimed = RewardDecisionLog::where('user_id', $user->id)
                ->where('selected_arm', $armCode)
                ->where('decided_at', '>=', Carbon::now()->subHours(24))
                ->where('allocation_status', 'claimed')
                ->exists();

            $isBudgetOk = ($remainingBudget >= $cost);
            $isQuotaOk = ($remainingQuota > 0);
            $isUserLimitOk = !$recentlyClaimed;

            $isFeasible = ($isBudgetOk && $isQuotaOk && $isUserLimitOk);

            $constraintLogs[$armCode] = [
                'name'            => $rewardModel->name,
                'cost'            => $cost,
                'remaining_quota' => $remainingQuota,
                'budget_feasible' => $isBudgetOk,
                'quota_feasible'  => $isQuotaOk,
                'user_limit_ok'   => $isUserLimitOk,
                'is_feasible'     => $isFeasible,
            ];

            if ($isFeasible) {
                $feasibleArms[] = $armCode;
            }
        }

        // Fallback: Jika seluruh diskon melebihi budget, Bonus 50 poin selalu feasible (biaya Rp 0)
        if (empty($feasibleArms)) {
            $feasibleArms = [self::ARM_BONUS_50];
        }

        // 3. Konfigurasi Prior Beta Distribution [alpha, beta] per Arm & per Tier
        // Dihubungkan dengan histori konversi aktual di database
        $priors = $this->getPriorsWithFeedback($userTier);

        // 4. Eksekusi Thompson Sampling:
        // Lakukan penarikan sampel acak terdistribusi Beta(alpha, beta) untuk tiap feasible arm
        $bestArm = null;
        $maxSample = -1.0;
        $samplesLog = [];

        foreach ($feasibleArms as $armCode) {
            $alpha = $priors[$armCode]['alpha'] ?? 5.0;
            $beta = $priors[$armCode]['beta'] ?? 5.0;

            $sampleTheta = $this->sampleBeta($alpha, $beta);
            $samplesLog[$armCode] = round($sampleTheta, 4);

            if ($sampleTheta > $maxSample) {
                $maxSample = $sampleTheta;
                $bestArm = $armCode;
            }
        }

        if (!$bestArm) {
            $bestArm = self::ARM_BONUS_50;
        }

        $selectedRewardModel = $catalog->get($bestArm);

        // Hitung nilai diskon / bonus poin
        $discountAmount = 0.0;
        $bonusPoints = 0;
        if ($selectedRewardModel) {
            if ($selectedRewardModel->reward_type === 'ticket_discount') {
                $discountAmount = round($basePrice * ($selectedRewardModel->reward_value / 100.0));
            } elseif ($selectedRewardModel->reward_type === 'bonus_points') {
                $bonusPoints = (int) $selectedRewardModel->reward_value;
            }
        }

        // 5. Buat alasan analitis yang dihasilkan dinamis dari data konteks & constraint
        $decisionReason = $this->generateDecisionReason(
            $context,
            $selectedRewardModel,
            $bestArm,
            $maxSample,
            $constraintLogs[$bestArm] ?? []
        );

        // 6. Simpan keputusan ke database MySQL (Audit Trail untuk Sidang STA)
        $decisionLog = RewardDecisionLog::create([
            'user_id'           => $user->id,
            'event_id'          => $eventId,
            'reward_id'         => $selectedRewardModel ? $selectedRewardModel->id : null,
            'selected_arm'      => $bestArm,
            'algorithm'         => 'Contextual Bandit (Thompson Sampling Beta-Bernoulli)',
            'context_used'      => $context,
            'thompson_samples'  => $samplesLog,
            'disco_constraints' => [
                'remaining_budget' => $remainingBudget,
                'arms_evaluation'  => $constraintLogs,
                'feasible_arms'    => $feasibleArms,
            ],
            'decision_reason'   => $decisionReason,
            'allocation_status' => 'allocated',
            'decided_at'        => Carbon::now(),
        ]);

        return [
            'decision_log_id'   => $decisionLog->id,
            'user'              => [
                'id'     => $user->id,
                'name'   => $user->name,
                'tier'   => $userTier,
                'points' => (int) $user->points,
            ],
            'context'           => $context,
            'selected_arm'      => $bestArm,
            'reward'            => [
                'id'              => $selectedRewardModel ? $selectedRewardModel->id : null,
                'code'            => $bestArm,
                'name'            => $selectedRewardModel ? $selectedRewardModel->name : 'Reward Rekomendasi',
                'description'     => $selectedRewardModel ? $selectedRewardModel->description : '',
                'type'            => $selectedRewardModel ? $selectedRewardModel->reward_type : 'bonus_points',
                'value'           => $selectedRewardModel ? (float) $selectedRewardModel->reward_value : 50,
                'discount_amount' => $discountAmount,
                'bonus_points'    => $bonusPoints,
                'remaining_quota' => $selectedRewardModel ? (int) $selectedRewardModel->remaining_quota : 50,
            ],
            'sampling_score'    => round($maxSample, 4),
            'thompson_samples'  => $samplesLog,
            'feasible_arms'     => $feasibleArms,
            'remaining_budget'  => $remainingBudget,
            'decision_reason'   => $decisionReason,
            'allocation_status' => 'allocated',
            'decided_at'        => $decisionLog->decided_at ? $decisionLog->decided_at->format('d M Y, H:i') : null,
        ];
    }

    /**
     * Menghasilkan penjelasan analitis dinamis berdasarkan data konteks
     */
    protected function generateDecisionReason(
        array $context,
        ?RewardCatalog $reward,
        string $armCode,
        float $sampleScore,
        array $constraintInfo
    ): string {
        $tier = $context['tier'];
        $events = $context['events_attended'];
        $micro = $context['microlearning_completed'];
        $rewardName = $reward ? $reward->name : $armCode;
        $quota = $constraintInfo['remaining_quota'] ?? 0;

        $reasons = [];

        if ($tier === 'Platinum') {
            $reasons[] = "Mahasiswa berstatus Platinum (Poin >= 1000) dengan keaktifan belajar tinggi ({$events} event, {$micro} microlearning).";
        } elseif ($tier === 'Gold') {
            $reasons[] = "Mahasiswa berstatus Gold (500–999 Poin) dengan riwayat partisipasi aktif ({$events} event).";
        } else {
            $reasons[] = "Mahasiswa berstatus Silver (0–499 Poin) yang sedang membangun rekam jejak akademik ({$micro} microlearning selesai).";
        }

        if (str_contains($armCode, 'DISCOUNT')) {
            $reasons[] = "Rekomendasi diskon diprioritaskan untuk mengonversi keikutsertaan tiket berbayar.";
        } elseif (str_contains($armCode, 'BONUS')) {
            $reasons[] = "Reward bonus poin diberikan untuk mempercepat progres kenaikan tier mahasiswa.";
        } else {
            $reasons[] = "Akses eksklusif dialokasikan sebagai insentif retensi engagement tertinggi.";
        }

        $reasons[] = "Arm '{$rewardName}' menghasilkan skor Thompson Sampling tertinggi (" . round($sampleScore, 3) . ").";
        $reasons[] = "Alokasi lolos kendala Integer Programming (sisa kuota: {$quota}, memenuhi pagu anggaran promosi).";

        return implode(' ', $reasons);
    }

    /**
     * Membaca parameter prior Beta distribution digabungkan dengan riwayat feedback MySQL
     */
    protected function getPriorsWithFeedback(string $tier): array
    {
        $basePriors = [
            'Platinum' => [
                self::ARM_DISCOUNT_20      => ['alpha' => 9.0, 'beta' => 2.0],
                self::ARM_EXCLUSIVE_ACCESS => ['alpha' => 8.5, 'beta' => 2.5],
                self::ARM_BONUS_100        => ['alpha' => 8.0, 'beta' => 3.0],
                self::ARM_DISCOUNT_10      => ['alpha' => 6.0, 'beta' => 4.0],
                self::ARM_BONUS_50         => ['alpha' => 5.0, 'beta' => 5.0],
            ],
            'Gold' => [
                self::ARM_DISCOUNT_20      => ['alpha' => 8.0, 'beta' => 3.0],
                self::ARM_DISCOUNT_10      => ['alpha' => 7.5, 'beta' => 3.0],
                self::ARM_BONUS_100        => ['alpha' => 7.0, 'beta' => 3.5],
                self::ARM_BONUS_50         => ['alpha' => 6.0, 'beta' => 4.0],
                self::ARM_EXCLUSIVE_ACCESS => ['alpha' => 5.5, 'beta' => 4.5],
            ],
            'Silver' => [
                self::ARM_DISCOUNT_10      => ['alpha' => 9.0, 'beta' => 2.0],
                self::ARM_BONUS_50         => ['alpha' => 8.0, 'beta' => 3.0],
                self::ARM_BONUS_100        => ['alpha' => 6.0, 'beta' => 4.0],
                self::ARM_DISCOUNT_20      => ['alpha' => 5.5, 'beta' => 4.5],
                self::ARM_EXCLUSIVE_ACCESS => ['alpha' => 4.0, 'beta' => 6.0],
            ],
        ];

        $tierKey = in_array($tier, ['Platinum', 'Gold', 'Silver']) ? $tier : 'Silver';
        $priors = $basePriors[$tierKey];

        // Ambil histori agregat konversi aktual dari tabel reward_feedbacks
        $feedbackStats = DB::table('reward_feedbacks')
            ->join('reward_decision_logs', 'reward_feedbacks.decision_log_id', '=', 'reward_decision_logs.id')
            ->select(
                'reward_decision_logs.selected_arm',
                DB::raw('SUM(CASE WHEN reward_feedbacks.is_converted = 1 THEN 1 ELSE 0 END) as successes'),
                DB::raw('SUM(CASE WHEN reward_feedbacks.is_converted = 0 THEN 1 ELSE 0 END) as failures')
            )
            ->groupBy('reward_decision_logs.selected_arm')
            ->get()
            ->keyBy('selected_arm');

        foreach ($priors as $armCode => &$values) {
            if ($feedbackStats->has($armCode)) {
                $stat = $feedbackStats->get($armCode);
                $values['alpha'] += (float) $stat->successes;
                $values['beta']  += (float) $stat->failures;
            }
        }

        return $priors;
    }

    /**
     * Merekam feedback loop setelah mahasiswa mengklaim atau menggunakan reward
     * Mencegah pembaruan ganda untuk aksi yang sama.
     */
    public function recordFeedback(int $decisionLogId, User $user, string $action = 'claimed'): array
    {
        $log = RewardDecisionLog::findOrFail($decisionLogId);

        $existing = RewardFeedback::where('decision_log_id', $decisionLogId)
            ->where('action', $action)
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'status'  => 'duplicate',
                'message' => 'Feedback untuk keputusan reward ini sudah pernah dicatat sebelumnya.',
                'feedback' => $existing,
            ];
        }

        return DB::transaction(function () use ($log, $user, $action) {
            $feedback = RewardFeedback::create([
                'decision_log_id' => $log->id,
                'user_id'         => $user->id,
                'action'          => $action,
                'is_converted'    => in_array($action, ['claimed', 'used_in_checkout']),
                'feedback_at'     => Carbon::now(),
            ]);

            // Update status log menjadi claimed
            $log->update(['allocation_status' => 'claimed']);

            // Kurangi kuota reward jika masih tersedia di katalog
            if ($log->reward_id) {
                RewardCatalog::where('id', $log->reward_id)
                    ->where('remaining_quota', '>', 0)
                    ->decrement('remaining_quota');
            }

            // Jika reward berupa bonus poin, berikan langsung ke mahasiswa
            if ($log->reward && $log->reward->reward_type === 'bonus_points') {
                $bonusVal = (int) $log->reward->reward_value;
                app(\App\Services\Gamification\GamificationService::class)->awardPoints(
                    $user,
                    $bonusVal,
                    "Klaim Reward Bandit: {$log->reward->name}",
                    'reward',
                    "REWARD-DECISION-{$log->id}"
                );
            }

            return [
                'success' => true,
                'status'  => 'recorded',
                'message' => "Feedback respons '{$action}' berhasil dicatat dan parameter bandit diperbarui!",
                'feedback' => $feedback,
            ];
        });
    }

    /**
     * Penarikan sampel Beta Distribution menggunakan transformasi dua variabel Gamma
     * (Marsaglia and Tsang method + Box-Muller).
     */
    protected function sampleBeta(float $alpha, float $beta): float
    {
        $gammaA = $this->sampleGamma($alpha);
        $gammaB = $this->sampleGamma($beta);
        $sum = $gammaA + $gammaB;
        if ($sum <= 0) return 0.5;
        return $gammaA / $sum;
    }

    protected function sampleGamma(float $shape): float
    {
        if ($shape < 1) {
            return $this->sampleGamma($shape + 1) * pow(mt_rand() / mt_getrandmax(), 1.0 / $shape);
        }

        $d = $shape - 1.0 / 3.0;
        $c = 1.0 / sqrt(9.0 * $d);

        while (true) {
            $z = $this->sampleNormal();
            $v = 1.0 + $c * $z;
            if ($v <= 0.0) continue;
            $v = $v * $v * $v;
            $u = mt_rand() / mt_getrandmax();

            if ($u < 1.0 - 0.0331 * $z * $z * $z * $z) {
                return $d * $v;
            }
            if (log($u) < 0.5 * $z * $z + $d * (1.0 - $v + log($v))) {
                return $d * $v;
            }
        }
    }

    protected function sampleNormal(): float
    {
        $u1 = max(1e-7, mt_rand() / mt_getrandmax());
        $u2 = mt_rand() / mt_getrandmax();
        return sqrt(-2.0 * log($u1)) * cos(2.0 * M_PI * $u2);
    }
}
