<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\LearningCompletion;
use App\Models\LmsUserBadge;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LearnerBadgeController extends Controller
{
    public function award(Request $request, int $moduleId): JsonResponse
    {
        $request->validate([
            'attempt_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        // MODULE
        $module = Module::find($moduleId);

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
        $attemptQuery = QuizAttempt::with('answers.selectedOption')
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereIn('status', ['submitted', 'graded']);

        $attemptQuery->when(
            $request->filled('attempt_id'),
            fn ($q) => $q->where('id', $request->input('attempt_id')),
            fn ($q) => $q->latest('completed_at')->latest('id')
        );

        $attempt = $attemptQuery->first();

        if (!$attempt) {
            return $this->error(
                'Hasil kuis yang valid tidak ditemukan.',
                404
            );
        }

        // CALCULATE SCORE
        $answers = $attempt->answers->keyBy('question_id');
        $questions = $quiz->questions;

        $total = $questions->count();
        $correct = 0;

        foreach ($questions as $question) {
            $answer = $answers->get($question->id);
            $selected = $answer?->selectedOption;

            $isUnanswered = !$answer ||
                (!$answer->selected_option_id && empty($answer->answer_text));

            $isCorrect = !$isUnanswered && (
                $answer->is_correct !== null
                    ? (bool) $answer->is_correct
                    : (bool) ($selected?->is_correct ?? false)
            );

            if ($isCorrect) {
                $correct++;
            }
        }

        $score = round(
            $attempt->score ?? ($total ? ($correct / $total) * 100 : 0)
        );

        $passingScore = round($quiz->passing_score ?? 70);

        $isPassed = $attempt->is_passed ?? ($score >= $passingScore);

        // ONLY PASSED ATTEMPTS CAN RECEIVE A BADGE
        if (!$isPassed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Badge hanya dapat diberikan setelah kuis dinyatakan lulus.',
                'data' => [
                    'score' => $score,
                    'passingScore' => $passingScore,
                    'isPassed' => false,
                ],
            ], 422);
        }

        // BADGE DATA
        $badgeCode = "module_passed_{$module->id}";

        $badgeName = "Lulus: {$module->title}";

        $badgeDescription = "Berhasil menyelesaikan kuis modul {$module->title} dengan skor {$score}.";

        // CREATE COMPLETION AND AWARD BADGE
        $result = DB::transaction(function () use (
            $user,
            $module,
            $quiz,
            $attempt,
            $score,
            $passingScore,
            $badgeCode,
            $badgeName,
            $badgeDescription
        ) {
            // Serialize badge creation for this user.
            DB::table('users')
                ->where('id', $user->id)
                ->lockForUpdate()
                ->first();

            // MODULE COMPLETION
            $completion = LearningCompletion::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'module_id' => $module->id,
                ],
                [
                    'score' => $score,
                    'metadata' => [
                        'source' => 'quiz_pass',
                        'quiz_id' => $quiz->id,
                        'attempt_id' => $attempt->id,
                        'passing_score' => $passingScore,
                    ],
                    'completed_at' => now(),
                ]
            );

            // AWARD BADGE
            $badge = LmsUserBadge::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'badge_code' => $badgeCode,
                ],
                [
                    'completion_id' => $completion->id,
                    'name' => $badgeName,
                    'description' => $badgeDescription,
                    'icon' => 'award',
                    'awarded_at' => now(),
                ]
            );

            return [
                'completion' => $completion,
                'badge' => $badge,
                'newlyAwarded' => $badge->wasRecentlyCreated,
            ];
        });

        // RESPONSE
        return response()->json([
            'status' => 'success',
            'message' => $result['newlyAwarded']
                ? 'Selamat! Badge berhasil diperoleh.'
                : 'Badge untuk modul ini sudah pernah diperoleh.',
            'data' => [
                'isPassed' => true,
                'score' => $score,
                'passingScore' => $passingScore,
                'newlyAwarded' => $result['newlyAwarded'],

                'completion' => [
                    'id' => $result['completion']->id,
                    'moduleId' => $module->id,
                    'completedAt' => $result['completion']->completed_at,
                ],

                'badge' => [
                    'id' => $result['badge']->id,
                    'code' => $result['badge']->badge_code,
                    'name' => $result['badge']->name,
                    'description' => $result['badge']->description,
                    'icon' => $result['badge']->icon,
                    'awardedAt' => $result['badge']->awarded_at,
                ],
            ],
        ], $result['newlyAwarded'] ? 201 : 200);
    }

    private function error(string $message, int $code): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $code);
    }
}
