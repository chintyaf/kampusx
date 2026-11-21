<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningActivity;
use App\Models\LearningCompletion;
use App\Models\LearningHistory;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LmsUserBadge;
use App\Models\LmsUserCertificate;
use App\Models\Module;
use App\Models\QuizAttempt;
use App\Models\ReadinessPrediction;
use App\Models\Recommendation;
use App\Models\Skill;
use App\Models\SrlLearningSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class LearningDashboardController extends Controller
{
    /**
     * Mengambil seluruh data agregasi untuk Learning Dashboard Member
     * URL: GET /api/lms/learner/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        // 1. Dapatkan user (dari token Sanctum atau fallback ke demo user)
        $user = $request->user('sanctum') ?? $request->user() ?? auth('sanctum')->user();
        if (!$user) {
            $user = User::where('role', 'member')->first() ?? User::find(2) ?? User::first();
        }

        $userId = $user ? $user->id : null;

        // 2. Hitung Learning Profile & Streak
        $userLearningProfile = $this->getUserLearningProfile($userId);

        // 3. Dapatkan Enrolled Modules (dan modul aktif)
        $enrolledModules = $this->getEnrolledModules($userId);

        // 4. Dapatkan Modul Aktif (Continue Learning)
        $activeModule = $this->getActiveModule($userId, $enrolledModules);

        // 5. Rekomendasi Modul (Hybrid Engine / Fallback)
        $recommendedModules = $this->getRecommendedModules($userId, $activeModule ? $activeModule['id'] : null);

        // 6. Riwayat Sesi SRL
        $srlHistory = $this->getSrlHistory($userId);

        // 7. Profil Kompetensi (Skill Matrix)
        $skillProfile = $this->getSkillProfile($userId);

        // 8. Pencapaian (Badges & Kredensial/Sertifikat)
        $achievements = $this->getAchievements($userId);

        // 9. Kesiapan Belajar (Learning Readiness)
        $learningReadiness = $this->getLearningReadiness($userId, $activeModule);

        // 10. Ringkasan KPI Header
        $quizScores = array_values(array_filter(array_column($enrolledModules, 'lastQuizScore')));
        $avgQuiz = count($quizScores) ? (int) round(array_sum($quizScores) / count($quizScores)) : 0;
        $lessonsDoneTotal = array_sum(array_column($enrolledModules, 'lessonsDone'));
        $completedModulesCount = count(array_filter($enrolledModules, fn ($m) => ($m['status'] ?? '') === 'completed'));
        $inProgressModulesCount = count(array_filter($enrolledModules, fn ($m) => ($m['status'] ?? '') === 'in_progress'));

        $stats = [
            [
                'icon'  => 'book-open',
                'label' => 'Modul berjalan',
                'value' => $inProgressModulesCount,
                'tone'  => 'primary',
            ],
            [
                'icon'  => 'check-circle',
                'label' => 'Lesson selesai',
                'value' => $lessonsDoneTotal,
                'tone'  => 'success',
            ],
            [
                'icon'  => 'trending-up',
                'label' => 'Rata-rata skor kuis',
                'value' => $avgQuiz,
                'tone'  => 'purple',
            ],
            [
                'icon'  => 'award',
                'label' => 'Sertifikat',
                'value' => $completedModulesCount,
                'tone'  => 'warning',
            ],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Learning dashboard data retrieved successfully.',
            'data'    => [
                'user'                => $user ? [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'username' => $user->username ?? null,
                ] : null,
                'userLearningProfile' => $userLearningProfile,
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

    /**
     * Hitung streak belajar berturut-turut dari aktivitas belajar & sesi SRL
     */
    private function getUserLearningProfile(?int $userId): array
    {
        if (!$userId) {
            return ['currentStreak' => 7];
        }

        $uniqueDates = collect();

        // 1. Aktivitas
        if (Schema::hasTable('learning_activities')) {
            $col = Schema::hasColumn('learning_activities', 'occurred_at') ? 'occurred_at' : (Schema::hasColumn('learning_activities', 'start_time') ? 'start_time' : 'created_at');
            $q = LearningActivity::query();
            if (Schema::hasColumn('learning_activities', 'user_id')) {
                $q->where('user_id', $userId);
            }
            $dates = $q->pluck($col)->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'));
            $uniqueDates = $uniqueDates->concat($dates);
        }

        // 2. Sesi SRL
        if (Schema::hasTable('srl_learning_sessions')) {
            $srlDates = SrlLearningSession::where('user_id', $userId)
                ->pluck('started_at')
                ->filter()
                ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'));
            $uniqueDates = $uniqueDates->concat($srlDates);
        }

        $uniqueDates = $uniqueDates->unique()->sortDesc()->values();

        if ($uniqueDates->isEmpty()) {
            return ['currentStreak' => 7]; // Default demo streak
        }

        $streak = 0;
        $checkDate = Carbon::today();

        // Jika hari ini belum tercatat, periksa mulai kemarin
        if (!$uniqueDates->contains($checkDate->format('Y-m-d'))) {
            $checkDate = Carbon::yesterday();
        }

        while ($uniqueDates->contains($checkDate->format('Y-m-d'))) {
            $streak++;
            $checkDate->subDay();
        }

        return [
            'currentStreak' => max($streak, 1),
        ];
    }

    /**
     * Ambil modul yang di-enroll oleh member beserta progres, fase SRL, kuis, dan readiness
     */
    private function getEnrolledModules(?int $userId): array
    {
        $modules = [];

        // 1. Coba ambil dari tabel Enrollment
        $enrollments = $userId
            ? Enrollment::with([
                'learningPath.modules.lessons',
                'learningPath.modules.quiz.attempts' => function ($q) use ($userId) {
                    $q->where('user_id', $userId)->latest();
                },
            ])->where('user_id', $userId)->get()
            : collect();

        $enrolledModuleModels = collect();

        foreach ($enrollments as $enrollment) {
            if ($enrollment->learningPath && $enrollment->learningPath->modules) {
                foreach ($enrollment->learningPath->modules as $mod) {
                    $mod->setRelation('learningPath', $enrollment->learningPath);
                    $enrolledModuleModels->push($mod);
                }
            }
        }

        // Jika belum ada enrollment pada user, ambil modul yang dipublikasikan sebagai data awal
        if ($enrolledModuleModels->isEmpty()) {
            $enrolledModuleModels = Module::with(['lessons', 'learningPath', 'quiz.attempts' => function ($q) use ($userId) {
                if ($userId) {
                    $q->where('user_id', $userId)->latest();
                }
            }])->where('status', 'published')->take(6)->get();

            // Jika masih kosong (belum di-filter published), ambil modul apa saja
            if ($enrolledModuleModels->isEmpty()) {
                $enrolledModuleModels = Module::with(['lessons', 'learningPath', 'quiz'])->take(6)->get();
            }
        }

        // Ambil riwayat penyelesaian pelajaran user
        $completedLessonIds = [];
        if ($userId && Schema::hasTable('learning_histories')) {
            $completedLessonIds = LearningHistory::where('user_id', $userId)
                ->where('status', 'completed')
                ->pluck('lesson_id')
                ->toArray();
        }

        // Ambil sesi SRL aktif per modul
        $activeSessions = collect();
        if ($userId && Schema::hasTable('srl_learning_sessions')) {
            $activeSessions = SrlLearningSession::where('user_id', $userId)
                ->latest('updated_at')
                ->get()
                ->keyBy('module_id');
        }

        // Ambil prediksi kesiapan terbaru
        $latestReadiness = null;
        if ($userId && Schema::hasTable('readiness_predictions')) {
            $latestReadiness = ReadinessPrediction::where('user_id', $userId)->latest('predicted_at')->first();
        }

        $defaultReadiness = $latestReadiness ? (float) $latestReadiness->readiness_score : 0.68;

        foreach ($enrolledModuleModels as $index => $mod) {
            $totalLessons = $mod->lessons ? $mod->lessons->count() : 0;
            $doneCount = 0;

            if (!empty($completedLessonIds) && $mod->lessons) {
                $doneCount = $mod->lessons->whereIn('id', $completedLessonIds)->count();
            }

            // Jika total lessons = 0, beri estimasi fallback
            if ($totalLessons === 0) {
                $totalLessons = max(4, ($index + 3) * 2);
                $doneCount = $index === 0 ? 5 : ($index === 1 ? 2 : ($index === 3 ? $totalLessons : 3));
            }

            $isCompleted = ($doneCount >= $totalLessons && $totalLessons > 0);
            $status = $isCompleted ? 'completed' : 'in_progress';

            $activeSession = $activeSessions->get($mod->id);
            $srlPhases = ['performance', 'reflection', 'forethought'];
            $srlPhase = $activeSession ? $activeSession->current_phase : ($isCompleted ? null : $srlPhases[$index % 3]);

            $lastAttempt = $mod->quiz && $mod->quiz->attempts->isNotEmpty()
                ? $mod->quiz->attempts->first()
                : null;
            $lastQuizScore = $lastAttempt ? (int) $lastAttempt->score : ($isCompleted ? 88 : (75 + ($index * 4) % 15));

            $lastActivityStr = $activeSession && $activeSession->started_at
                ? Carbon::parse($activeSession->started_at)->diffForHumans()
                : ($index === 0 ? 'Hari ini, 10:30' : ($index === 1 ? 'Kemarin' : ($index + 1) . ' hari lalu'));

            $modules[] = [
                'id'            => 'enr-' . $mod->id,
                'moduleId'      => $mod->id,
                'title'         => $mod->title,
                'category'      => $mod->learningPath?->category ?? 'System Architecture',
                'thumbnail'     => $mod->learningPath?->thumbnail_url ?? null,
                'status'        => $status,
                'lessonsDone'   => $doneCount,
                'lessonTotal'   => $totalLessons,
                'srlPhase'      => $srlPhase,
                'lastQuizScore' => $lastQuizScore,
                'readiness'     => round(min(0.95, max(0.40, $defaultReadiness + (($index % 3) * 0.08 - 0.05))), 2),
                'lastActivity'  => $lastActivityStr,
            ];
        }

        return $modules;
    }

    /**
     * Dapatkan modul yang sedang aktif dipelajari
     */
    private function getActiveModule(?int $userId, array $enrolledModules): ?array
    {
        // Cari dari enrolledModules yang in_progress pertama
        $activeEnrolled = null;
        foreach ($enrolledModules as $em) {
            if ($em['status'] === 'in_progress') {
                $activeEnrolled = $em;
                break;
            }
        }

        if (!$activeEnrolled && !empty($enrolledModules)) {
            $activeEnrolled = $enrolledModules[0];
        }

        $moduleId = $activeEnrolled ? $activeEnrolled['moduleId'] : null;
        $modModel = $moduleId ? Module::with(['lessons', 'learningPath'])->find($moduleId) : null;

        if (!$modModel) {
            $modModel = Module::with(['lessons', 'learningPath'])->first();
        }

        if (!$modModel) {
            return [
                'id'            => 'mod-arch-101',
                'targetModuleId'=> 'mod-arch-101',
                'title'         => 'Web Application Architecture & REST API Design',
                'category'      => 'System Architecture',
                'thumbnail'     => null,
                'lessonsDone'   => 5,
                'lessonTotal'   => 8,
                'currentLesson' => 6,
                'lessonTitle'   => 'Scalable Endpoints, Idempotency & Rate Limiting',
                'minutesLeft'   => 15,
                'srlPhase'      => 'performance',
                'session'       => [
                    'forethought' => [
                        'sessionGoal'        => 'Memahami idempotency pada REST API',
                        'estimatedTime'      => 25,
                        'confidence'         => 3,
                        'selectedStrategies' => ['Mencatat Poin Penting', 'Teknik Pomodoro'],
                    ],
                    'performance' => ['accumulatedSeconds' => 12 * 60],
                ],
            ];
        }

        // Cari sesi SRL aktif
        $activeSession = null;
        if ($userId && Schema::hasTable('srl_learning_sessions')) {
            $activeSession = SrlLearningSession::where('user_id', $userId)
                ->where('module_id', $modModel->id)
                ->whereIn('status', ['planned', 'in_progress'])
                ->latest()
                ->first();
        }

        $lessonsTotal = ($modModel->lessons && $modModel->lessons->count()) ? $modModel->lessons->count() : ($activeEnrolled['lessonTotal'] ?? 8);
        $doneCount = $activeEnrolled['lessonsDone'] ?? 5;
        $currentLessonNum = min($lessonsTotal, $doneCount + 1);

        $currentLesson = $modModel->lessons ? $modModel->lessons->get($currentLessonNum - 1) : null;
        $lessonTitle = $currentLesson ? $currentLesson->title : 'Scalable Endpoints, Idempotency & Rate Limiting';

        $remainingLessons = $modModel->lessons ? $modModel->lessons->slice($doneCount) : collect();
        $minutesLeft = $remainingLessons->sum('duration_minutes');
        if ($minutesLeft <= 0) {
            $minutesLeft = 15;
        }

        $srlPhase = $activeSession ? $activeSession->current_phase : ($activeEnrolled['srlPhase'] ?? 'performance');

        return [
            'id'            => $modModel->id,
            'targetModuleId'=> $modModel->id,
            'title'         => $modModel->title,
            'category'      => $modModel->learningPath?->category ?? 'System Architecture',
            'thumbnail'     => $modModel->learningPath?->thumbnail_url ?? null,
            'lessonsDone'   => $doneCount,
            'lessonTotal'   => $lessonsTotal,
            'currentLesson' => $currentLessonNum,
            'lessonTitle'   => $lessonTitle,
            'minutesLeft'   => $minutesLeft,
            'srlPhase'      => $srlPhase,
            'session'       => [
                'forethought' => [
                    'sessionGoal'        => $activeSession?->goal ?? 'Memahami idempotency pada REST API',
                    'estimatedTime'      => $activeSession?->estimated_minutes ?? 25,
                    'confidence'         => $activeSession?->confidence_level ?? 3,
                    'selectedStrategies' => (is_array($activeSession?->strategies) && !empty($activeSession->strategies)) ? $activeSession->strategies : ['Mencatat Poin Penting', 'Teknik Pomodoro'],
                ],
                'performance' => [
                    'accumulatedSeconds' => $activeSession?->accumulated_seconds ?? (12 * 60),
                ],
            ],
        ];
    }

    /**
     * Dapatkan modul rekomendasi (CBF + CF)
     */
    private function getRecommendedModules(?int $userId, $excludeModuleId): array
    {
        $recommendations = [];

        // 1. Cek tabel recommendations di database jika ada
        if ($userId && Schema::hasTable('recommendations')) {
            $dbRecs = Recommendation::where('user_id', $userId)
                ->orderBy('rank_position', 'asc')
                ->take(4)
                ->get();

            if ($dbRecs->isNotEmpty()) {
                foreach ($dbRecs as $rec) {
                    $mod = Module::with(['lessons.skills', 'learningPath'])->find($rec->content_id);
                    if ($mod) {
                        $skills = $mod->lessons ? $mod->lessons->flatMap->skills->pluck('name')->unique()->values()->all() : [];
                        $recommendations[] = [
                            'id'             => 'rec-' . $mod->id,
                            'targetModuleId' => $mod->id,
                            'title'          => $mod->title,
                            'category'       => $mod->learningPath?->category ?? 'Technology',
                            'lessons'        => $mod->lessons ? $mod->lessons->count() : 4,
                            'level'          => ucfirst($mod->difficulty_level ?? 'Intermediate'),
                            'duration'       => $mod->lessons ? ($mod->lessons->sum('duration_minutes') ?: 15) : 15,
                            'score'          => (float) $rec->score,
                            'source'         => $rec->cbf_score && $rec->cf_score ? 'hybrid' : ($rec->cbf_score ? 'cbf' : 'cf'),
                            'reason'         => 'lanjut',
                            'skills'         => !empty($skills) ? $skills : ['System Architecture', 'Backend'],
                        ];
                    }
                }
            }
        }

        // Jika belum ada rekomendasi di DB, ambil dari modul yang ada
        if (empty($recommendations)) {
            $otherModules = Module::with(['lessons.skills', 'learningPath'])
                ->when($excludeModuleId, fn ($q) => $q->where('id', '!=', $excludeModuleId))
                ->take(4)
                ->get();

            $reasons = ['pendukung', 'lanjut', 'lanjut', 'pendukung'];
            $sources = ['hybrid', 'cbf', 'cf', 'cf'];

            foreach ($otherModules as $i => $mod) {
                $skills = $mod->lessons ? $mod->lessons->flatMap->skills->pluck('name')->unique()->values()->all() : [];
                $recommendations[] = [
                    'id'             => 'rec-' . $mod->id,
                    'targetModuleId' => $mod->id,
                    'title'          => $mod->title,
                    'category'       => $mod->learningPath?->category ?? 'Software Engineering',
                    'lessons'        => $mod->lessons ? max(3, $mod->lessons->count()) : 4,
                    'level'          => ucfirst($mod->difficulty_level ?? 'Intermediate'),
                    'duration'       => $mod->lessons ? ($mod->lessons->sum('duration_minutes') ?: (12 + $i * 3)) : 14,
                    'score'          => round(0.91 - ($i * 0.05), 2),
                    'source'         => $sources[$i % 4],
                    'reason'         => $reasons[$i % 4],
                    'skills'         => !empty($skills) ? $skills : ['API Design', 'Security'],
                ];
            }
        }

        // Fallback default jika modul masih kurang dari 4
        if (count($recommendations) < 4) {
            $fallbacks = [
                [
                    'id'             => 'rec-1',
                    'targetModuleId' => 'mod-arch-101',
                    'title'          => 'Securing Distributed APIs: OAuth 2.1 & Zero Trust JWT',
                    'category'       => 'Security',
                    'lessons'        => 3,
                    'level'          => 'Intermediate',
                    'duration'       => 12,
                    'score'          => 0.91,
                    'source'         => 'hybrid',
                    'reason'         => 'pendukung',
                    'skills'         => ['API Security', 'Authentication'],
                ],
                [
                    'id'             => 'rec-2',
                    'targetModuleId' => 'mod-arch-101',
                    'title'          => 'Microservices Event-Driven Patterns with Kafka & Redis',
                    'category'       => 'System Architecture',
                    'lessons'        => 5,
                    'level'          => 'Intermediate',
                    'duration'       => 18,
                    'score'          => 0.86,
                    'source'         => 'cbf',
                    'reason'         => 'lanjut',
                    'skills'         => ['Message Queue', 'Microservices'],
                ],
                [
                    'id'             => 'rec-3',
                    'targetModuleId' => 'mod-arch-101',
                    'title'          => 'React 19 Server Components, Actions & Optimistic UI',
                    'category'       => 'Frontend Development',
                    'lessons'        => 4,
                    'level'          => 'Advanced',
                    'duration'       => 14,
                    'score'          => 0.79,
                    'source'         => 'cf',
                    'reason'         => 'lanjut',
                    'skills'         => ['React', 'Server Components'],
                ],
                [
                    'id'             => 'rec-4',
                    'targetModuleId' => 'mod-arch-101',
                    'title'          => 'Self-Regulated Learning (SRL): High Performance Habits',
                    'category'       => 'Soft Skills',
                    'lessons'        => 3,
                    'level'          => 'All Levels',
                    'duration'       => 10,
                    'score'          => 0.74,
                    'source'         => 'cf',
                    'reason'         => 'pendukung',
                    'skills'         => ['Time Management'],
                ],
            ];

            foreach ($fallbacks as $fb) {
                if (count($recommendations) >= 4) break;
                $recommendations[] = $fb;
            }
        }

        return $recommendations;
    }

    /**
     * Dapatkan riwayat sesi SRL (Forethought, Performance, Reflection)
     */
    private function getSrlHistory(?int $userId): array
    {
        $sessions = [];

        if ($userId && Schema::hasTable('srl_learning_sessions')) {
            $dbSessions = SrlLearningSession::with('module')
                ->where('user_id', $userId)
                ->orderBy('started_at', 'desc')
                ->take(10)
                ->get();

            foreach ($dbSessions as $s) {
                $sessions[] = [
                    'id'          => 'srl-' . $s->id,
                    'startedAt'   => $s->started_at ? Carbon::parse($s->started_at)->toISOString() : Carbon::parse($s->created_at)->toISOString(),
                    'module'      => $s->module?->title ?? 'Web Application Architecture & REST API Design',
                    'forethought' => [
                        'sessionGoal'        => $s->goal ?? 'Memahami target belajar sesi ini',
                        'estimatedTime'      => $s->estimated_minutes ?? 25,
                        'confidence'         => $s->confidence_level ?? 3,
                        'selectedStrategies' => is_array($s->strategies) ? $s->strategies : ['Mencatat Poin Penting', 'Teknik Pomodoro'],
                    ],
                    'performance' => [
                        'accumulatedSeconds' => $s->accumulated_seconds ?: 25 * 60,
                    ],
                    'reflection'  => [
                        'goalAchievement'  => $s->goal_achievement ?? 'tercapai',
                        'factors'          => is_array($s->factors) ? $s->factors : ['Strategi belajar', 'Fokus dan konsentrasi'],
                        'evaluation'       => $s->evaluation ?? 'Materi terserap dengan baik.',
                        'futureAdjustment' => $s->future_adjustment ?? 'Lanjutkan dengan latihan soal.',
                    ],
                ];
            }
        }

        // Jika belum ada riwayat sesi di DB, sediakan mock realistis
        if (empty($sessions)) {
            $now = Carbon::now();
            $sessions = [
                [
                    'id'          => 'srl-008',
                    'startedAt'   => $now->copy()->subHours(2)->toISOString(),
                    'module'      => 'Web Application Architecture & REST API Design',
                    'forethought' => [
                        'sessionGoal'        => 'Memahami idempotency pada REST API',
                        'estimatedTime'      => 25,
                        'confidence'         => 3,
                        'selectedStrategies' => ['Mencatat Poin Penting', 'Teknik Pomodoro'],
                    ],
                    'performance' => ['accumulatedSeconds' => 25 * 60],
                    'reflection'  => [
                        'goalAchievement'  => 'tercapai',
                        'factors'          => ['Strategi belajar', 'Fokus dan konsentrasi'],
                        'evaluation'       => 'Sudah paham cara kerja idempotency key, tinggal latihan menerapkannya di endpoint POST.',
                        'futureAdjustment' => 'Langsung praktik di Postman setelah selesai membaca materi.',
                    ],
                ],
                [
                    'id'          => 'srl-007',
                    'startedAt'   => $now->copy()->subDays(1)->toISOString(),
                    'module'      => 'Modern State Management with Redux Toolkit & Zustand',
                    'forethought' => [
                        'sessionGoal'        => 'Memahami perbedaan Redux Toolkit dan Zustand',
                        'estimatedTime'      => 30,
                        'confidence'         => 2,
                        'selectedStrategies' => ['Menjelaskan Ulang (Feynman Technique)'],
                    ],
                    'performance' => ['accumulatedSeconds' => 22 * 60],
                    'reflection'  => [
                        'goalAchievement'  => 'sebagian',
                        'factors'          => ['Tingkat kesulitan materi'],
                        'evaluation'       => 'Konsep slice sudah jelas, tapi async thunk masih membingungkan.',
                        'futureAdjustment' => 'Ulangi bagian createAsyncThunk dengan contoh kecil.',
                    ],
                ],
                [
                    'id'          => 'srl-006',
                    'startedAt'   => $now->copy()->subDays(2)->toISOString(),
                    'module'      => 'Database Indexing & PostgreSQL Query Optimization',
                    'forethought' => [
                        'sessionGoal'        => 'Memahami B-tree index dan kapan dipakai',
                        'estimatedTime'      => 25,
                        'confidence'         => 3,
                        'selectedStrategies' => ['Latihan Soal Praktis', 'Mencatat Poin Penting'],
                    ],
                    'performance' => ['accumulatedSeconds' => 25 * 60],
                    'reflection'  => [
                        'goalAchievement'  => 'tercapai',
                        'factors'          => ['Strategi belajar', 'Pengetahuan awal'],
                        'evaluation'       => 'Bisa menjelaskan kapan index membantu dan kapan justru memperlambat write.',
                        'futureAdjustment' => 'Lanjut ke composite index dengan studi kasus tabel besar.',
                    ],
                ],
                [
                    'id'          => 'srl-005',
                    'startedAt'   => $now->copy()->subDays(3)->toISOString(),
                    'module'      => 'Database Indexing & PostgreSQL Query Optimization',
                    'forethought' => [
                        'sessionGoal'        => 'Membaca output EXPLAIN ANALYZE',
                        'estimatedTime'      => 20,
                        'confidence'         => 4,
                        'selectedStrategies' => ['Teknik Pomodoro'],
                    ],
                    'performance' => ['accumulatedSeconds' => 9 * 60],
                    'reflection'  => [
                        'goalAchievement'  => 'belum',
                        'factors'          => ['Manajemen waktu', 'Kondisi tubuh dan lingkungan'],
                        'evaluation'       => 'Waktu habis untuk setup dan badan sudah lelah, belum sampai membaca output.',
                        'futureAdjustment' => 'Siapkan database sampel sebelum sesi dimulai dan belajar lebih awal.',
                    ],
                ],
            ];
        }

        return $sessions;
    }

    /**
     * Dapatkan profil kompetensi (Skill Matrix)
     */
    private function getSkillProfile(?int $userId): array
    {
        $skills = Skill::take(5)->get();

        $skillList = [];
        if ($skills->isNotEmpty()) {
            $levels = [0.72, 0.90, 0.85, 0.50, 0.33];
            foreach ($skills as $i => $s) {
                $skillList[] = [
                    'name'  => $s->name,
                    'level' => $levels[$i % count($levels)],
                ];
            }
        } else {
            $skillList = [
                ['name' => 'REST API Design', 'level' => 0.72],
                ['name' => 'Containerization', 'level' => 0.90],
                ['name' => 'Software Architecture', 'level' => 0.85],
                ['name' => 'Database Optimization', 'level' => 0.50],
                ['name' => 'State Management', 'level' => 0.33],
            ];
        }

        $careerFit = [
            [
                'role'       => 'Backend Engineer',
                'company'    => 'PT Nusantara Digital',
                'matchScore' => 0.78,
                'gaps'       => ['Message Queue', 'Kubernetes'],
            ],
            [
                'role'       => 'Fullstack Developer',
                'company'    => 'Studio Kode Bandung',
                'matchScore' => 0.71,
                'gaps'       => ['React Testing', 'GraphQL'],
            ],
        ];

        return [
            'skills'    => $skillList,
            'careerFit' => $careerFit,
        ];
    }

    /**
     * Dapatkan badge dan kredensial/sertifikat
     */
    private function getAchievements(?int $userId): array
    {
        // 1. Badges
        $userBadges = ($userId && Schema::hasTable('lms_user_badges')) ? LmsUserBadge::where('user_id', $userId)->get() : collect();
        $earnedCodes = $userBadges->pluck('badge_code')->toArray();

        $allBadges = [
            ['id' => 'b1', 'code' => 'streak_7', 'name' => 'Konsisten 7 Hari', 'icon' => 'flame'],
            ['id' => 'b2', 'code' => 'reflective', 'name' => 'Pembelajar Reflektif', 'icon' => 'refresh'],
            ['id' => 'b3', 'code' => 'path_finisher', 'name' => 'Path Finisher', 'icon' => 'award'],
            ['id' => 'b4', 'code' => 'quiz_master', 'name' => 'Kuis Sempurna', 'icon' => 'zap'],
        ];

        $badges = array_map(function ($b) use ($earnedCodes) {
            return [
                'id'     => $b['id'],
                'name'   => $b['name'],
                'icon'   => $b['icon'],
                'earned' => in_array($b['code'], $earnedCodes) || in_array($b['id'], ['b1', 'b2']),
            ];
        }, $allBadges);

        // 2. Kredensial / Sertifikat
        $certificates = ($userId && Schema::hasTable('lms_user_certificates'))
            ? LmsUserCertificate::where('user_id', $userId)->latest()->get()
            : collect();

        $credentials = [];
        if ($certificates->isNotEmpty()) {
            foreach ($certificates as $cert) {
                $status = match ($cert->status) {
                    'issued'  => 'recorded',
                    'pending' => 'processing',
                    default   => 'pending',
                };
                $credentials[] = [
                    'id'     => 'c-' . $cert->id,
                    'module' => $cert->title,
                    'score'  => 88,
                    'status' => $status,
                ];
            }
        } else {
            $credentials = [
                [
                    'id'     => 'c1',
                    'module' => 'Docker & Containerization for Fullstack Engineers',
                    'score'  => 90,
                    'status' => 'recorded',
                ],
                [
                    'id'     => 'c2',
                    'module' => 'Clean Architecture & Domain Driven Design Essentials',
                    'score'  => 85,
                    'status' => 'processing',
                ],
            ];
        }

        return [
            'badges'      => $badges,
            'credentials' => $credentials,
        ];
    }

    /**
     * Dapatkan model kesiapan belajar (Learning Readiness)
     */
    private function getLearningReadiness(?int $userId, ?array $activeModule): array
    {
        $pred = null;
        if ($userId && Schema::hasTable('readiness_predictions')) {
            $pred = ReadinessPrediction::with('quizAttempt.quiz')->where('user_id', $userId)->latest('predicted_at')->first();
        }

        $moduleTitle = $activeModule ? $activeModule['title'] : 'Web Application Architecture & REST API Design';
        $score = $pred ? (float) $pred->readiness_score : 0.68;

        return [
            'moduleTitle' => $moduleTitle,
            'score'       => $score,
            'factors'     => [
                ['label' => 'Rata-rata skor kuis', 'value' => '78'],
                ['label' => 'Tren skor kuis', 'value' => '+6', 'tone' => 'success'],
                ['label' => 'Percobaan kuis', 'value' => '2×'],
                ['label' => 'Durasi belajar', 'value' => '1j 35m'],
                ['label' => 'Frekuensi belajar', 'value' => '4 sesi/mgg'],
                ['label' => 'Penyelesaian materi', 'value' => '63%'],
            ],
            'lastQuiz'    => [
                'lesson'   => 'Lesson 5 · HTTP Methods & Status Codes',
                'score'    => 80,
                'feedback' => 'Pemahaman method dan status code sudah baik. Perdalam perbedaan PUT dan PATCH, serta kapan memakai 409 vs 422.',
            ],
        ];
    }
}
