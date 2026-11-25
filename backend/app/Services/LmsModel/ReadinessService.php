<?php

namespace App\Services\LmsModel;

use App\Models\QuizAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReadinessService
{
    /** Return readiness_level ('belum_siap'|'cukup_siap'|'siap') atau null kalau gagal. */
    public function predict(QuizAttempt $attempt, int $moduleId): ?string
    {
        $features = $this->buildFeatures($attempt, $moduleId);

        try {
            $res = Http::timeout(5)
                ->acceptJson()
                ->post(config('services.ml.url') . '/predict/readiness', $features);

            if (!$res->successful()) {
                Log::warning('ML readiness gagal', ['status' => $res->status(), 'body' => $res->body()]);
                return null;
            }

            $data = $res->json();
        } catch (\Throwable $e) {
            Log::warning('ML service tidak bisa dihubungi: ' . $e->getMessage());
            return null;
        }

        DB::table('readiness_predictions')->insert([
            'user_id'         => $attempt->user_id,
            'quiz_attempt_id' => $attempt->id,
            'model_version'   => $data['model_version'] ?? 'rf-v1',
            'readiness_score' => $data['readiness_score'],
            'readiness_level' => $data['readiness_level'],
            'features'        => json_encode($features),
            'predicted_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return $data['readiness_level'];
    }

    private function buildFeatures(QuizAttempt $attempt, int $moduleId): array
    {
        $userId = $attempt->user_id;

        // Hanya data SEBELUM attempt ini (supaya tidak bocor)
        $scores = QuizAttempt::where('user_id', $userId)
            ->whereIn('status', ['submitted', 'graded'])
            ->where('id', '<', $attempt->id)
            ->whereNotNull('score')
            ->orderBy('id')
            ->pluck('score')
            ->map(fn ($s) => (float) $s)
            ->values();

        $n = $scores->count();
        $priorAvg   = $n ? $scores->avg() : 0;
        $priorTrend = $n >= 2 ? $scores[$n - 1] - $scores[$n - 2] : 0;

        // Lesson di modul ini
        $lessonIds = DB::table('lessons')->where('module_id', $moduleId)->pluck('id');

        $history = DB::table('learning_histories')
            ->where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds);

        $studyMinutes = (clone $history)->sum('duration_seconds') / 60;
        $completed    = (clone $history)->where('status', 'completed')->count();
        $completion   = $lessonIds->count() ? ($completed / $lessonIds->count()) * 100 : 0;

        $activityCount = DB::table('learning_activities')
            ->where('user_id', $userId)
            ->where('occurred_at', '<', $attempt->started_at)
            ->count();

        return [
            'prior_avg_score'        => round(min(max($priorAvg, 0), 100), 2),
            'prior_score_trend'      => round($priorTrend, 2),
            'prior_attempts'         => $n,
            'study_duration_minutes' => round($studyMinutes, 2),
            'activity_frequency'     => $activityCount,
            'completion_rate'        => round(min(max($completion, 0), 100), 2),
        ];
    }
}
