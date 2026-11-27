<?php

namespace App\Services\JobMatching;

class JobMatchingSimilarityService
{
    public function calculate(array $vectorA, array $vectorB): float
    {
        $dotProduct = 0;
        $magnitudeA = 0;
        $magnitudeB = 0;

        foreach ($vectorA as $key => $valueA) {
            $valueB = $vectorB[$key] ?? 0;

            $dotProduct += $valueA * $valueB;

            $magnitudeA += $valueA ** 2;
            $magnitudeB += $valueB ** 2;
        }

        if ($magnitudeA == 0 || $magnitudeB == 0) {
            return 0;
        }

        $similarity = $dotProduct /
            (sqrt($magnitudeA) * sqrt($magnitudeB));

        return round($similarity, 5);
    }
}
