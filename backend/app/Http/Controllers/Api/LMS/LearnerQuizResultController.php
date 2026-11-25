<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Recommendation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class LearnerQuizResultController extends Controller
{
    public function show(Request $request, $moduleId): JsonResponse
    {
        $user = $request->user();

        $module = Module::with(['learningPath', 'lessons' => function ($q) {
            if (Schema::hasColumn('lessons', 'order_index')) {
                $q->orderBy('order_index', 'asc');
            } else {
                $q->orderBy('id', 'asc');
            }
        }])->find($moduleId);

        if (!$module) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        $quiz = Quiz::with(['questions.options'])
            ->where('module_id', $module->id)
            ->first();

        if (!$quiz) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kuis pada modul ini tidak ditemukan.',
            ], 404);
        }

        $attemptQuery = QuizAttempt::with(['answers.selectedOption', 'readinessPrediction'])
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereIn('status', ['submitted', 'graded']);

        if ($request->filled('attempt_id')) {
            $attemptQuery->where('id', $request->query('attempt_id'));
        } else {
            $attemptQuery->orderByDesc('completed_at')->orderByDesc('id');
        }

        $attempt = $attemptQuery->first();

        if (!$attempt) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Belum ada hasil kuis yang diselesaikan untuk modul ini.',
            ], 404);
        }

        $questions = $quiz->questions;
        $answersByQuestion = $attempt->answers->keyBy('question_id');
        $moduleLessons = $module->lessons->values();

        $correctCount = 0;
        $wrongCount = 0;
        $unansweredCount = 0;
        $remedialLessons = [];

        foreach ($questions as $index => $question) {
            $answer = $answersByQuestion->get($question->id);
            $selectedOption = $answer?->selectedOption;
            $correctOption = $question->options->firstWhere('is_correct', true);

            $isUnanswered = !$answer || (!$answer->selected_option_id && empty($answer->answer_text));
            $isCorrect = false;

            if (!$isUnanswered) {
                $isCorrect = $answer->is_correct !== null
                    ? (bool) $answer->is_correct
                    : (bool) ($selectedOption?->is_correct ?? false);
            }

            if ($isUnanswered) {
                $unansweredCount++;
            } elseif ($isCorrect) {
                $correctCount++;
            } else {
                $wrongCount++;
            }

            // Kumpulkan soal yang salah atau terlewat untuk LessonReview
            if (!$isCorrect) {
                $linkedLesson = $this->resolveLinkedLesson($question, $index, $moduleLessons);
                $lessonNumber = $linkedLesson
                    ? ($moduleLessons->search(fn ($l) => $l->id === $linkedLesson->id) + 1)
                    : ($index + 1);

                $remedialLessons[] = [
                    'id'            => (string) $question->id,
                    'questionId'    => $question->id,
                    'lessonId'      => $linkedLesson?->id,
                    'lessonNumber'  => $lessonNumber,
                    'title'         => $linkedLesson
                        ? "Lesson {$lessonNumber} — {$linkedLesson->title}"
                        : 'Soal #' . ($index + 1),
                    'status'        => $isUnanswered ? 'Terlewat' : 'Salah',
                    'question'      => $question->question_text,
                    'userAnswer'    => $isUnanswered
                        ? 'Belum dijawab'
                        : ($selectedOption
                            ? "{$selectedOption->option_label}. {$selectedOption->option_text}"
                            : ($answer->answer_text ?? 'Belum dijawab')),
                    'correctAnswer' => $correctOption
                        ? "{$correctOption->option_label}. {$correctOption->option_text}"
                        : '-',
                    'explanation'   => $question->explanation,
                    'actionText'    => $linkedLesson ? "Pelajari Lesson {$lessonNumber}" : 'Tinjau Materi',
                ];
            }
        }

        $totalQuestions = $questions->count();
        $answeredCount = $correctCount + $wrongCount;

        $score = $attempt->score !== null
            ? round((float) $attempt->score, 0)
            : ($totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 0) : 0);

        $passingScore = round((float) ($quiz->passing_score ?? 70), 0);
        $isPassed = $attempt->is_passed !== null
            ? (bool) $attempt->is_passed
            : ($score >= $passingScore);

        $readinessLevel = $attempt->readinessPrediction?->readiness_level
            ?? (!$isPassed ? 'belum_siap' : ($score >= 85 ? 'siap' : 'cukup_siap'));

        $outcomeMeta = $this->buildOutcomeMeta($readinessLevel, $score, $passingScore);
        $duration = $this->formatDuration($attempt->started_at, $attempt->completed_at);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'moduleId'        => $module->id,
                'moduleTitle'     => $module->title,
                'quizTitle'       => $quiz->title,
                'attemptId'       => $attempt->id,
                'outcome'         => [
                    'id'             => (string) $attempt->id,
                    'score'          => $score,
                    'passingScore'   => $passingScore,
                    'isPassed'       => $isPassed,
                    'readinessLevel' => $readinessLevel,
                    'themeColor'     => $outcomeMeta['themeColor'],
                    'badgeText'      => $outcomeMeta['badgeText'],
                    'headline'       => $outcomeMeta['headline'],
                    'feedback'       => $outcomeMeta['feedback'],
                    'ctaPrimaryText' => $outcomeMeta['ctaPrimaryText'],
                    'metrics'        => [
                        'correct'     => $correctCount,
                        'wrong'       => $wrongCount,
                        'unanswered'  => $unansweredCount,
                        'total'       => $totalQuestions,
                        'answeredStr' => "{$answeredCount}/{$totalQuestions} Soal diisi",
                    ],
                    'duration'       => $duration,
                    'remedialCount'  => count($remedialLessons),
                ],
                'remedialLessons' => $remedialLessons,
                'recommendations' => $this->getRecommendations($user->id, $module),
            ],
        ]);
    }

    private function resolveLinkedLesson($question, int $questionIndex, $moduleLessons): ?Lesson
    {
        if ($moduleLessons->isEmpty()) {
            return null;
        }

        if (!empty($question->lesson_id)) {
            $matched = $moduleLessons->firstWhere('id', $question->lesson_id);
            if ($matched) {
                return $matched;
            }
        }

        return $moduleLessons->get($questionIndex % $moduleLessons->count());
    }

    private function buildOutcomeMeta(string $readinessLevel, float $score, float $passingScore): array
    {
        return match ($readinessLevel) {
            'siap' => [
                'themeColor'     => '#10B981',
                'badgeText'      => 'SIAP',
                'headline'       => 'Luar Biasa! Kamu Sangat Menguasai Materi Ini',
                'feedback'       => "Nilai kamu {$score} (Min. {$passingScore}). Kesiapan belajar kamu sangat tinggi. Kamu siap melanjutkan ke modul berikutnya!",
                'ctaPrimaryText' => 'Lanjut ke Modul Berikutnya',
            ],
            'cukup_siap' => [
                'themeColor'     => '#F59E0B',
                'badgeText'      => 'CUKUP SIAP',
                'headline'       => 'Kerja Bagus! Kamu Lulus, Namun Perlu Penguatan',
                'feedback'       => "Nilai kamu {$score} (Min. {$passingScore}). Pelajari materi pendukung untuk memperjelas konsep yang masih kurang dikuasai.",
                'ctaPrimaryText' => 'Pelajari Materi Pendukung',
            ],
            default => [
                'themeColor'     => '#EF4444',
                'badgeText'      => 'BELUM SIAP',
                'headline'       => 'Belum Mencapai Target. Mari Review Materi Ini!',
                'feedback'       => "Nilai kamu {$score} (Min. {$passingScore}). Pelajari ulang lesson yang belum tuntas sebelum mencoba kembali.",
                'ctaPrimaryText' => 'Tinjau Materi',
            ],
        };
    }

    private function formatDuration(?Carbon $startedAt, ?Carbon $completedAt): string
    {
        if (!$startedAt || !$completedAt) {
            return '-';
        }

        $seconds = max(0, $startedAt->diffInSeconds($completedAt));
        $minutes = intdiv($seconds, 60);
        $remSeconds = $seconds % 60;

        return sprintf('%02dm %02ds', $minutes, $remSeconds);
    }

    private function getRecommendations(int $userId, Module $currentModule): array
    {
        $items = [];

        // 1. Cek jika sudah ada data di tabel recommendations
        $savedRecs = Recommendation::where('user_id', $userId)
            ->orderBy('rank_position', 'asc')
            ->limit(3)
            ->get();

        foreach ($savedRecs as $rec) {
            if ($rec->content_type === 'lesson') {
                $lesson = Lesson::with('module.learningPath')->find($rec->content_id);
                if ($lesson) {
                    $items[] = $this->mapLessonCard($lesson);
                }
            } elseif ($rec->content_type === 'module') {
                $mod = Module::with('learningPath')->withCount('lessons')->find($rec->content_id);
                if ($mod) {
                    $items[] = $this->mapModuleCard($mod);
                }
            } elseif ($rec->content_type === 'learning_path') {
                $lp = LearningPath::withCount(['modules', 'lessons'])->find($rec->content_id);
                if ($lp) {
                    $items[] = $this->mapLearningPathCard($lp);
                }
            }
        }

        // 2. Fallback: tampilkan materi terpublikasi dari database karena sistem rekomendasi belum aktif
        if (count($items) < 3) {
            $lessonQuery = Lesson::with('module.learningPath')
                ->where('module_id', '!=', $currentModule->id);
            if (Schema::hasColumn('lessons', 'is_published')) {
                $lessonQuery->where('is_published', true);
            }
            if ($lesson = $lessonQuery->inRandomOrder()->first()) {
                $items[] = $this->mapLessonCard($lesson);
            }
        }

        if (count($items) < 3) {
            $moduleQuery = Module::with('learningPath')
                ->withCount('lessons')
                ->where('id', '!=', $currentModule->id);
            if (Schema::hasColumn('modules', 'is_published')) {
                $moduleQuery->where('is_published', true);
            }
            if ($mod = $moduleQuery->inRandomOrder()->first()) {
                $items[] = $this->mapModuleCard($mod);
            }
        }

        if (count($items) < 3) {
            $lpQuery = LearningPath::withCount('modules')
                ->where('id', '!=', $currentModule->learning_path_id);
            if (Schema::hasColumn('learning_paths', 'is_published')) {
                $lpQuery->where('is_published', true);
            }
            if ($lp = $lpQuery->inRandomOrder()->first()) {
                $items[] = $this->mapLearningPathCard($lp);
            }
        }

        return array_slice($items, 0, 3);
    }

    private function mapLessonCard(Lesson $lesson): array
    {
        $duration = $lesson->duration_minutes ?? $lesson->estimated_minutes ?? null;

        return [
            'id'               => (string) $lesson->id,
            'type'             => 'lesson',
            'moduleId'         => $lesson->module_id,
            'learningPathSlug' => $lesson->module?->learningPath?->slug ?? $lesson->module?->learning_path_id,
            'title'            => $lesson->title,
            'description'      => $lesson->description ?? $lesson->summary ?? 'Pelajari materi lesson ini untuk memperkuat pemahamanmu.',
            'durationLabel'    => $duration ? "{$duration} Menit" : 'Lesson',
            'thumbnail'        => $lesson->thumbnail ?? $lesson->image ?? $lesson->module?->thumbnail ?? null,
        ];
    }

    private function mapModuleCard(Module $module): array
    {
        $duration = $module->duration_minutes ?? $module->estimated_minutes ?? null;

        return [
            'id'               => (string) $module->id,
            'type'             => 'module',
            'learningPathSlug' => $module->learningPath?->slug ?? $module->learning_path_id,
            'title'            => $module->title,
            'description'      => $module->description ?? 'Modul pembelajaran terstruktur untuk memperdalam konsep terkait.',
            'lessonCount'      => $module->lessons_count ?? 0,
            'level'            => $module->level ?? 'Menengah',
            'durationLabel'    => $duration ? "{$duration} Menit" : (($module->lessons_count ?? 0) . ' Lesson'),
            'isEnrolled'       => false,
            'thumbnail'        => $module->thumbnail ?? $module->image ?? $module->learningPath?->thumbnail ?? null,
        ];
    }

    private function mapLearningPathCard(LearningPath $lp): array
    {
        $duration = $lp->duration_minutes ?? $lp->estimated_minutes ?? null;

        return [
            'id'            => (string) $lp->id,
            'slug'          => $lp->slug ?? (string) $lp->id,
            'type'          => 'learning_path',
            'title'         => $lp->title,
            'description'   => $lp->description ?? 'Jalur pembelajaran lengkap untuk menguasai kompetensi terkait.',
            'moduleCount'   => $lp->modules_count ?? 0,
            'lessonCount'   => $lp->lessons_count ?? 0,
            'durationLabel' => $duration ? round($duration / 60, 1) . ' Jam' : (($lp->modules_count ?? 0) . ' Modul'),
            'thumbnail'     => $lp->thumbnail ?? $lp->image ?? null,
        ];
    }
}
