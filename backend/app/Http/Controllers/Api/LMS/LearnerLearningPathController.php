<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningCompletion;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LmsUserBadge;
use App\Models\LmsUserCertificate;
use App\Models\UserBadge;
use App\Models\UserCertificate;
use App\Services\Lms\LearningDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LearnerLearningPathController extends Controller
{
    public function __construct(private readonly LearningDataService $learningDataService)
    {
    }
    /**
     * GET /api/lms/member/learning-paths/{id}
     * Detail learning path + status enrollment user (tanpa modul/badge).
     */
    public function show(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $path = $this->findPublishedPath($id, ['creator:id,name', 'event:id,title']);

        if (!$path) {
            return $this->notFound('Learning path not found.');
        }

        $isCompleted = LearningCompletion::where('user_id', $userId)
            ->where('learning_path_id', $path->id)
            ->whereNull('module_id')
            ->whereNull('lesson_id')
            ->exists();

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('learning_path_id', $path->id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Learning path retrieved successfully.',
            'data' => [
                'id'            => $path->id,
                'title'         => $path->title,
                'slug'          => $path->slug,
                'description'   => $path->description,
                'category'      => $path->category,
                'categories'    => $path->categories ?? [],
                'thumbnail_url' => $path->thumbnail_url,
                'published_at'  => $path->published_at?->toISOString(),
                'event_id'      => $path->event_id,
                'event'         => $path->event,
                'is_completed'  => $isCompleted,
                'enrollment'    => $enrollment ? [
                    'status'           => $enrollment->status,
                    'enrolled_at'      => $enrollment->enrolled_at,
                    'completed_at'     => $enrollment->completed_at,
                    'last_accessed_at' => $enrollment->last_accessed_at,
                ] : null,
                'instructor'    => $path->creator ? [
                    'id'   => $path->creator->id,
                    'name' => $path->creator->name,
                ] : null,
            ],
        ]);
    }

    /**
     * GET /api/lms/member/learning-paths/{id}/progress
     * Modul + lesson beserta status selesai dan metrics.
     */
    public function progress(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $path = $this->findPublishedPath($id, [
            'modules' => fn ($q) => $q->where('status', 'published')->orderBy('order_index'),
            'modules.lessons',
        ]);

        if (!$path) {
            return $this->notFound('Learning path not found.');
        }

        $moduleIds = $path->modules->pluck('id');
        $lessonIds = $path->modules->flatMap->lessons->pluck('id');

        $completions = $this->completionsFor($userId, $path->id, $moduleIds, $lessonIds);

        $lessonDone = $completions->whereNotNull('lesson_id')
            ->pluck('completed_at', 'lesson_id');

        $moduleDone = $completions->whereNotNull('module_id')
            ->whereNull('lesson_id')
            ->pluck('completed_at', 'module_id');

        $isCompleted = $completions->contains(fn ($c) =>
            $c->learning_path_id == $path->id && !$c->module_id && !$c->lesson_id
        );

        $modules = $path->modules->map(function ($module) use ($lessonDone, $moduleDone) {
            $lessons = $module->lessons->map(fn ($lesson) => [
                'id'           => $lesson->id,
                'title'        => $lesson->title,
                'type'         => $lesson->type,
                'is_completed' => $lessonDone->has($lesson->id),
                'completed_at' => $lessonDone->get($lesson->id)?->toISOString(),
            ]);

            $total     = $lessons->count();
            $completed = $lessons->where('is_completed', true)->count();
            $done      = $moduleDone->has($module->id) || ($total > 0 && $completed === $total);

            return [
                'id'                => $module->id,
                'order_index'       => $module->order_index,
                'title'             => $module->title,
                'description'       => $module->description,
                'learning_outcomes' => $module->learning_outcomes,
                'difficulty_level'  => $module->difficulty_level,
                'total_lessons'     => $total,
                'completed_lessons' => $completed,
                'progress_percent'  => $total ? (int) round($completed / $total * 100) : 0,
                'status'            => $done ? 'completed' : ($completed ? 'in_progress' : 'not_started'),
                'lessons'           => $lessons->values(),
            ];
        })->values();

        $moduleCount      = $modules->count();
        $completedModules = $modules->where('status', 'completed')->count();

        return response()->json([
            'success' => true,
            'message' => 'Learning path progress retrieved successfully.',
            'data' => [
                'learning_path_id' => $path->id,
                'is_completed'     => $isCompleted,
                'modules'          => $modules,
                'metrics'          => [
                    'moduleCount'      => $moduleCount,
                    'completedModules' => $completedModules,
                    'lessonCount'      => $modules->sum('total_lessons'),
                    'completedLessons' => $modules->sum('completed_lessons'),
                    'progressPercent'  => $moduleCount ? (int) round($completedModules / $moduleCount * 100) : 0,
                ],
            ],
        ]);
    }

    /**
     * GET /api/lms/member/learning-paths/{id}/achievements
     * Badge yang didapat dari path ini + sertifikat (jika path selesai).
     */
    public function achievements(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $path = $this->findPublishedPath($id);

        if (!$path) {
            return $this->notFound('Learning path not found.');
        }

        $moduleIds = $path->modules()->where('status', 'published')->pluck('id');
        $lessonIds = Lesson::whereIn('module_id', $moduleIds)->pluck('id');

        $completions = $this->completionsFor($userId, $path->id, $moduleIds, $lessonIds);

        $badges = LmsUserBadge::where('user_id', $userId)
            ->whereIn('completion_id', $completions->pluck('id'))
            ->orderByDesc('awarded_at')
            ->get()
            ->map(fn ($b) => [
                'code'        => $b->badge_code,
                'name'        => $b->name,
                'description' => $b->description,
                'icon'        => $b->icon,
                'earned'      => true,
                'awarded_at'  => $b->awarded_at?->toISOString(),
            ])
            ->values();

        $pathCompletion = $completions->first(fn ($c) =>
            $c->learning_path_id == $path->id && !$c->module_id && !$c->lesson_id
        );

        $cert = $pathCompletion
            ? LmsUserCertificate::where('completion_id', $pathCompletion->id)->first()
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Achievements retrieved successfully.',
            'data' => [
                'learning_path_id' => $path->id,
                'is_completed'     => (bool) $pathCompletion,
                'badges'           => $badges,
                'certificate'      => $cert ? [
                    'id'                 => $cert->id,
                    'certificate_number' => $cert->certificate_number,
                    'title'              => $cert->title,
                    'status'             => $cert->status,
                    'issued_at'          => $cert->issued_at?->toISOString(),
                    'file_path'          => $cert->file_path,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/lms/member/lessons/{lessonId}/complete
     * Tandai lesson selesai, lalu otomatis cek module & learning path.
     */
    public function completeLesson(Request $request, string $lessonId)
    {
        $data = $request->validate([
            'score'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'metadata' => ['nullable', 'array'],
        ]);

        $lesson = Lesson::with('module.learningPath')->find($lessonId);

        if (!$lesson || !$lesson->module) {
            return $this->notFound('Lesson not found.');
        }

        $user   = $request->user();
        $module = $lesson->module;
        $path   = $module->learningPath;

        $result = DB::transaction(function () use ($user, $lesson, $module, $path, $data) {
            $newBadges = [];

            // 1. Completion lesson (module_id & learning_path_id SENGAJA null,
            //    kalau diisi akan bentrok dengan unique user+module / user+path)
            $lessonCompletion = LearningCompletion::updateOrCreate(
                ['user_id' => $user->id, 'lesson_id' => $lesson->id],
                [
                    'score'        => $data['score'] ?? null,
                    'metadata'     => $data['metadata'] ?? null,
                    'completed_at' => now(),
                ]
            );

            // Badge pertama kali menyelesaikan lesson
            if (LearningCompletion::where('user_id', $user->id)->whereNotNull('lesson_id')->count() === 1) {
                $newBadges[] = $this->awardBadge($user->id, $lessonCompletion->id, 'first-lesson', 'First Step', 'Menyelesaikan lesson pertama.');
            }

            // 2. Cek apakah semua lesson di module sudah selesai
            $totalLessons = Lesson::where('module_id', $module->id)->count();
            $doneLessons  = LearningCompletion::where('user_id', $user->id)
                ->whereIn('lesson_id', Lesson::where('module_id', $module->id)->pluck('id'))
                ->count();

            $moduleCompleted = false;
            if ($totalLessons > 0 && $doneLessons >= $totalLessons) {
                $moduleCompletion = LearningCompletion::firstOrCreate(
                    ['user_id' => $user->id, 'module_id' => $module->id],
                    ['completed_at' => now()]
                );
                $moduleCompleted = $moduleCompletion->wasRecentlyCreated;

                if ($moduleCompleted) {
                    $newBadges[] = $this->awardBadge(
                        $user->id, $moduleCompletion->id,
                        "module-{$module->id}-complete",
                        'Module Complete: ' . Str::limit($module->title, 80),
                        'Menyelesaikan seluruh lesson dalam module.'
                    );
                }
            }

            // 3. Cek apakah semua module published di path sudah selesai
            $pathCompleted = false;
            $certificate   = null;

            if ($path) {
                $publishedModuleIds = $path->modules()->where('status', 'published')->pluck('id');
                $doneModules = LearningCompletion::where('user_id', $user->id)
                    ->whereIn('module_id', $publishedModuleIds)
                    ->count();

                if ($publishedModuleIds->count() > 0 && $doneModules >= $publishedModuleIds->count()) {
                    $pathCompletion = LearningCompletion::firstOrCreate(
                        ['user_id' => $user->id, 'learning_path_id' => $path->id],
                        ['completed_at' => now()]
                    );
                    $pathCompleted = $pathCompletion->wasRecentlyCreated;

                    if ($pathCompleted) {
                        $newBadges[] = $this->awardBadge(
                            $user->id, $pathCompletion->id,
                            "path-{$path->id}-complete",
                            'Path Complete: ' . Str::limit($path->title, 80),
                            'Menyelesaikan seluruh learning path.'
                        );

                        // Sertifikat dibuat berstatus pending; kirim ke KampusX lewat
                        // endpoint send-credential yang sudah ada.
                        $certificate = UserCertificate::firstOrCreate(
                            ['completion_id' => $pathCompletion->id],
                            [
                                'user_id'            => $user->id,
                                'certificate_number' => 'CERT-' . strtoupper(Str::random(10)),
                                'title'              => $path->title,
                                'status'             => 'pending',
                            ]
                        );
                    }
                }
            }

            return compact('newBadges', 'moduleCompleted', 'pathCompleted', 'certificate');
        });

        $this->learningDataService->recordLessonCompleted($user->id, $lesson, 0, [
            'module_id'        => $module->id,
            'learning_path_id' => $path?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson marked as completed.',
            'data' => [
                'lesson_id'        => $lesson->id,
                'module_completed' => $result['moduleCompleted'],
                'path_completed'   => $result['pathCompleted'],
                'new_badges'       => array_values(array_filter($result['newBadges'])),
                'certificate'      => $result['certificate'],
            ],
        ], 200);
    }

    // ------------------------------------------------------------------

    private function findPublishedPath(string $id, array $with = []): ?LearningPath
    {
        return LearningPath::with($with)
            ->where('status', 'published')
            ->where(ctype_digit($id) ? 'id' : 'slug', $id)
            ->first();
    }

    /**
     * Semua completion user yang terkait path ini (path, module, lesson).
     */
    private function completionsFor(int $userId, int $pathId, $moduleIds, $lessonIds)
    {
        return LearningCompletion::where('user_id', $userId)
            ->where(fn ($q) => $q
                ->where('learning_path_id', $pathId)
                ->orWhereIn('module_id', $moduleIds)
                ->orWhereIn('lesson_id', $lessonIds)
            )->get();
    }

    private function notFound(string $message)
    {
        return response()->json(['success' => false, 'message' => $message], 404);
    }

    /**
     * Beri badge hanya jika belum pernah didapat (unique user_id + badge_code).
     * Return null kalau sudah punya.
     */
    private function awardBadge(int $userId, int $completionId, string $code, string $name, ?string $description = null): ?UserBadge
    {
        $badge = UserBadge::firstOrCreate(
            ['user_id' => $userId, 'badge_code' => $code],
            [
                'completion_id' => $completionId,
                'name'          => $name,
                'description'   => $description,
                'awarded_at'    => now(),
            ]
        );

        return $badge->wasRecentlyCreated ? $badge : null;
    }
}
