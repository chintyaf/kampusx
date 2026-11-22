<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExploreLmsController extends Controller
{
    /**
     * Mengambil seluruh katalog materi Explore Microlearning
     * (Learning Path, Module, Lesson) beserta opsi filter dinamis dari database
     * URL: GET /api/lms/explore
     */
    public function index(Request $request): JsonResponse
    {
        $items = collect();

        // 1. Ambil Learning Paths dari Database
        $learningPaths = LearningPath::with(['modules.lessons'])
            ->where('status', 'published')
            ->get();

        if ($learningPaths->isEmpty()) {
            $learningPaths = LearningPath::with(['modules.lessons'])->get();
        }

        foreach ($learningPaths as $lp) {
            $totalDuration = $lp->modules->flatMap->lessons->sum('duration_minutes');
            if ($totalDuration <= 0) {
                $totalDuration = max(60, $lp->modules->count() * 45);
            }

            $lessonCount = $lp->modules->flatMap->lessons->count();
            if ($lessonCount === 0) {
                $lessonCount = max(6, $lp->modules->count() * 4);
            }

            $categories = is_array($lp->categories) && !empty($lp->categories)
                ? $lp->categories
                : [$lp->category ?? 'Software Engineering', 'Microlearning'];

            $items->push([
                'id'                 => 'lp-' . $lp->id,
                'rawId'              => $lp->id,
                'slug'              => $lp->slug,
                'type'               => 'learning_path',
                'title'              => $lp->title,
                'description'        => $lp->description ?? 'Jalur belajar terstruktur untuk menguasai keahlian secara komprehensif.',
                'category'           => $lp->category ?? 'Software Engineering',
                'level'              => 'Menengah',
                'durationMinutes'    => $totalDuration,
                'durationLabel'      => $this->formatDurationLabel($totalDuration),
                'durationRange'      => $this->getDurationRange($totalDuration),
                'mediaType'          => 'Video',
                'moduleCount'        => $lp->modules->count() ?: 3,
                'lessonCount'        => $lessonCount,
                'rating'             => 4.95,
                'enrolledCount'      => 1420 + ($lp->id * 35),
                'aiRecommended'      => true,
                'supportsWeeklyGoal' => true,
                'thumbnail'          => $lp->thumbnail_url ?? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
                'tags'               => $categories,
                'updatedAt'          => $lp->updated_at ? $lp->updated_at->format('Y-m-d') : '2026-09-20',
            ]);
        }

        // 2. Ambil Modules dari Database
        $modules = Module::with(['lessons.skills', 'learningPath'])
            ->where('status', 'published')
            ->get();

        if ($modules->isEmpty()) {
            $modules = Module::with(['lessons.skills', 'learningPath'])->get();
        }

        foreach ($modules as $mod) {
            $duration = $mod->lessons->sum('duration_minutes');
            if ($duration <= 0) {
                $duration = 35;
            }

            $lessonCount = $mod->lessons->count();
            if ($lessonCount === 0) {
                $lessonCount = 5;
            }

            $skills = $mod->lessons->flatMap->skills->pluck('name')->unique()->values()->all();
            if (empty($skills)) {
                $skills = ['Architecture', 'REST API', 'Backend'];
            }

            $items->push([
                'id'                 => 'mod-' . $mod->id,
                'rawId'              => $mod->id,
                'type'               => 'module',
                'title'              => $mod->title,
                'description'        => $mod->description ?? 'Modul pembelajaran terarah dengan fokus penerapan praktis.',
                'category'           => $mod->learningPath?->category ?? 'Web Development',
                'level'              => $this->mapDifficultyLevel($mod->difficulty_level),
                'durationMinutes'    => $duration,
                'durationLabel'      => $this->formatDurationLabel($duration),
                'durationRange'      => $this->getDurationRange($duration),
                'mediaType'          => 'Video',
                'lessonCount'        => $lessonCount,
                'rating'             => 4.91,
                'enrolledCount'      => 850 + ($mod->id * 20),
                'aiRecommended'      => true,
                'supportsWeeklyGoal' => true,
                'thumbnail'          => $mod->learningPath?->thumbnail_url ?? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
                'tags'               => $skills,
                'updatedAt'          => $mod->updated_at ? $mod->updated_at->format('Y-m-d') : '2026-09-18',
            ]);
        }

        // 3. Ambil Lessons dari Database
        $lessons = Lesson::with(['module.learningPath', 'skills'])
            ->where('status', 'published')
            ->get();

        if ($lessons->isEmpty()) {
            $lessons = Lesson::with(['module.learningPath', 'skills'])->get();
        }

        foreach ($lessons as $les) {
            $duration = $les->duration_minutes ?: 8;
            $mediaType = match (strtolower($les->type ?? '')) {
                'video' => 'Video',
                'quiz'  => 'Kuis Interaktif',
                default => 'Artikel',
            };

            $skills = $les->skills->pluck('name')->all();
            if (empty($skills)) {
                $skills = ['Python', 'Basics'];
            }

            $items->push([
                'id'                 => 'les-' . $les->id,
                'rawId'              => $les->id,
                'type'               => 'lesson',
                'title'              => $les->title,
                'description'        => $les->summary ?? ($les->content ? substr(strip_tags($les->content), 0, 140) . '...' : 'Pelajari konsep inti dalam hitungan menit.'),
                'category'           => $les->module?->learningPath?->category ?? 'AI & Data',
                'level'              => $this->mapDifficultyLevel($les->module?->difficulty_level ?? 'beginner'),
                'durationMinutes'    => $duration,
                'durationLabel'      => $this->formatDurationLabel($duration),
                'durationRange'      => $this->getDurationRange($duration),
                'mediaType'          => $mediaType,
                'rating'             => 4.96,
                'enrolledCount'      => 1200 + ($les->id * 40),
                'aiRecommended'      => true,
                'supportsWeeklyGoal' => true,
                'thumbnail'          => $les->module?->learningPath?->thumbnail_url ?? 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
                'tags'               => $skills,
                'updatedAt'          => $les->updated_at ? $les->updated_at->format('Y-m-d') : '2026-09-22',
            ]);
        }

        // 4. Ekstraksi opsi filter dinamis dari database
        $uniqueTopics = $items->pluck('category')->filter()->unique()->values()->all();
        $defaultTopics = ['Web Development', 'AI & Data', 'Cloud & DevOps', 'Software Engineering', 'Soft Skills & Leadership'];
        $mergedTopics = array_values(array_unique(array_merge($uniqueTopics, $defaultTopics)));

        $filters = [
            'topics'    => $mergedTopics,
            'levels'    => ['Pemula', 'Menengah', 'Lanjutan'],
            'durations' => [
                ['label' => '< 10 Menit', 'value' => '< 10 Menit'],
                ['label' => '10 - 30 Menit', 'value' => '10-30 Menit'],
                ['label' => '30 - 60 Menit', 'value' => '30-60 Menit'],
                ['label' => '1 - 3 Jam', 'value' => '1-3 Jam'],
                ['label' => '> 3 Jam', 'value' => '> 3 Jam'],
            ],
            'media'     => [
                ['label' => 'Video Pembelajaran', 'value' => 'Video'],
                ['label' => 'Artikel & Ringkasan', 'value' => 'Artikel'],
                ['label' => 'Kuis Interaktif', 'value' => 'Kuis Interaktif'],
                ['label' => 'Interactive Coding', 'value' => 'Interactive Coding'],
            ],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Explore microlearning catalog retrieved successfully.',
            'total'   => $items->count(),
            'filters' => $filters,
            'data'    => $items->values()->all(),
        ]);
    }

    private function mapDifficultyLevel(?string $level): string
    {
        return match (strtolower($level ?? '')) {
            'advanced'     => 'Lanjutan',
            'intermediate' => 'Menengah',
            default        => 'Pemula',
        };
    }

    private function formatDurationLabel(int $minutes): string
    {
        if ($minutes < 60) {
            return $minutes . ' Menit';
        }
        $hours = round($minutes / 60, 1);
        return $hours . ' Jam';
    }

    private function getDurationRange(int $minutes): string
    {
        if ($minutes < 10) {
            return '< 10 Menit';
        }
        if ($minutes <= 30) {
            return '10-30 Menit';
        }
        if ($minutes <= 60) {
            return '30-60 Menit';
        }
        if ($minutes <= 180) {
            return '1-3 Jam';
        }
        return '> 3 Jam';
    }
}
