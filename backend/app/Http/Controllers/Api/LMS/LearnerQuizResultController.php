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
    public function show(Request $request, int $moduleId): JsonResponse
    {
        $user = $request->user();

        // MODULE
        $module = Module::with([
            'learningPath',
            'lessons' => fn ($q) => $q->orderBy(
                Schema::hasColumn('lessons', 'order_index') ? 'order_index' : 'id'
            ),
        ])->find($moduleId);

        if (!$module) {
            return $this->error('Modul tidak ditemukan.', 404);
        }

        // QUIZ
        $quiz = Quiz::with('questions.options')
            ->where('module_id', $moduleId)
            ->first();

        if (!$quiz) {
            return $this->error('Kuis pada modul ini tidak ditemukan.', 404);
        }

        // QUIZ ATTEMPT
        $attemptQuery = QuizAttempt::with([
            'answers.selectedOption',
            'readinessPrediction',
        ])
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereIn('status', ['submitted', 'graded']);

        $attemptQuery->when(
            $request->filled('attempt_id'),
            fn ($q) => $q->where('id', $request->query('attempt_id')),
            fn ($q) => $q->latest('completed_at')->latest('id')
        );

        $attempt = $attemptQuery->first();

        if (!$attempt) {
            return $this->error(
                'Belum ada hasil kuis yang diselesaikan untuk modul ini.',
                404
            );
        }

        // ANSWER SUMMARY
        $answers = $attempt->answers->keyBy('question_id');
        $questions = $quiz->questions;
        $lessons = $module->lessons->values();

        $correct = $wrong = $unanswered = 0;
        $remedialLessons = [];

        foreach ($questions as $index => $question) {
            $answer = $answers->get($question->id);
            $selected = $answer?->selectedOption;
            $correctOption = $question->options->firstWhere('is_correct', true);

            $isUnanswered = !$answer ||
                (!$answer->selected_option_id && empty($answer->answer_text));

            $isCorrect = !$isUnanswered && (
                $answer->is_correct !== null
                    ? (bool) $answer->is_correct
                    : (bool) ($selected?->is_correct ?? false)
            );

            if ($isUnanswered) {
                $unanswered++;
            } elseif ($isCorrect) {
                $correct++;
            } else {
                $wrong++;
            }

            if (!$isCorrect) {
                $lesson = $this->resolveLesson($question, $index, $lessons);

                $lessonIndex = $lesson
                    ? $lessons->search(fn ($item) => $item->id === $lesson->id)
                    : false;

                $number = $lessonIndex !== false
                    ? $lessonIndex + 1
                    : $index + 1;

                $remedialLessons[] = [
                    'id' => (string) $question->id,
                    'questionId' => $question->id,
                    'lessonId' => $lesson?->id,
                    'lessonNumber' => $number,
                    'title' => $lesson
                        ? "Lesson {$number} — {$lesson->title}"
                        : 'Soal #' . ($index + 1),
                    'status' => $isUnanswered ? 'Terlewat' : 'Salah',
                    'question' => $question->question_text,
                    'userAnswer' => $isUnanswered
                        ? 'Belum dijawab'
                        : ($selected
                            ? "{$selected->option_label}. {$selected->option_text}"
                            : ($answer->answer_text ?? 'Belum dijawab')),
                    'correctAnswer' => $correctOption
                        ? "{$correctOption->option_label}. {$correctOption->option_text}"
                        : '-',
                    'explanation' => $question->explanation,
                    'actionText' => $lesson
                        ? "Pelajari Lesson {$number}"
                        : 'Tinjau Materi',
                ];
            }
        }

        // SCORE & READINESS
        $total = $questions->count();
        $answered = $correct + $wrong;

        $score = round(
            $attempt->score ?? ($total ? ($correct / $total) * 100 : 0)
        );

        $passingScore = round($quiz->passing_score ?? 70);
        $isPassed = $attempt->is_passed ?? ($score >= $passingScore);

        $readiness = $attempt->readinessPrediction?->readiness_level
            ?? (!$isPassed ? 'belum_siap' : ($score >= 85 ? 'siap' : 'cukup_siap'));

        // RESPONSE
        return response()->json([
            'status' => 'success',
            'data' => [
                'moduleId' => $module->id,
                'moduleTitle' => $module->title,
                'quizTitle' => $quiz->title,
                'attemptId' => $attempt->id,

                'outcome' => [
                    'id' => (string) $attempt->id,
                    'score' => $score,
                    'passingScore' => $passingScore,
                    'isPassed' => (bool) $isPassed,
                    'readinessLevel' => $readiness,
                    'metrics' => [
                        'correct' => $correct,
                        'wrong' => $wrong,
                        'unanswered' => $unanswered,
                        'total' => $total,
                        'answeredStr' => "{$answered}/{$total} Soal diisi",
                    ],
                    'duration' => $this->formatDuration(
                        $attempt->started_at,
                        $attempt->completed_at
                    ),
                    'remedialCount' => count($remedialLessons),
                ],

                'remedialLessons' => $remedialLessons,
                'recommendations' => $this->getRecommendations($user->id, $module),
            ],
        ]);
    }

    // ERROR RESPONSE
    private function error(string $message, int $code): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $code);
    }

    // FIND RELATED LESSON
    private function resolveLesson($question, int $index, $lessons): ?Lesson
    {
        return $lessons->isEmpty()
            ? null
            : (
                $lessons->firstWhere('id', $question->lesson_id)
                ?? $lessons->get($index % $lessons->count())
            );
    }

    // FORMAT QUIZ DURATION
    private function formatDuration(?Carbon $start, ?Carbon $end): string
    {
        if (!$start || !$end) {
            return '-';
        }

        $seconds = max(0, $start->diffInSeconds($end));

        return sprintf('%02dm %02ds', intdiv($seconds, 60), $seconds % 60);
    }

    // RECOMMENDATIONS
    private function getRecommendations(int $userId, Module $currentModule): array
    {
        $items = [];

        $recommendations = Recommendation::where('user_id', $userId)
            ->orderBy('rank_position')
            ->limit(3)
            ->get();

        foreach ($recommendations as $rec) {
            $item = match ($rec->content_type) {
                'lesson' => Lesson::with('module.learningPath')->find($rec->content_id),
                'module' => Module::with('learningPath')
                    ->withCount('lessons')
                    ->find($rec->content_id),
                'learning_path' => LearningPath::withCount(['modules', 'lessons'])
                    ->find($rec->content_id),
                default => null,
            };

            if (!$item) {
                continue;
            }

            $items[] = match ($rec->content_type) {
                'lesson' => $this->mapLesson($item),
                'module' => $this->mapModule($item),
                'learning_path' => $this->mapLearningPath($item),
            };
        }

        // FALLBACK RECOMMENDATIONS
        if (count($items) < 3) {
            $lesson = Lesson::with('module.learningPath')
                ->where('module_id', '!=', $currentModule->id)
                ->when(
                    Schema::hasColumn('lessons', 'is_published'),
                    fn ($q) => $q->where('is_published', true)
                )
                ->inRandomOrder()
                ->first();

            if ($lesson) {
                $items[] = $this->mapLesson($lesson);
            }
        }

        if (count($items) < 3) {
            $module = Module::with('learningPath')
                ->withCount('lessons')
                ->where('id', '!=', $currentModule->id)
                ->when(
                    Schema::hasColumn('modules', 'is_published'),
                    fn ($q) => $q->where('is_published', true)
                )
                ->inRandomOrder()
                ->first();

            if ($module) {
                $items[] = $this->mapModule($module);
            }
        }

        if (count($items) < 3) {
            $path = LearningPath::withCount(['modules', 'lessons'])
                ->where('id', '!=', $currentModule->learning_path_id)
                ->when(
                    Schema::hasColumn('learning_paths', 'is_published'),
                    fn ($q) => $q->where('is_published', true)
                )
                ->inRandomOrder()
                ->first();

            if ($path) {
                $items[] = $this->mapLearningPath($path);
            }
        }

        return array_slice($items, 0, 3);
    }

    // RECOMMENDATION CARD MAPPERS
    private function mapLesson(Lesson $lesson): array
    {
        $duration = $lesson->duration_minutes ?? $lesson->estimated_minutes;

        return [
            'id' => (string) $lesson->id,
            'type' => 'lesson',
            'moduleId' => $lesson->module_id,
            'learningPathSlug' => $lesson->module?->learningPath?->slug
                ?? $lesson->module?->learning_path_id,
            'title' => $lesson->title,
            'description' => $lesson->description
                ?? $lesson->summary
                ?? 'Pelajari materi lesson ini untuk memperkuat pemahamanmu.',
            'durationLabel' => $duration ? "{$duration} Menit" : 'Lesson',
            'thumbnail' => $lesson->thumbnail
                ?? $lesson->image
                ?? $lesson->module?->thumbnail,
        ];
    }

    private function mapModule(Module $module): array
    {
        $duration = $module->duration_minutes ?? $module->estimated_minutes;

        return [
            'id' => (string) $module->id,
            'type' => 'module',
            'learningPathSlug' => $module->learningPath?->slug
                ?? $module->learning_path_id,
            'title' => $module->title,
            'description' => $module->description
                ?? 'Modul pembelajaran terstruktur untuk memperdalam konsep terkait.',
            'lessonCount' => $module->lessons_count ?? 0,
            'level' => $module->level ?? 'Menengah',
            'durationLabel' => $duration
                ? "{$duration} Menit"
                : (($module->lessons_count ?? 0) . ' Lesson'),
            'isEnrolled' => false,
            'thumbnail' => $module->thumbnail
                ?? $module->image
                ?? $module->learningPath?->thumbnail,
        ];
    }

    private function mapLearningPath(LearningPath $path): array
    {
        $duration = $path->duration_minutes ?? $path->estimated_minutes;

        return [
            'id' => (string) $path->id,
            'slug' => $path->slug ?? (string) $path->id,
            'type' => 'learning_path',
            'title' => $path->title,
            'description' => $path->description
                ?? 'Jalur pembelajaran lengkap untuk menguasai kompetensi terkait.',
            'moduleCount' => $path->modules_count ?? 0,
            'lessonCount' => $path->lessons_count ?? 0,
            'durationLabel' => $duration
                ? round($duration / 60, 1) . ' Jam'
                : (($path->modules_count ?? 0) . ' Modul'),
            'thumbnail' => $path->thumbnail ?? $path->image,
        ];
    }
}
