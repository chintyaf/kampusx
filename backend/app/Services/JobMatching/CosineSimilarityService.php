<?php

namespace App\Services\JobMatching;

/**
 * Service untuk komputasi Vector Skill-Matrix dan Algoritma Cosine Similarity
 * guna mencocokkan kompetensi mahasiswa dengan kualifikasi lowongan industri.
 * 
 * Mendukung Rumusan Masalah 4 Tugas Akhir:
 * "Merancang dan mengintegrasikan Job Matching Engine berbasis Vector Skill-Matrix
 *  dan algoritma Cosine Similarity untuk memetakan matriks kompetensi mahasiswa
 *  dengan kualifikasi lowongan industri secara presisi."
 */
class CosineSimilarityService
{
    /**
     * Menghitung nilai Cosine Similarity antara dua vektor kompetensi numerik.
     * Sesuai Persamaan (2.1) di Bab 2 Skripsi:
     * Similarity(A, B) = (A . B) / (||A|| * ||B||)
     * 
     * @param array<string, float|int> $candidateVector Vektor keahlian mahasiswa A
     * @param array<string, float|int> $jobVector Vektor kualifikasi kebutuhan industri B
     * @return array Hasil detail komputasi matematis
     */
    public function calculateCosineSimilarity(array $candidateVector, array $jobVector): array
    {
        // Kumpulkan semua dimensi keterampilan unik dari kedua vektor
        $allDimensions = array_unique(array_merge(array_keys($candidateVector), array_keys($jobVector)));

        $dotProduct = 0.0;
        $magnitudeASquared = 0.0;
        $magnitudeBSquared = 0.0;
        $dimensionBreakdown = [];

        foreach ($allDimensions as $dim) {
            $valA = (float)($candidateVector[$dim] ?? 0.0);
            $valB = (float)($jobVector[$dim] ?? 0.0);

            $dotProduct += ($valA * $valB);
            $magnitudeASquared += ($valA * $valA);
            $magnitudeBSquared += ($valB * $valB);

            $dimensionBreakdown[$dim] = [
                'candidateValue' => $valA,
                'jobRequirement' => $valB,
                'product' => $valA * $valB
            ];
        }

        $magnitudeA = sqrt($magnitudeASquared);
        $magnitudeB = sqrt($magnitudeBSquared);

        if ($magnitudeA <= 0.0 || $magnitudeB <= 0.0) {
            $similarity = 0.0;
        } else {
            $similarity = $dotProduct / ($magnitudeA * $magnitudeB);
        }

        // Clamp nilai ke interval [0, 1]
        $similarity = max(0.0, min(1.0, $similarity));
        $matchScorePct = round($similarity * 100, 1);

        return [
            'similarity' => round($similarity, 4),
            'matchScore' => $matchScorePct,
            'dotProduct' => round($dotProduct, 2),
            'magnitudeA' => round($magnitudeA, 4),
            'magnitudeB' => round($magnitudeB, 4),
            'dimensionBreakdown' => $dimensionBreakdown,
            'formula' => 'Cosine Similarity: (A · B) / (||A|| × ||B||)'
        ];
    }

    /**
     * Menghitung metrik evaluasi Mean Reciprocal Rank (MRR)
     * Sesuai Persamaan (2.9) di Bab 2 Skripsi.
     * 
     * @param array<int> $rankPositions Posisi ranking hasil relevan pertama untuk tiap kueri
     */
    public function calculateMRR(array $rankPositions): float
    {
        if (empty($rankPositions)) {
            return 0.0;
        }

        $sumReciprocal = 0.0;
        foreach ($rankPositions as $pos) {
            if ($pos > 0) {
                $sumReciprocal += (1.0 / $pos);
            }
        }

        return round($sumReciprocal / count($rankPositions), 4);
    }

    /**
     * Menghitung metrik evaluasi Normalized Discounted Cumulative Gain (NDCG@K)
     * Sesuai Persamaan (2.11) di Bab 2 Skripsi.
     * 
     * @param array<float|int> $relevanceScores Skor relevansi aktual dari urutan rekomendasi
     * @param int $k Batasan posisi evaluasi teratas
     */
    public function calculateNDCG(array $relevanceScores, int $k = 3): float
    {
        $dcg = 0.0;
        $actualSlice = array_slice($relevanceScores, 0, $k);

        for ($i = 0; $i < count($actualSlice); $i++) {
            $rel = (float)$actualSlice[$i];
            $rank = $i + 1;
            // DCG formula: sum( (2^rel - 1) / log2(rank + 1) ) atau rel / log2(rank + 1)
            $dcg += ($rel / log($rank + 1, 2));
        }

        // Hitung IDCG (Ideal DCG dengan mengurutkan dari skor terbesar ke terkecil)
        $idealScores = $relevanceScores;
        rsort($idealScores);
        $idealSlice = array_slice($idealScores, 0, $k);

        $idcg = 0.0;
        for ($i = 0; $i < count($idealSlice); $i++) {
            $rel = (float)$idealSlice[$i];
            $rank = $i + 1;
            $idcg += ($rel / log($rank + 1, 2));
        }

        if ($idcg <= 0.0) {
            return 0.0;
        }

        return round($dcg / $idcg, 4);
    }
}
