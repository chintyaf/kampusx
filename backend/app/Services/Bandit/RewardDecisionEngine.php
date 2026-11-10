<?php

namespace App\Services\Bandit;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * Service Reward Decision Engine berbasis Algoritma Contextual Bandit (Thompson Sampling)
 * dengan Batasan Anggaran DISCO (Discount Optimization / Integer Programming Constraint).
 * Sesuai Flow 3 Rumusan Masalah 3 Tugas Akhir.
 */
class RewardDecisionEngine
{
    // 3 Pilihan Reward (Arms)
    const ARM_DISCOUNT_10 = 'DISCOUNT_10';     // Diskon 10%
    const ARM_DISCOUNT_25 = 'DISCOUNT_25';     // Diskon 25%
    const ARM_BONUS_POINTS = 'BONUS_POINTS';   // Cashback 200 Poin Gamifikasi

    /**
     * Memilih reward optimal untuk pengguna berdasarkan konteks (Tier, History)
     * dan batasan sisa anggaran promosi event (DISCO constraint).
     */
    public function selectOptimalReward(Event $event, User $user, float $basePrice): array
    {
        // 1. Dapatkan sisa budget promosi event dari cache/database (Default Rp 500.000 per event)
        $budgetKey = "event_promo_budget:event_{$event->id}";
        $remainingBudget = Cache::get($budgetKey, 500000.0);

        // 2. Hitung biaya finansial untuk tiap Arm
        $cost25 = $basePrice * 0.25;
        $cost10 = $basePrice * 0.10;
        $costPoints = 0.0; // Biaya anggaran rupiah adalah 0 (ditanggung sistem gamifikasi)

        // 3. Terapkan DISCO Constraint (Integer Programming Feasibility Check):
        // Jika sisa anggaran tidak mencukupi, diskon yang melebihi batas dieliminasi dari kandidat Arm.
        $availableArms = [self::ARM_BONUS_POINTS]; // Selalu feasible

        if ($remainingBudget >= $cost10 && $basePrice > 0) {
            $availableArms[] = self::ARM_DISCOUNT_10;
        }

        if ($remainingBudget >= $cost25 && $basePrice > 0) {
            $availableArms[] = self::ARM_DISCOUNT_25;
        }

        // 4. Parameter Prior Beta Distribution [alpha (sukses), beta (gagal)] per Arm & per Tier
        // Konteks: Tier mahasiswa memengaruhi probabilitas respons
        $userTier = $user->tier ?? $user->calculateTier();
        $priors = $this->getPriorsForTier($userTier);

        // 5. Eksekusi Thompson Sampling:
        // Ambil sampel acak dari distribusi Beta(alpha, beta) untuk setiap Arm yang feasible
        $bestArm = null;
        $maxSample = -1.0;
        $samplesLog = [];

        foreach ($availableArms as $arm) {
            $alpha = $priors[$arm]['alpha'];
            $beta = $priors[$arm]['beta'];

            // Lakukan penarikan sampel dari Beta Distribution
            $thetaSample = $this->sampleBeta($alpha, $beta);
            $samplesLog[$arm] = round($thetaSample, 4);

            if ($thetaSample > $maxSample) {
                $maxSample = $thetaSample;
                $bestArm = $arm;
            }
        }

        if (!$bestArm) {
            $bestArm = self::ARM_BONUS_POINTS;
        }

        // 6. Formulasikan rincian reward terpilih
        $discountPercent = 0;
        $discountAmount = 0.0;
        $bonusPoints = 0;
        $rewardLabel = '';
        $badgeText = '';

        switch ($bestArm) {
            case self::ARM_DISCOUNT_25:
                $discountPercent = 25;
                $discountAmount = round($basePrice * 0.25);
                $rewardLabel = 'Diskon Eksklusif 25%';
                $badgeText = '🤖 AI Bandit: Diskon Spesial 25% Terpilih!';
                break;

            case self::ARM_DISCOUNT_10:
                $discountPercent = 10;
                $discountAmount = round($basePrice * 0.10);
                $rewardLabel = 'Diskon Kilat 10%';
                $badgeText = '🤖 AI Bandit: Diskon Kilat 10% Terpilih!';
                break;

            case self::ARM_BONUS_POINTS:
            default:
                $bonusPoints = 200;
                $rewardLabel = 'Cashback 200 Poin Gamifikasi';
                $badgeText = '🤖 AI Bandit: Bonus 200 Poin Gamifikasi!';
                break;
        }

        return [
            'selected_arm'     => $bestArm,
            'reward_label'     => $rewardLabel,
            'badge_text'       => $badgeText,
            'discount_percent' => $discountPercent,
            'discount_amount'  => $discountAmount,
            'bonus_points'     => $bonusPoints,
            'user_tier'        => $userTier,
            'remaining_budget' => $remainingBudget,
            'thompson_samples' => $samplesLog,
            'disco_feasible_arms' => $availableArms,
        ];
    }

    /**
     * Konfigurasi parameter prior Thompson Sampling berdasarkan User Tier.
     */
    protected function getPriorsForTier(string $tier): array
    {
        switch (strtoupper($tier)) {
            case 'PLATINUM':
            case 'DIAMOND':
                // User tier tinggi menyukai bonus reward & diskon besar
                return [
                    self::ARM_DISCOUNT_25 => ['alpha' => 9, 'beta' => 2],
                    self::ARM_DISCOUNT_10 => ['alpha' => 6, 'beta' => 4],
                    self::ARM_BONUS_POINTS => ['alpha' => 8, 'beta' => 3],
                ];

            case 'GOLD':
                return [
                    self::ARM_DISCOUNT_25 => ['alpha' => 7, 'beta' => 3],
                    self::ARM_DISCOUNT_10 => ['alpha' => 8, 'beta' => 3],
                    self::ARM_BONUS_POINTS => ['alpha' => 6, 'beta' => 4],
                ];

            case 'SILVER':
            case 'BRONZE':
            default:
                // User baru lebih responsif terhadap diskon instan 10%
                return [
                    self::ARM_DISCOUNT_25 => ['alpha' => 5, 'beta' => 5],
                    self::ARM_DISCOUNT_10 => ['alpha' => 9, 'beta' => 2],
                    self::ARM_BONUS_POINTS => ['alpha' => 5, 'beta' => 5],
                ];
        }
    }

    /**
     * Generator penarikan sampel acak terdistribusi Beta(alpha, beta)
     * Menggunakan metode transformasi dua variabel Gamma (Johnk's generator).
     */
    protected function sampleBeta(float $alpha, float $beta): float
    {
        $gammaA = $this->sampleGamma($alpha);
        $gammaB = $this->sampleGamma($beta);
        $total = $gammaA + $gammaB;
        if ($total == 0) return 0.5;
        return $gammaA / $total;
    }

    protected function sampleGamma(float $shape): float
    {
        // Marsaglia and Tsang method untuk Gamma(shape, 1)
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
        // Box-Muller transform
        $u1 = max(1e-7, mt_rand() / mt_getrandmax());
        $u2 = mt_rand() / mt_getrandmax();
        return sqrt(-2.0 * log($u1)) * cos(2.0 * M_PI * $u2);
    }
}
