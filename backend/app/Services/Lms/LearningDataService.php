<?php

namespace App\Services\Lms;

use App\Models\LearningActivity;
use App\Models\LearningHistory;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use App\Models\SrlLearningSession;
use App\Models\SrlSessionMaterial;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class LearningDataService
{
    /**
     * Catat aktivitas belajar ke tabel learning_activities.
     */
    public function recordActivity(
        int $userId,
        string $activityType,
        ?Model $target = null,
        int $durationSeconds = 0,
        array $metadata = [],
        ?CarbonInterface $occurredAt = null
    ): LearningActivity {
        return LearningActivity::create([
            'user_id'          => $userId,
            'activity_type'    => $activityType,
            'target_type'      => $target?->getMorphClass(),
            'target_id'        => $target?->getKey(),
            'metadata'         => $metadata !== [] ? $metadata : null,
            'occurred_at'      => $occurredAt ?? now(),
            'duration_seconds' => max(0, $durationSeconds),
        ]);
    }

    /**
     * Buat atau perbarui progres lesson pada tabel learning_histories.
     * Status tidak akan diturunkan dari 'completed', dan progres tidak akan mundur.
     */
    public function trackLessonProgress(
        int $userId,
        int $lessonId,
        string $status = LearningHistory::STATUS_IN_PROGRESS,
        ?float $progress = null,
        int $additionalDurationSeconds = 0
    ): LearningHistory {
        return DB::transaction(function () use ($userId, $lessonId, $status, $progress, $additionalDurationSeconds) {
            $now = now();

            $history = LearningHistory::where('user_id', $userId)
                ->where('lesson_id', $lessonId)
                ->lockForUpdate()
                ->first();

            if (! $history) {
                $history = new LearningHistory([
                    'user_id'          => $userId,
                    'lesson_id'        => $lessonId,
                    'status'           => LearningHistory::STATUS_NOT_STARTED,
                    'progress'         => 0,
                    'duration_seconds' => 0,
                ]);
            }

            if (! $history->started_at && $status !== LearningHistory::STATUS_NOT_STARTED) {
                $history->started_at = $now;
            }

            if ($history->status !== LearningHistory::STATUS_COMPLETED) {
                $history->status = $status;
            }

            if ($status === LearningHistory::STATUS_COMPLETED) {
                $history->progress     = 100;
                $history->completed_at = $history->completed_at ?? $now;
            } elseif ($progress !== null) {
                $clamped           = min(100, max(0, $progress));
                $history->progress = max((float) $history->progress, $clamped);
            }

            $history->duration_seconds = (int) $history->duration_seconds + max(0, $additionalDurationSeconds);
            $history->last_accessed_at = $now;
            $history->save();

            return $history;
        });
    }

    /**
     * Catat saat learner membuka/melihat lesson.
     */
    public function recordLessonViewed(int $userId, Lesson $lesson, array $metadata = []): LearningHistory
    {
        $history = $this->trackLessonProgress(
            userId: $userId,
            lessonId: $lesson->id,
            status: LearningHistory::STATUS_IN_PROGRESS
        );

        $this->recordActivity(
            userId: $userId,
            activityType: 'lesson_viewed',
            target: $lesson,
            metadata: $metadata
        );

        $this->trackActiveSrlMaterial(
            userId: $userId,
            target: $lesson,
            activityType: 'viewed',
            metadata: $metadata
        );

        return $history;
    }

    /**
     * Catat saat learner menyelesaikan lesson.
     */
    public function recordLessonCompleted(
        int $userId,
        Lesson $lesson,
        int $durationSeconds = 0,
        array $metadata = []
    ): LearningHistory {
        $history = $this->trackLessonProgress(
            userId: $userId,
            lessonId: $lesson->id,
            status: LearningHistory::STATUS_COMPLETED,
            progress: 100,
            additionalDurationSeconds: $durationSeconds
        );

        $this->recordActivity(
            userId: $userId,
            activityType: 'lesson_completed',
            target: $lesson,
            durationSeconds: $durationSeconds,
            metadata: $metadata
        );

        $this->trackActiveSrlMaterial(
            userId: $userId,
            target: $lesson,
            activityType: 'completed',
            durationSeconds: $durationSeconds,
            isCompleted: true,
            metadata: $metadata
        );

        return $history;
    }

    /**
     * Catat saat learner memulai attempt kuis.
     */
    public function recordQuizStarted(int $userId, QuizAttempt $attempt, array $metadata = []): LearningActivity
    {
        $target = $attempt->relationLoaded('quiz') && $attempt->quiz
            ? $attempt->quiz
            : $attempt;

        $quizMetadata = array_merge([
            'quiz_id'        => $attempt->quiz_id,
            'attempt_id'     => $attempt->id,
            'attempt_number' => $attempt->attempt_number,
        ], $metadata);

        $activity = $this->recordActivity(
            userId: $userId,
            activityType: 'quiz_started',
            target: $target,
            metadata: $quizMetadata,
            occurredAt: $attempt->started_at
        );

        $this->trackActiveSrlMaterial(
            userId: $userId,
            target: $target,
            activityType: 'quiz_started',
            metadata: $quizMetadata
        );

        return $activity;
    }

    /**
     * Catat saat learner menyelesaikan/submit attempt kuis.
     */
    public function recordQuizSubmitted(int $userId, QuizAttempt $attempt, array $metadata = []): LearningActivity
    {
        $durationSeconds = ($attempt->started_at && $attempt->completed_at)
            ? (int) max(0, $attempt->started_at->diffInSeconds($attempt->completed_at))
            : 0;

        $target = $attempt->relationLoaded('quiz') && $attempt->quiz
            ? $attempt->quiz
            : $attempt;

        $quizMetadata = array_merge([
            'quiz_id'        => $attempt->quiz_id,
            'attempt_id'     => $attempt->id,
            'attempt_number' => $attempt->attempt_number,
            'score'          => $attempt->score !== null ? (float) $attempt->score : null,
            'is_passed'      => (bool) $attempt->is_passed,
        ], $metadata);

        $activity = $this->recordActivity(
            userId: $userId,
            activityType: 'quiz_submitted',
            target: $target,
            durationSeconds: $durationSeconds,
            metadata: $quizMetadata,
            occurredAt: $attempt->completed_at
        );

        $this->trackActiveSrlMaterial(
            userId: $userId,
            target: $target,
            activityType: 'quiz_attempted',
            durationSeconds: $durationSeconds,
            isCompleted: (bool) $attempt->is_passed,
            metadata: $quizMetadata
        );

        return $activity;
    }

    /**
     * Catat aktivitas dari sesi SRL (Self-Regulated Learning).
     * Jika target berupa Lesson, sekalian memperbarui learning_histories.
     */
    public function recordSrlSessionActivity(
        int $userId,
        SrlLearningSession $session,
        string $activityType,
        ?Model $target = null,
        int $durationSeconds = 0,
        array $metadata = []
    ): LearningActivity {
        if ($target instanceof Lesson) {
            $isCompleted = (bool) ($metadata['is_completed'] ?? false);
            $this->trackLessonProgress(
                userId: $userId,
                lessonId: $target->id,
                status: $isCompleted ? LearningHistory::STATUS_COMPLETED : LearningHistory::STATUS_IN_PROGRESS,
                progress: $isCompleted ? 100 : null,
                additionalDurationSeconds: $durationSeconds
            );
        }

        return $this->recordActivity(
            userId: $userId,
            activityType: $activityType,
            target: $target ?? $session,
            durationSeconds: $durationSeconds,
            metadata: array_merge([
                'srl_session_id' => $session->id,
            ], $metadata)
        );
    }

    /**
     * Catat materi yang diakses ke tabel srl_session_materials jika user
     * memiliki sesi SRL yang sedang berjalan (in_progress).
     */
    public function trackActiveSrlMaterial(
        int $userId,
        Model $target,
        string $activityType = 'viewed',
        int $durationSeconds = 0,
        bool $isCompleted = false,
        array $metadata = []
    ): ?SrlSessionMaterial {
        $session = SrlLearningSession::where('user_id', $userId)
            ->inProgress()
            ->latest('id')
            ->first();

        if (! $session) {
            return null;
        }

        return $session->trackMaterial(
            target: $target,
            activityType: $activityType,
            additionalSeconds: $durationSeconds,
            isCompleted: $isCompleted,
            metadata: $metadata
        );
    }
}
