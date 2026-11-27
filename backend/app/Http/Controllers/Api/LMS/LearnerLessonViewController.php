<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LearningCompletion;
use App\Models\Module;
use App\Services\Lms\CompletionService;
use App\Services\Lms\LearningDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class LearnerLessonViewController extends Controller
{
    public function __construct(
        private readonly LearningDataService $learningDataService,
        private readonly CompletionService $completionService,
    ) {}

    /**
     * GET /lms/member/modules/{moduleId}/lessons
     * Data sidebar: info modul, daftar lesson, progress, dan kuis modul.
     */
    public function index(Request $request, int $moduleId): JsonResponse
    {
        $user   = $request->user();
        $module = $this->resolvePublishedModule($moduleId);

        $lessons      = $module->lessons()->where('status', 'published')->get();
        $completedIds = $this->completedLessonIds($user->id, $lessons->pluck('id'));

        $quiz = $module->quiz;

        return response()->json([
            'success' => true,
            'data'    => [
                'module' => [
                    'id'               => $module->id,
                    'learning_path_id' => $module->learning_path_id,
                    'title'            => $module->title,
                    'description'      => $module->description,
                ],
                'lessons' => $lessons->map(fn (Lesson $lesson) => [
                    'id'               => $lesson->id,
                    'module_id'        => $lesson->module_id,
                    'title'            => $lesson->title,
                    'type'             => $lesson->type,
                    'duration_minutes' => $lesson->duration_minutes,
                    'order_index'      => $lesson->order_index,
                    'is_completed'     => in_array($lesson->id, $completedIds, true),
                ])->values(),
                'completed_lesson_ids' => $completedIds,
                'progress'             => $this->buildProgress($lessons->count(), count($completedIds)),
                'quiz'                 => $quiz ? [
                    'id'    => $quiz->id,
                    'title' => $quiz->title ?? 'Kuis Modul',
                ] : null,
            ],
        ]);
    }

    /**
     * GET /lms/member/modules/{moduleId}/lessons/{lessonId}
     * Konten lesson aktif + navigasi sebelumnya/selanjutnya.
     */
    public function show(Request $request, int $moduleId, int $lessonId): JsonResponse
    {
        $user   = $request->user();
        $module = $this->resolvePublishedModule($moduleId);

        $lessons = $module->lessons()->where('status', 'published')->get();
        $lesson  = $lessons->firstWhere('id', $lessonId);

        abort_if(!$lesson, 404, 'Lesson tidak ditemukan.');

        $index = $lessons->search(fn ($l) => $l->id === $lesson->id);
        $prev  = $lessons->get($index - 1);
        $next  = $lessons->get($index + 1);

        $isCompleted = LearningCompletion::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->exists();

        $this->learningDataService->recordLessonViewed($user->id, $lesson, [
            'module_id' => $module->id,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'               => $lesson->id,
                'module_id'        => $lesson->module_id,
                'module_title'     => $module->title,
                'title'            => $lesson->title,
                'type'             => $lesson->type,
                'summary'          => $lesson->summary,
                'content'          => $lesson->content,
                'video_url'        => $lesson->video_url,
                'attachments'      => $lesson->attachments ?? [],
                'duration_minutes' => $lesson->duration_minutes,
                'xp'               => $lesson->xp,
                'order_index'      => $lesson->order_index,
                'is_completed'     => $isCompleted,
                'is_first'         => $index === 0,
                'is_last'          => $index === $lessons->count() - 1,
                'prev_lesson_id'   => $prev?->id,
                'next_lesson_id'   => $next?->id,
            ],
        ]);
    }

    /**
     * POST /lms/member/modules/{moduleId}/lessons/{lessonId}/complete
     * Body: { "duration_seconds": 195 }  (opsional)
     * Idempotent: memanggil ulang tidak membuat duplikat / XP ganda.
     */
    public function complete(Request $request, int $moduleId, int $lessonId): JsonResponse
    {
        $validated = $request->validate([
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
        ]);

        $user   = $request->user();
        $module = $this->resolvePublishedModule($moduleId);

        $lessons = $module->lessons()->where('status', 'published')->get();
        $lesson  = $lessons->firstWhere('id', $lessonId);

        abort_if(!$lesson, 404, 'Lesson tidak ditemukan.');

        $durationSeconds = (int) ($validated['duration_seconds'] ?? 0);

        // Cek apakah sudah pernah complete sebelumnya
        $alreadyCompleted = LearningCompletion::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->exists();

        $firstTime = !$alreadyCompleted;

        // Gunakan CompletionService untuk cascade: lesson → module → path + badges
        $completionResult = $this->completionService->onLessonCompleted(
            user: $user,
            module: $module,
            lessonId: $lesson->id,
            durationSeconds: $durationSeconds,
            isFirstCompletion: $firstTime,
        );

        $completedIds = $this->completedLessonIds($user->id, $lessons->pluck('id'));

        $index = $lessons->search(fn ($l) => $l->id === $lesson->id);
        $next  = $lessons->get($index + 1);

        return response()->json([
            'success' => true,
            'message' => $firstTime ? 'Lesson selesai.' : 'Lesson sudah pernah diselesaikan.',
            'data'    => [
                'lesson_id'            => $lesson->id,
                'is_first_completion'  => $firstTime,
                'xp_earned'            => $firstTime ? (int) $lesson->xp : 0,
                'duration_seconds'     => $durationSeconds,
                'is_last'              => $next === null,
                'next_lesson_id'       => $next?->id,
                'completed_lesson_ids' => $completedIds,
                'progress'             => $this->buildProgress($lessons->count(), count($completedIds)),
                // Info cascade completion
                'module_completed'     => $completionResult['module_completed'],
                'path_completed'       => $completionResult['path_completed'],
                'badges_awarded'       => $completionResult['badges_awarded'],
            ],
        ]);
    }

    // ====================================================
    // Helpers
    // ====================================================

    /**
     * Ambil modul yang published (tanpa cek enrollment untuk saat ini).
     */
    private function resolvePublishedModule(int $moduleId): Module
    {
        return Module::with('quiz')
            ->where('status', 'published')
            ->findOrFail($moduleId);
    }

    /**
     * ID lesson yang sudah diselesaikan user (di antara lesson yang diberikan).
     */
    private function completedLessonIds(int $userId, Collection $lessonIds): array
    {
        return LearningCompletion::where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds)
            ->pluck('lesson_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    private function buildProgress(int $total, int $completed): array
    {
        return [
            'completed' => $completed,
            'total'     => $total,
            'percent'   => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
        ];
    }
}
