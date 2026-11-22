<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Lesson;

class PublicLearningPathController extends Controller
{
    /**
     * GET /api/lms/public/learning-paths/{id}
     * {id} dapat berupa ID numerik atau slug.
     * Detail learning path (tanpa daftar modul/lesson).
     */
    public function show(string $id)
    {
        $path = $this->findPublishedPath($id, [
        'creator' => fn ($q) => $q
            ->select('id', 'name', 'role', 'avatar_path', 'created_at')
            ->withCount([
                'events',
                'learningPaths as published_paths_count' => fn ($q) => $q->where('status', 'published'),
            ]),
        'event:id,title',
    ]);

        if (!$path) {
            return $this->notFound('Learning path not found.');
        }

        $moduleIds = $path->modules()->where('status', 'published')->pluck('id');

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
                'instructor'    => $this->formatInstructor($path->creator),
                'metrics' => [
                    'moduleCount' => $moduleIds->count(),
                    'lessonCount' => Lesson::whereIn('module_id', $moduleIds)->count(),
                ],
            ],
        ]);
    }

    /**
     * GET /api/lms/public/learning-paths/{id}/content
     * Silabus: modul published beserta daftar lesson (tanpa isi lesson).
     */
    public function content(string $id)
    {
        $path = $this->findPublishedPath($id, [
            'modules' => fn ($q) => $q->where('status', 'published')->orderBy('order_index'),
            'modules.lessons',
        ]);

        if (!$path) {
            return $this->notFound('Learning path not found.');
        }

        $modules = $path->modules->map(fn ($module) => [
            'id'                => $module->id,
            'order_index'       => $module->order_index,
            'title'             => $module->title,
            'description'       => $module->description,
            'learning_outcomes' => $module->learning_outcomes,
            'difficulty_level'  => $module->difficulty_level,
            'total_lessons'     => $module->lessons->count(),
            'lessons'           => $module->lessons->map(fn ($lesson) => [
                'id'         => $lesson->id,
                'title'      => $lesson->title,
                'type'       => $lesson->type,
                'is_preview' => (bool) $lesson->is_preview,
            ])->values(),
        ])->values();

        return response()->json([
            'success' => true,
            'message' => 'Learning path content retrieved successfully.',
            'data' => [
                'id'      => $path->id,
                'title'   => $path->title,
                'slug'    => $path->slug,
                'modules' => $modules,
                'metrics' => [
                    'moduleCount' => $modules->count(),
                    'lessonCount' => $modules->sum('total_lessons'),
                ],
            ],
        ]);
    }

    /**
     * GET /api/lms/public/learning-paths/{id}/lessons/{lessonId}
     * Detail satu lesson. Isi lesson hanya dikirim jika is_preview = true,
     * selain itu dikembalikan sebagai locked (guest harus login/enroll).
     */
    public function lesson(string $id, string $lessonId)
    {
        $path = $this->findPublishedPath($id);

        if (!$path) {
            return $this->notFound('Learning path not found.');
        }

        // Lesson harus berada di modul published milik path ini
        $lesson = Lesson::with('module:id,title')
            ->whereHas('module', fn ($q) => $q
                ->where('learning_path_id', $path->id)
                ->where('status', 'published')
            )
            ->find($lessonId);

        if (!$lesson) {
            return $this->notFound('Lesson not found.');
        }

        $locked = !$lesson->is_preview;

        $data = [
            'id'     => $lesson->id,
            'title'  => $lesson->title,
            'type'   => $lesson->type,
            'locked' => $locked,
            'module' => [
                'id'    => $lesson->module->id,
                'title' => $lesson->module->title,
            ],
            'learning_path' => [
                'id'    => $path->id,
                'title' => $path->title,
                'slug'  => $path->slug,
            ],
        ];

        if (!$locked) {
            // Sesuaikan dengan kolom tabel lessons
            $data['content']     = $lesson->content;
            $data['content_url'] = $lesson->content_url;
        }

        return response()->json([
            'success' => true,
            'message' => 'Lesson retrieved successfully.',
            'data'    => $data,
        ]);
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
     * Data instruktur untuk OrganizerCard.
     * `role` harus ikut di-select karena organization_name bergantung padanya.
     */
    private function formatInstructor($creator): ?array
    {
        if (!$creator) {
            return null;
        }

        return [
            'id'                    => $creator->id,
            'name'                  => $creator->name,
            'organization_name'     => $creator->organization_name,
            'avatar_url'            => $creator->avatar_path
                ? asset('storage/' . $creator->avatar_path)
                : null,
            'events_count'          => $creator->events_count,
            'learning_paths_count'  => $creator->published_paths_count,
            'joined_at'             => $creator->created_at?->toISOString(),
        ];
    }

    private function notFound(string $message)
    {
        return response()->json(['success' => false, 'message' => $message], 404);
    }
}
