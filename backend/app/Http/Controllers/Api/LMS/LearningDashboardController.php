<?php

// Letakkan di: app/Http/Controllers/Api/Lms/LearningDashboardController.php
// (namespace "Lms" harus sama persis dengan import di routes; di Linux huruf besar/kecil berpengaruh)

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningActivity;
use App\Models\LearningCompletion;
use App\Models\LearningHistory;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LmsUserBadge;
use App\Models\Module;
use App\Models\QuizAttempt;
use App\Models\ReadinessPrediction;
use App\Models\Recommendation;
use App\Models\SrlLearningSession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class LearningDashboardController extends Controller
{
    /** Nilai recommendations.content_type yang menunjuk ke modul. Sesuaikan dengan isi tabel Anda. */
    private const REC_MODULE_TYPES = ['module'];

    /**
     * GET /api/lms/member/dashboard  (auth:sanctum)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $userId = $user->id;

        $ctx = $this->loadContext($userId);

        $enrolledModules    = $this->buildEnrolledModules($ctx);
        $activeModule       = $this->buildActiveModule($enrolledModules, $ctx);
        $recommendedModules = $this->buildRecommendedModules($userId, $enrolledModules, $ctx);
        $srlHistory         = $this->buildSrlHistory($userId, $ctx);
        $skillProfile       = $this->buildSkillProfile($ctx);
        $achievements       = $this->buildAchievements($userId);
        $learningReadiness  = $this->buildLearningReadiness($ctx, $activeModule);

        $quizScores = array_values(array_filter(array_column($enrolledModules, 'lastQuizScore'), fn ($s) => $s !== null));
        $avgQuiz    = count($quizScores) ? (int) round(array_sum($quizScores) / count($quizScores)) : 0;

        $stats = [
            ['icon' => 'book-open',   'label' => 'Modul berjalan',      'value' => count(array_filter($enrolledModules, fn ($m) => $m['status'] === 'in_progress')), 'tone' => 'primary'],
            ['icon' => 'check-circle', 'label' => 'Lesson selesai',     'value' => array_sum(array_column($enrolledModules, 'lessonsDone')), 'tone' => 'success'],
            ['icon' => 'trending-up', 'label' => 'Rata-rata skor kuis', 'value' => $avgQuiz, 'tone' => 'purple'],
            ['icon' => 'award',       'label' => 'Sertifikat',          'value' => count(array_filter($achievements['credentials'], fn ($c) => $c['status'] === 'recorded')), 'tone' => 'warning'],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Learning dashboard data retrieved successfully.',
            'data'    => [
                'user' => [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'username' => $user->username ?? null,
                ],
                'userLearningProfile' => ['currentStreak' => $this->calculateStreak($userId)],
                'activeModule'        => $activeModule,
                'recommendedModules'  => $recommendedModules,
                'enrolledModules'     => $enrolledModules,
                'srlHistory'          => $srlHistory,
                'skillProfile'        => $skillProfile,
                'achievements'        => $achievements,
                'learningReadiness'   => $learningReadiness,
                'stats'               => $stats,
            ],
        ]);
    }

    // ------------------------------------------------------------------
    // Context: semua data mentah dimuat sekali (enrollment -> learning path -> module -> lesson)
    // ------------------------------------------------------------------
    private function loadContext(int $userId): array
    {
        $enrollments = Enrollment::where('user_id', $userId)
            ->whereIn('status', ['active', 'completed'])
            ->orderByDesc('last_accessed_at')
            ->get();

        $paths = LearningPath::whereIn('id', $enrollments->pluck('learning_path_id'))->get()->keyBy('id');

        $modules = Module::whereIn('learning_path_id', $paths->keys())
            ->where('status', 'published')
            ->orderBy('order_index')
            ->get();

        $moduleIds = $modules->pluck('id');

        $lessons = Lesson::whereIn('module_id', $moduleIds)
            ->where('status', 'published')
            ->orderBy('order_index')
            ->get()
            ->groupBy('module_id');

        // Progres lesson: gabungan learning_histories & learning_completions
        $histories = Schema::hasTable('learning_histories')
            ? LearningHistory::where('user_id', $userId)->get()->keyBy('lesson_id')
            : collect();

        $completions = Schema::hasTable('learning_completions')
            ? LearningCompletion::where('user_id', $userId)->get()
            : collect();

        $doneLessonIds = $histories->where('status', 'completed')->keys()
            ->merge($completions->whereNotNull('lesson_id')->pluck('lesson_id'))
            ->unique()->values()->all();

        $completedModuleIds = $completions->whereNotNull('module_id')->pluck('module_id')->unique()->values()->all();

        // Kuis per modul + percobaan terakhir user
        $quizByModule    = DB::table('quizzes')->whereIn('module_id', $moduleIds)->pluck('id', 'module_id');
        $attemptsByQuiz  = $quizByModule->isEmpty() ? collect() : QuizAttempt::where('user_id', $userId)
            ->whereIn('quiz_id', $quizByModule->values())
            ->whereNotNull('score')
            ->orderByDesc('completed_at')
            ->get()
            ->groupBy('quiz_id');

        // Readiness terbaru per modul (lewat quiz_attempt -> quiz -> module) dan yang paling baru secara umum
        $latestPrediction    = null;
        $readinessByModule   = [];
        if (Schema::hasTable('readiness_predictions')) {
            $moduleByQuiz = $quizByModule->flip();
            $predictions  = ReadinessPrediction::with('quizAttempt')
                ->where('user_id', $userId)->orderByDesc('predicted_at')->get();
            foreach ($predictions as $p) {
                $latestPrediction ??= $p;
                $quizId   = $p->quizAttempt?->quiz_id;
                $moduleId = $quizId ? $moduleByQuiz->get($quizId) : null;
                if ($moduleId) {
                    $readinessByModule[$moduleId] ??= round((float) $p->readiness_score, 2);
                }
            }
        }

        // Sesi SRL aktif. Modul yang dipelajari TIDAK disimpan di sesi,
        // melainkan dideteksi dari srl_session_materials (lesson/modul/kuis yang dibuka selama sesi).
        $activeSessions = Schema::hasTable('srl_learning_sessions')
            ? SrlLearningSession::where('user_id', $userId)
                ->whereIn('status', ['planned', 'in_progress'])
                ->orderByDesc('updated_at')
                ->get()
            : collect();

        $materialsBySession = $this->loadSessionMaterials($userId)->groupBy('session_id');

        return [
            'userId'             => $userId,
            'enrollments'        => $enrollments,
            'paths'              => $paths,
            'modulesByPath'      => $modules->groupBy('learning_path_id'),
            'lessons'            => $lessons,
            'histories'          => $histories,
            'doneLessonIds'      => $doneLessonIds,
            'completedModuleIds' => $completedModuleIds,
            'quizByModule'       => $quizByModule,
            'attemptsByQuiz'     => $attemptsByQuiz,
            'readinessByModule'  => $readinessByModule,
            'latestPrediction'   => $latestPrediction,
            'activeSessions'     => $activeSessions,
            'materialsBySession' => $materialsBySession,
        ];
    }

    // ------------------------------------------------------------------
    // Streak
    // ------------------------------------------------------------------
    private function calculateStreak(int $userId): int
    {
        $sources = [
            ['learning_activities', 'occurred_at'],
            ['srl_learning_sessions', 'started_at'],
            ['learning_histories', 'last_accessed_at'],
            ['learning_completions', 'completed_at'],
        ];

        $dates = collect();
        foreach ($sources as [$table, $column]) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            $dates = $dates->merge(
                DB::table($table)->where('user_id', $userId)->whereNotNull($column)
                    ->selectRaw("DATE($column) as d")->distinct()->pluck('d')
            );
        }

        $dates = $dates->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))->unique()->flip();

        $cursor = Carbon::today();
        if (!$dates->has($cursor->format('Y-m-d'))) {
            $cursor = Carbon::yesterday(); // hari ini belum belajar -> streak masih dihitung dari kemarin
        }

        $streak = 0;
        while ($dates->has($cursor->format('Y-m-d'))) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    // ------------------------------------------------------------------
    // Enrolled modules (turunan dari learning path yang di-enroll)
    // ------------------------------------------------------------------
    private function buildEnrolledModules(array $ctx): array
    {
        $out = [];

        foreach ($ctx['enrollments'] as $enr) {
            $path = $ctx['paths']->get($enr->learning_path_id);
            if (!$path) {
                continue;
            }

            foreach ($ctx['modulesByPath']->get($path->id, collect()) as $mod) {
                /** @var Collection $lessons */
                $lessons = $ctx['lessons']->get($mod->id, collect());
                $total   = $lessons->count();
                $done    = $lessons->whereIn('id', $ctx['doneLessonIds'])->count();

                $isCompleted = in_array($mod->id, $ctx['completedModuleIds'], true) || ($total > 0 && $done >= $total);
                if ($isCompleted && $total > 0) {
                    $done = $total;
                }

                $quizId      = $ctx['quizByModule']->get($mod->id);
                $lastAttempt = $quizId ? $ctx['attemptsByQuiz']->get($quizId)?->first() : null;

                $lastAccess = $lessons
                    ->map(fn ($l) => ($h = $ctx['histories']->get($l->id)) && $h->last_accessed_at ? Carbon::parse($h->last_accessed_at) : null)
                    ->filter()->max();
                if (!$lastAccess && $enr->last_accessed_at) {
                    $lastAccess = Carbon::parse($enr->last_accessed_at);
                }

                $session = $this->sessionForModule($ctx, $mod->id);

                $out[] = [
                    'id'               => 'enr-' . $mod->id,
                    'moduleId'         => $mod->id,
                    'learningPathId'   => $path->id,
                    'learningPathSlug' => $path->slug,
                    'learningPath'     => $path->title,
                    'title'            => $mod->title,
                    'category'         => $path->category,
                    'description'      => Str::limit(strip_tags((string) $mod->description), 140),
                    'type'             => 'module',
                    'rawId'            => $mod->id,
                    'isEnrolled'       => true,
                    'isCompleted'      => $isCompleted,
                    'progressPercent'  => $total ? (int) round($done / $total * 100) : 0,
                    'lessonCount'      => $total,
                    'thumbnail'        => $this->thumbnailUrl($path),
                    'status'           => $isCompleted ? 'completed' : 'in_progress',
                    'lessonsDone'      => $done,
                    'lessonTotal'      => $total,
                    'srlPhase'         => $isCompleted ? null : ($session?->current_phase),
                    'lastQuizScore'    => $lastAttempt ? (int) round((float) $lastAttempt->score) : null,
                    'readiness'        => $ctx['readinessByModule'][$mod->id] ?? null,
                    'lastActivity'     => $lastAccess ? $lastAccess->copy()->locale('id')->diffForHumans() : null,
                    'lastActivityAt'   => $lastAccess?->toISOString(),
                ];
            }
        }

        // Modul berjalan (aktivitas terbaru) lebih dulu, modul selesai di belakang
        $rank = fn ($m) => $m['status'] === 'completed' ? 1 : 0;
        usort($out, fn ($a, $b) => [$rank($a), $b['lastActivityAt'] ?? ''] <=> [$rank($b), $a['lastActivityAt'] ?? '']);

        return $out;
    }

    /** Sesi aktif yang pernah membuka materi (lesson/modul/kuis) dari modul ini. */
    private function sessionForModule(array $ctx, int $moduleId): ?SrlLearningSession
    {
        return $ctx['activeSessions']->first(
            fn ($s) => $ctx['materialsBySession']->get($s->id, collect())->contains('module_id', $moduleId)
        );
    }

    /**
     * Materi yang dibuka user selama sesi SRL (srl_session_materials), dipetakan ke modul.
     * target_type boleh berupa nama kelas (App\Models\Lesson) atau alias (lesson, module, quiz).
     */
    private function loadSessionMaterials(int $userId): Collection
    {
        if (!Schema::hasTable('srl_session_materials') || !Schema::hasTable('srl_learning_sessions')) {
            return collect();
        }

        $rows = DB::table('srl_session_materials as m')
            ->join('srl_learning_sessions as s', 's.id', '=', 'm.srl_learning_session_id')
            ->where('s.user_id', $userId)
            ->get(['m.srl_learning_session_id as session_id', 'm.target_type', 'm.target_id', 'm.duration_seconds', 'm.is_completed'])
            ->map(function ($r) {
                $r->kind = Str::lower(class_basename($r->target_type));
                return $r;
            });

        $ids = fn (string $kind) => $rows->where('kind', $kind)->pluck('target_id')->unique()->values();

        $lessons  = Lesson::whereIn('id', $ids('lesson'))->get(['id', 'module_id', 'title'])->keyBy('id');
        $quizzes  = DB::table('quizzes')->whereIn('id', $ids('quiz'))->get(['id', 'module_id', 'title'])->keyBy('id');
        $modTitle = Module::whereIn('id', $ids('module'))->pluck('title', 'id');

        return $rows->map(function ($r) use ($lessons, $quizzes, $modTitle) {
            switch ($r->kind) {
                case 'lesson':
                    $r->module_id = $lessons->get($r->target_id)?->module_id;
                    $r->title     = $lessons->get($r->target_id)?->title;
                    break;
                case 'quiz':
                    $r->module_id = $quizzes->get($r->target_id)?->module_id;
                    $r->title     = $quizzes->get($r->target_id)?->title;
                    break;
                case 'module':
                    $r->module_id = (int) $r->target_id;
                    $r->title     = $modTitle->get($r->target_id);
                    break;
                default:
                    $r->module_id = null;
                    $r->title     = null;
            }
            return $r;
        });
    }

    private function thumbnailUrl(LearningPath $path): ?string
    {
        $t = $path->getAttribute('thumbnail_url') ?: $path->thumbnail;
        if (!$t) {
            return null;
        }
        return Str::startsWith($t, ['http://', 'https://', '/']) ? $t : asset('storage/' . ltrim($t, '/'));
    }

    // ------------------------------------------------------------------
    // Modul aktif (Continue Learning)
    // ------------------------------------------------------------------
    private function buildActiveModule(array $enrolledModules, array $ctx): ?array
    {
        $active = collect($enrolledModules)->firstWhere('status', 'in_progress');
        if (!$active) {
            return null; // frontend menyembunyikan kartu "lanjutkan belajar"
        }

        $lessons   = $ctx['lessons']->get($active['moduleId'], collect())->values();
        $nextIndex = $lessons->search(fn ($l) => !in_array($l->id, $ctx['doneLessonIds'], true));
        $nextIndex = $nextIndex === false ? max(0, $lessons->count() - 1) : $nextIndex;
        $current   = $lessons->get($nextIndex);

        $minutesLeft = $lessons->slice($nextIndex)
            ->reject(fn ($l) => in_array($l->id, $ctx['doneLessonIds'], true))
            ->sum('duration_minutes');

        // Sesi yang sudah membuka modul ini; jika belum ada materi tercatat, pakai sesi aktif terbaru
        $session = $this->sessionForModule($ctx, $active['moduleId']) ?? $ctx['activeSessions']->first();

        return [
            'id'               => $active['moduleId'],
            'targetModuleId'   => $active['moduleId'],
            'learningPathId'   => $active['learningPathId'],
            'learningPathSlug' => $active['learningPathSlug'],
            'title'            => $active['title'],
            'category'         => $active['category'],
            'thumbnail'        => $active['thumbnail'],
            'lessonsDone'      => $active['lessonsDone'],
            'lessonTotal'      => $active['lessonTotal'],
            'currentLesson'    => $current ? $nextIndex + 1 : null,
            'currentLessonId'  => $current?->id,
            'lessonTitle'      => $current?->title,
            'minutesLeft'      => (int) $minutesLeft,
            'srlPhase'         => $session?->current_phase ?? 'forethought',
            'session'          => [
                'forethought' => [
                    'sessionGoal'        => $session?->goal,
                    'estimatedTime'      => $session?->estimated_minutes ?? 25,
                    'confidence'         => $session?->confidence_level,
                    'selectedStrategies' => is_array($session?->strategies) ? $session->strategies : [],
                ],
                'performance' => ['accumulatedSeconds' => (int) ($session?->accumulated_seconds ?? 0)],
            ],
        ];
    }

    // ------------------------------------------------------------------
    // Rekomendasi (tabel recommendations; fallback sederhana berbasis kesamaan skill)
    // ------------------------------------------------------------------
    private function buildRecommendedModules(int $userId, array $enrolledModules, array $ctx): array
    {
        $enrolledIds     = array_column($enrolledModules, 'moduleId');
        $enrolledPathIds = $ctx['paths']->keys()->all();
        $items           = [];

        // 1. Hasil Recommendation Engine (hybrid CBF + CF)
        if (Schema::hasTable('recommendations')) {
            $recs = Recommendation::where('user_id', $userId)
                ->whereIn('content_type', self::REC_MODULE_TYPES)
                ->orderBy('rank_position')
                ->take(12)->get();

            $mods = Module::whereIn('id', $recs->pluck('content_id'))
                ->where('status', 'published')->get()->keyBy('id');

            $recs = $recs->filter(fn ($r) => $mods->has($r->content_id) && !in_array($r->content_id, $enrolledIds, true))->take(4);

            $paths  = LearningPath::whereIn('id', $mods->pluck('learning_path_id'))->get()->keyBy('id');
            $stats  = $this->lessonStats($recs->pluck('content_id')->all());
            $skills = $this->skillsByModule($recs->pluck('content_id')->all());

            foreach ($recs as $r) {
                $mod  = $mods->get($r->content_id);
                $src  = $r->cbf_score !== null && $r->cf_score !== null ? 'hybrid' : ($r->cbf_score !== null ? 'cbf' : 'cf');
                $items[] = $this->recommendationItem(
                    $mod, $paths->get($mod->learning_path_id), $stats->get($mod->id), $skills[$mod->id] ?? [],
                    (float) $r->score, $src,
                    in_array($mod->learning_path_id, $enrolledPathIds, true) ? 'lanjut' : 'pendukung'
                );
            }
        }

        // 2. Fallback: modul dari learning path lain, diurutkan berdasarkan kesamaan skill (CBF sederhana)
        if (count($items) < 4) {
            $takenIds = array_merge($enrolledIds, array_column($items, 'targetModuleId'));

            $candidatePathIds = LearningPath::where('status', 'published')
                ->whereNotIn('id', $enrolledPathIds)->pluck('id');

            $candidates = Module::whereIn('learning_path_id', $candidatePathIds)
                ->where('status', 'published')
                ->whereNotIn('id', $takenIds)
                ->get();

            $candidateIds = $candidates->pluck('id')->all();
            $skills       = $this->skillsByModule($candidateIds);
            $stats        = $this->lessonStats($candidateIds);
            $paths        = LearningPath::whereIn('id', $candidates->pluck('learning_path_id'))->get()->keyBy('id');

            $learnedSkillIds = empty($ctx['doneLessonIds']) ? [] : DB::table('lesson_skills')
                ->whereIn('lesson_id', $ctx['doneLessonIds'])->pluck('skill_id')->unique()->all();

            $scored = $candidates->map(function ($mod) use ($skills, $learnedSkillIds) {
                $ids   = array_keys($skills[$mod->id] ?? []);
                $score = count($ids) ? count(array_intersect($ids, $learnedSkillIds)) / count($ids) : 0;
                return ['mod' => $mod, 'score' => round($score, 2)];
            })->sortByDesc('score')->take(4 - count($items));

            foreach ($scored as $row) {
                $mod = $row['mod'];
                $items[] = $this->recommendationItem(
                    $mod, $paths->get($mod->learning_path_id), $stats->get($mod->id), $skills[$mod->id] ?? [],
                    $row['score'], 'cbf', 'pendukung'
                );
            }
        }

        return $items;
    }

    private function recommendationItem(Module $mod, ?LearningPath $path, $stats, array $skills, float $score, string $source, string $reason): array
    {
        return [
            'id'               => 'rec-' . $mod->id,
            'targetModuleId'   => $mod->id,
            'learningPathId'   => $mod->learning_path_id,
            'learningPathSlug' => $path?->slug,
            'title'            => $mod->title,
            'category'         => $path?->category,
            'description'      => Str::limit(strip_tags((string) $mod->description), 140),
            'thumbnail'        => $path ? $this->thumbnailUrl($path) : null,
            'type'             => 'module',
            'rawId'            => $mod->id,
            'moduleId'         => $mod->id,
            'isEnrolled'       => false,
            'lessonCount'      => (int) ($stats->c ?? 0),
            'durationLabel'    => ($stats->d ?? 0) ? ((int) $stats->d . ' menit') : '',
            'lessons'          => (int) ($stats->c ?? 0),
            'level'            => ucfirst($mod->difficulty_level ?? 'beginner'),
            'duration'         => (int) ($stats->d ?? 0),
            'score'            => round($score, 2),
            'source'           => $source,
            'reason'           => $reason,
            'skills'           => array_values(array_slice($skills, 0, 3)),
        ];
    }

    private function lessonStats(array $moduleIds): Collection
    {
        if (empty($moduleIds)) {
            return collect();
        }
        return Lesson::whereIn('module_id', $moduleIds)->where('status', 'published')
            ->selectRaw('module_id, COUNT(*) as c, COALESCE(SUM(duration_minutes), 0) as d')
            ->groupBy('module_id')->get()->keyBy('module_id');
    }

    /** @return array<int, array<int, string>> [moduleId => [skillId => skillName]] */
    private function skillsByModule(array $moduleIds): array
    {
        if (empty($moduleIds)) {
            return [];
        }
        $rows = DB::table('lessons as l')
            ->join('lesson_skills as ls', 'ls.lesson_id', '=', 'l.id')
            ->join('skills as s', 's.id', '=', 'ls.skill_id')
            ->whereIn('l.module_id', $moduleIds)
            ->select('l.module_id', 's.id as skill_id', 's.name')
            ->distinct()->get();

        $map = [];
        foreach ($rows as $r) {
            $map[$r->module_id][$r->skill_id] = $r->name;
        }
        return $map;
    }

    // ------------------------------------------------------------------
    // Riwayat SRL (hanya sesi yang sudah selesai direfleksikan)
    // ------------------------------------------------------------------
    private function buildSrlHistory(int $userId, array $ctx): array
    {
        if (!Schema::hasTable('srl_learning_sessions')) {
            return [];
        }

        $sessions = SrlLearningSession::where('user_id', $userId)
            ->where('status', 'completed')
            ->whereNotNull('goal_achievement')
            ->orderByDesc('started_at')
            ->take(10)->get();

        $materialsOf = fn ($s) => $ctx['materialsBySession']->get($s->id, collect());

        $moduleTitles = Module::whereIn(
            'id',
            $sessions->flatMap(fn ($s) => $materialsOf($s)->pluck('module_id'))->filter()->unique()->values()
        )->pluck('title', 'id');

        return $sessions->map(function ($s) use ($materialsOf, $moduleTitles) {
            $materials = $materialsOf($s);

            $titles = $materials->pluck('module_id')->filter()->unique()
                ->map(fn ($id) => $moduleTitles->get($id))->filter()->values();

            $module = $titles->isEmpty()
                ? 'Sesi belajar'
                : $titles->first() . ($titles->count() > 1 ? ' +' . ($titles->count() - 1) . ' modul' : '');

            return [
                'id'          => 'srl-' . $s->id,
                'startedAt'   => Carbon::parse($s->started_at ?? $s->created_at)->toISOString(),
                'module'      => $module,
                'materials'   => $materials->map(fn ($m) => [
                    'type'            => $m->kind,
                    'title'           => $m->title,
                    'durationSeconds' => (int) $m->duration_seconds,
                    'completed'       => (bool) $m->is_completed,
                ])->values()->all(),
                'forethought' => [
                    'sessionGoal'        => $s->goal ?: 'Sesi belajar',
                    'estimatedTime'      => $s->estimated_minutes ?: 25,
                    'confidence'         => (int) ($s->confidence_level ?? 0),
                    'selectedStrategies' => is_array($s->strategies) ? $s->strategies : [],
                ],
                'performance' => [
                    'accumulatedSeconds' => (int) ($s->accumulated_seconds ?: $materials->sum('duration_seconds')),
                ],
                'reflection'  => [
                    'goalAchievement'  => $s->goal_achievement,
                    'factors'          => is_array($s->factors) ? $s->factors : [],
                    'evaluation'       => $s->evaluation,
                    'futureAdjustment' => $s->future_adjustment,
                ],
            ];
        })->values()->all();
    }

    // ------------------------------------------------------------------
    // Profil kompetensi: bobot skill dari lesson yang sudah selesai / total lesson di learning path yang di-enroll
    // ------------------------------------------------------------------
    private function buildSkillProfile(array $ctx): array
    {
        $pathIds = $ctx['paths']->keys()->all();
        if (empty($pathIds)) {
            return ['skills' => [], 'careerFit' => []];
        }

        $rows = DB::table('lesson_skills as ls')
            ->join('skills as s', 's.id', '=', 'ls.skill_id')
            ->join('lessons as l', 'l.id', '=', 'ls.lesson_id')
            ->join('modules as m', 'm.id', '=', 'l.module_id')
            ->whereIn('m.learning_path_id', $pathIds)
            ->where('l.status', 'published')
            ->select('s.id', 's.name', 'ls.lesson_id', 'ls.relevance_weight')
            ->get();

        $skills = $rows->groupBy('id')->map(function ($group) use ($ctx) {
            $total = (float) $group->sum('relevance_weight');
            $done  = (float) $group->whereIn('lesson_id', $ctx['doneLessonIds'])->sum('relevance_weight');
            return [
                'name'  => $group->first()->name,
                'level' => $total > 0 ? round($done / $total, 2) : 0,
            ];
        })->sortByDesc('level')->take(5)->values()->all();

        // careerFit: belum ada sumber datanya di skema learning path; diisi dari modul Job Matching bila sudah tersedia.
        return ['skills' => $skills, 'careerFit' => []];
    }

    // ------------------------------------------------------------------
    // Badge & sertifikat
    // ------------------------------------------------------------------
    private function buildAchievements(int $userId): array
    {
        $earned = Schema::hasTable('lms_user_badges')
            ? LmsUserBadge::where('user_id', $userId)->pluck('badge_code')->all()
            : [];

        $definitions = [
            ['id' => 'b1', 'code' => 'streak_7',      'name' => 'Konsisten 7 Hari',    'icon' => 'flame'],
            ['id' => 'b2', 'code' => 'reflective',    'name' => 'Pembelajar Reflektif', 'icon' => 'refresh'],
            ['id' => 'b3', 'code' => 'path_finisher', 'name' => 'Path Finisher',        'icon' => 'award'],
            ['id' => 'b4', 'code' => 'quiz_master',   'name' => 'Kuis Sempurna',        'icon' => 'zap'],
        ];

        $badges = array_map(fn ($b) => [
            'id'     => $b['id'],
            'name'   => $b['name'],
            'icon'   => $b['icon'],
            'earned' => in_array($b['code'], $earned, true),
        ], $definitions);

        $credentials = [];
        if (Schema::hasTable('lms_user_certificates')) {
            $credentials = DB::table('lms_user_certificates as c')
                ->join('learning_completions as lc', 'lc.id', '=', 'c.completion_id')
                ->leftJoin('learning_paths as lp', 'lp.id', '=', 'lc.learning_path_id')
                ->where('c.user_id', $userId)
                ->orderByDesc('c.created_at')
                ->get(['c.id', 'c.title', 'c.status', 'c.certificate_number', 'lc.learning_path_id', 'lp.slug', 'lc.score'])
                ->map(fn ($c) => [
                    'id'                => 'c-' . $c->id,
                    'module'            => $c->title,
                    'score'             => $c->score !== null ? (int) round((float) $c->score) : null,
                    // UI hanya mengenal 3 status: recorded | processing | pending
                    'status'            => match ($c->status) {
                        'issued'  => 'recorded',
                        'pending' => 'processing',
                        default   => 'pending',
                    },
                    'certificateNumber' => $c->certificate_number,
                    'learningPathId'    => $c->learning_path_id,
                    'learningPathSlug'  => $c->slug,
                ])->all();
        }

        return ['badges' => $badges, 'credentials' => $credentials];
    }

    // ------------------------------------------------------------------
    // Learning readiness (widget saat ini dinonaktifkan di frontend)
    // ------------------------------------------------------------------
    private function buildLearningReadiness(array $ctx, ?array $activeModule): ?array
    {
        $pred = $ctx['latestPrediction'];
        if (!$pred) {
            return null;
        }

        $features = is_array($pred->features) ? $pred->features : [];

        return [
            'moduleTitle' => $activeModule['title'] ?? null,
            'score'       => round((float) $pred->readiness_score, 2),
            'level'       => $pred->readiness_level,
            'predictedAt' => Carbon::parse($pred->predicted_at)->toISOString(),
            'factors'     => collect($features)
                ->filter(fn ($v) => is_scalar($v))
                ->map(fn ($v, $k) => ['label' => Str::headline($k), 'value' => (string) $v])
                ->values()->all(),
        ];
    }
}
