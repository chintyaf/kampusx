<?php

namespace App\Services\Lms;

use App\Models\Enrollment;
use App\Models\LearningCompletion;
use App\Models\LearningPath;
use App\Models\LmsUserBadge;
use App\Models\Module;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service terpusat untuk mengelola cascade completion:
 *   Lesson selesai → cek Module → cek Learning Path
 *
 * Setiap level completion disimpan di tabel `learning_completions`,
 * badge diberikan di `lms_user_badges`, dan data belajar
 * dicatat melalui LearningDataService.
 */
class CompletionService
{
    public function __construct(
        private readonly LearningDataService $learningDataService,
    ) {}

    // ================================================================
    // 1. LESSON COMPLETED
    // ================================================================

    /**
     * Dipanggil setelah lesson ditandai selesai.
     * Mengecek apakah seluruh lesson dalam modul sudah complete,
     * dan jika iya (+ kuis lulus) → cascade ke module & path.
     *
     * @return array{
     *   lesson_completion: LearningCompletion,
     *   module_completed: bool,
     *   path_completed: bool,
     *   badges_awarded: array,
     * }
     */
    public function onLessonCompleted(
        User $user,
        Module $module,
        int $lessonId,
        int $durationSeconds = 0,
        bool $isFirstCompletion = true,
    ): array {
        $result = [
            'lesson_completion' => null,
            'module_completed'  => false,
            'path_completed'    => false,
            'badges_awarded'    => [],
        ];

        // 1a. Simpan/pastikan lesson completion
        $result['lesson_completion'] = LearningCompletion::firstOrCreate(
            [
                'user_id'   => $user->id,
                'lesson_id' => $lessonId,
            ],
            [
                'module_id'        => $module->id,
                'learning_path_id' => $module->learning_path_id,
                'completed_at'     => now(),
                'metadata'         => [
                    'duration_seconds' => $durationSeconds,
                ],
            ]
        );

        // 1b. Catat ke learning data (learning_histories + learning_activities)
        if ($isFirstCompletion) {
            $lesson = $module->lessons()->find($lessonId);
            if ($lesson) {
                $this->learningDataService->recordLessonCompleted(
                    userId: $user->id,
                    lesson: $lesson,
                    durationSeconds: $durationSeconds,
                    metadata: [
                        'module_id'           => $module->id,
                        'is_first_completion' => true,
                        'triggered_by'        => 'completion_service',
                    ]
                );
            }
        }

        // 1c. Badge: Lesson pertama selesai
        $totalLessonCompletions = LearningCompletion::where('user_id', $user->id)
            ->whereNotNull('lesson_id')
            ->count();

        if ($totalLessonCompletions === 1) {
            $result['badges_awarded'][] = $this->awardBadge(
                $user,
                'FIRST_LESSON',
                'Langkah Pertama',
                'Menyelesaikan lesson pertama',
                '🎯',
                $result['lesson_completion']->id,
            );
        }

        // 1d. Badge: 10 lesson selesai
        if ($totalLessonCompletions === 10) {
            $result['badges_awarded'][] = $this->awardBadge(
                $user,
                'LESSON_10',
                'Pelajar Tekun',
                'Menyelesaikan 10 lesson',
                '📚',
                $result['lesson_completion']->id,
            );
        }

        // 1e. Cek apakah modul bisa di-complete
        $moduleResult = $this->checkAndCompleteModule($user, $module);
        $result['module_completed'] = $moduleResult['module_completed'];
        $result['path_completed']   = $moduleResult['path_completed'];
        $result['badges_awarded']   = array_merge(
            $result['badges_awarded'],
            $moduleResult['badges_awarded']
        );

        // Filter null badges
        $result['badges_awarded'] = array_values(array_filter($result['badges_awarded']));

        return $result;
    }

    // ================================================================
    // 2. QUIZ PASSED — Trigger module completion check
    // ================================================================

    /**
     * Dipanggil setelah quiz attempt dinilai lulus.
     * Mengecek apakah modul bisa ditandai selesai.
     *
     * @return array{
     *   module_completed: bool,
     *   path_completed: bool,
     *   badges_awarded: array,
     * }
     */
    public function onQuizPassed(
        User $user,
        Module $module,
        QuizAttempt $attempt,
    ): array {
        $result = [
            'module_completed' => false,
            'path_completed'   => false,
            'badges_awarded'   => [],
        ];

        // Badge: skor sempurna (100)
        if ((float) $attempt->score >= 100) {
            $badge = $this->awardBadge(
                $user,
                'PERFECT_QUIZ',
                'Skor Sempurna',
                'Mendapatkan skor 100 pada kuis',
                '💯',
            );
            if ($badge) {
                $result['badges_awarded'][] = $badge;
            }
        }

        // Cek cascade module → path
        $moduleResult = $this->checkAndCompleteModule($user, $module);
        $result['module_completed'] = $moduleResult['module_completed'];
        $result['path_completed']   = $moduleResult['path_completed'];
        $result['badges_awarded']   = array_merge(
            $result['badges_awarded'],
            $moduleResult['badges_awarded']
        );

        $result['badges_awarded'] = array_values(array_filter($result['badges_awarded']));

        return $result;
    }

    // ================================================================
    // 3. CHECK & COMPLETE MODULE
    // ================================================================

    /**
     * Cek apakah semua syarat modul terpenuhi:
     *   - Semua lesson published sudah di-complete
     *   - Kuis modul (jika ada) sudah lulus
     *
     * Jika ya, buat LearningCompletion untuk module_id.
     */
    public function checkAndCompleteModule(User $user, Module $module): array
    {
        $result = [
            'module_completed' => false,
            'path_completed'   => false,
            'badges_awarded'   => [],
        ];

        // Sudah ada completion modul? Skip.
        $existing = LearningCompletion::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->whereNull('lesson_id')
            ->first();

        if ($existing) {
            $result['module_completed'] = true;
            return $result;
        }

        // Cek semua lesson selesai
        $publishedLessonIds = $module->lessons()
            ->where('status', 'published')
            ->pluck('id');

        if ($publishedLessonIds->isEmpty()) {
            return $result;
        }

        $completedLessonCount = LearningCompletion::where('user_id', $user->id)
            ->whereIn('lesson_id', $publishedLessonIds)
            ->count();

        $allLessonsDone = $completedLessonCount >= $publishedLessonIds->count();

        // Cek kuis lulus (jika modul punya kuis)
        $quiz = $module->quiz;
        $quizPassed = true; // Default: tanpa kuis = lulus

        if ($quiz) {
            $quizPassed = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->where('is_passed', true)
                ->exists();
        }

        if (!$allLessonsDone || !$quizPassed) {
            return $result;
        }

        // Semua syarat terpenuhi → complete module
        return DB::transaction(function () use ($user, $module, &$result) {
            // Double-check dalam transaction
            $alreadyExists = LearningCompletion::where('user_id', $user->id)
                ->where('module_id', $module->id)
                ->whereNull('lesson_id')
                ->lockForUpdate()
                ->exists();

            if ($alreadyExists) {
                $result['module_completed'] = true;
                return $result;
            }

            $moduleCompletion = LearningCompletion::create([
                'user_id'          => $user->id,
                'module_id'        => $module->id,
                'learning_path_id' => $module->learning_path_id,
                'completed_at'     => now(),
                'metadata'         => [
                    'title'          => $module->title,
                    'lesson_count'   => $module->lessons()->where('status', 'published')->count(),
                    'triggered_by'   => 'completion_service',
                ],
            ]);

            $result['module_completed'] = true;

            // Catat activity modul selesai
            $this->learningDataService->recordActivity(
                userId: $user->id,
                activityType: 'module_completed',
                target: $module,
                metadata: [
                    'completion_id' => $moduleCompletion->id,
                ]
            );

            Log::info('Module completed', [
                'user_id'   => $user->id,
                'module_id' => $module->id,
                'title'     => $module->title,
            ]);

            // Badge: modul pertama selesai
            $totalModuleCompletions = LearningCompletion::where('user_id', $user->id)
                ->whereNotNull('module_id')
                ->whereNull('lesson_id')
                ->count();

            if ($totalModuleCompletions === 1) {
                $badge = $this->awardBadge(
                    $user,
                    'FIRST_MODULE',
                    'Penakluk Modul',
                    'Menyelesaikan modul pertama',
                    '🏅',
                    $moduleCompletion->id,
                );
                if ($badge) {
                    $result['badges_awarded'][] = $badge;
                }
            }

            // Badge: 5 modul selesai
            if ($totalModuleCompletions === 5) {
                $badge = $this->awardBadge(
                    $user,
                    'MODULE_5',
                    'Ahli Modul',
                    'Menyelesaikan 5 modul',
                    '🎓',
                    $moduleCompletion->id,
                );
                if ($badge) {
                    $result['badges_awarded'][] = $badge;
                }
            }

            // Cek cascade ke learning path
            if ($module->learning_path_id) {
                $pathResult = $this->checkAndCompleteLearningPath(
                    $user,
                    $module->learningPath,
                    $moduleCompletion->id,
                );
                $result['path_completed']   = $pathResult['path_completed'];
                $result['badges_awarded']   = array_merge(
                    $result['badges_awarded'],
                    $pathResult['badges_awarded']
                );
            }

            return $result;
        });
    }

    // ================================================================
    // 4. CHECK & COMPLETE LEARNING PATH
    // ================================================================

    /**
     * Cek apakah semua modul published dalam learning path sudah selesai.
     * Jika ya, buat LearningCompletion untuk learning_path_id
     * dan update enrollment status ke 'completed'.
     */
    public function checkAndCompleteLearningPath(
        User $user,
        LearningPath $learningPath,
        ?int $triggerCompletionId = null,
    ): array {
        $result = [
            'path_completed' => false,
            'badges_awarded' => [],
        ];

        // Sudah ada?
        $existing = LearningCompletion::where('user_id', $user->id)
            ->where('learning_path_id', $learningPath->id)
            ->whereNull('module_id')
            ->whereNull('lesson_id')
            ->first();

        if ($existing) {
            $result['path_completed'] = true;
            return $result;
        }

        // Cek semua modul published selesai
        $publishedModuleIds = $learningPath->modules()
            ->where('status', 'published')
            ->pluck('id');

        if ($publishedModuleIds->isEmpty()) {
            return $result;
        }

        $completedModuleCount = LearningCompletion::where('user_id', $user->id)
            ->whereIn('module_id', $publishedModuleIds)
            ->whereNull('lesson_id') // hanya module-level completions
            ->count();

        if ($completedModuleCount < $publishedModuleIds->count()) {
            return $result;
        }

        // Semua modul selesai → complete learning path
        $pathCompletion = LearningCompletion::create([
            'user_id'          => $user->id,
            'learning_path_id' => $learningPath->id,
            'completed_at'     => now(),
            'metadata'         => [
                'title'                 => $learningPath->title,
                'module_count'          => $publishedModuleIds->count(),
                'trigger_completion_id' => $triggerCompletionId,
                'triggered_by'          => 'completion_service',
            ],
        ]);

        $result['path_completed'] = true;

        // Update enrollment status
        Enrollment::where('user_id', $user->id)
            ->where('learning_path_id', $learningPath->id)
            ->whereNull('completed_at')
            ->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

        // Catat activity
        $this->learningDataService->recordActivity(
            userId: $user->id,
            activityType: 'learning_path_completed',
            target: $learningPath,
            metadata: [
                'completion_id' => $pathCompletion->id,
            ]
        );

        Log::info('Learning path completed', [
            'user_id'          => $user->id,
            'learning_path_id' => $learningPath->id,
            'title'            => $learningPath->title,
        ]);

        // Badge: learning path pertama selesai
        $totalPathCompletions = LearningCompletion::where('user_id', $user->id)
            ->whereNotNull('learning_path_id')
            ->whereNull('module_id')
            ->whereNull('lesson_id')
            ->count();

        if ($totalPathCompletions === 1) {
            $badge = $this->awardBadge(
                $user,
                'FIRST_PATH',
                'Penjelajah Ilmu',
                'Menyelesaikan learning path pertama',
                '🏆',
                $pathCompletion->id,
            );
            if ($badge) {
                $result['badges_awarded'][] = $badge;
            }
        }

        // Badge: 3 path selesai
        if ($totalPathCompletions === 3) {
            $badge = $this->awardBadge(
                $user,
                'PATH_3',
                'Master Pembelajaran',
                'Menyelesaikan 3 learning path',
                '👑',
                $pathCompletion->id,
            );
            if ($badge) {
                $result['badges_awarded'][] = $badge;
            }
        }

        $result['badges_awarded'] = array_values(array_filter($result['badges_awarded']));

        return $result;
    }

    // ================================================================
    // HELPER: Award LMS Badge
    // ================================================================

    /**
     * Berikan badge ke user (idempotent: tidak duplikat).
     * Badge disimpan di tabel `lms_user_badges`.
     */
    private function awardBadge(
        User $user,
        string $badgeCode,
        string $name,
        string $description,
        string $icon = '🏅',
        ?int $completionId = null,
    ): ?array {
        $exists = LmsUserBadge::where('user_id', $user->id)
            ->where('badge_code', $badgeCode)
            ->exists();

        if ($exists) {
            return null;
        }

        $badge = LmsUserBadge::create([
            'user_id'       => $user->id,
            'completion_id' => $completionId,
            'badge_code'    => $badgeCode,
            'name'          => $name,
            'description'   => $description,
            'icon'          => $icon,
            'awarded_at'    => now(),
        ]);

        Log::info('LMS Badge awarded', [
            'user_id'    => $user->id,
            'badge_code' => $badgeCode,
            'name'       => $name,
        ]);

        return [
            'id'          => $badge->id,
            'badge_code'  => $badgeCode,
            'name'        => $name,
            'description' => $description,
            'icon'        => $icon,
            'awarded_at'  => $badge->awarded_at->toIso8601String(),
        ];
    }
}
