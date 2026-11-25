<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\LearningCompletion;
use App\Models\LmsUserBadge;
use App\Models\UserBadge;
use App\Models\LmsUserCertificate;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LearnerBadgeController extends Controller
{
    /**
     * Berikan badge untuk modul yang telah lulus/selesai.
     */
    public function award(Request $request, $moduleId): JsonResponse
    {
        $request->validate([
            'attempt_id' => ['nullable', 'integer', 'min:1'],
            'score'      => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $user = $request->user();

        // 1. CARI MODUL (bisa lewat id numerik atau slug)
        $module = is_numeric($moduleId)
            ? Module::with('learningPath')->find($moduleId)
            : Module::with('learningPath')->where('slug', $moduleId)->orWhere('id', $moduleId)->first();

        if (!$module) {
            return $this->error('Modul tidak ditemukan.', 404);
        }

        // 2. CEK KUIS & HASIL ATTEMPT (jika modul menggunakan kuis)
        $quiz = Quiz::with('questions.options')
            ->where('module_id', $module->id)
            ->first();

        $score = $request->input('score', 92);
        $passingScore = 70;
        $isPassed = true;
        $attempt = null;

        if ($quiz) {
            $passingScore = round($quiz->passing_score ?? 70);

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

            if ($attempt) {
                // Hitung score dari attempt
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
                $isPassed = $attempt->is_passed ?? ($score >= $passingScore);
            }
        }

        // Jika ada kuis dan terbukti belum lulus
        if ($quiz && $attempt && !$isPassed) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Badge hanya dapat diberikan setelah kuis dinyatakan lulus.',
                'data'    => [
                    'score'        => $score,
                    'passingScore' => $passingScore,
                    'isPassed'     => false,
                ],
            ], 422);
        }

        // 3. BADGE METADATA
        $badgeCode = "module_passed_{$module->id}";
        $badgeName = "Lulus: {$module->title}";
        $badgeDescription = "Berhasil menyelesaikan modul {$module->title} dengan predikat sangat baik (Skor: {$score}%).";

        // 4. DATABASE TRANSACTION: RECORD COMPLETION & AWARD USER BADGE
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
            // MODULE COMPLETION
            $completion = LearningCompletion::firstOrCreate(
                [
                    'user_id'   => $user->id,
                    'module_id' => $module->id,
                ],
                [
                    'score'        => $score,
                    'metadata'     => [
                        'source'        => $quiz ? 'quiz_pass' : 'module_completion',
                        'quiz_id'       => $quiz?->id,
                        'attempt_id'    => $attempt?->id,
                        'passing_score' => $passingScore,
                    ],
                    'completed_at' => now(),
                ]
            );

            // AWARD BADGE menggunakan UserBadge
            $badge = UserBadge::firstOrCreate(
                [
                    'user_id'    => $user->id,
                    'badge_code' => $badgeCode,
                ],
                [
                    'completion_id' => $completion->id,
                    'name'          => $badgeName,
                    'description'   => $badgeDescription,
                    'icon'          => 'award',
                    'awarded_at'    => now(),
                ]
            );

            // 5. CEK APAKAH SELURUH MODUL DI LEARNING PATH SUDAH SELESAI
            $learningPath = $module->learningPath;
            $isAllCompleted = false;
            $certificate = null;

            if ($learningPath) {
                $publishedModuleIds = $learningPath->modules()->where('status', 'published')->pluck('id');
                if ($publishedModuleIds->isEmpty()) {
                    $publishedModuleIds = $learningPath->modules()->pluck('id');
                }

                $doneCount = LearningCompletion::where('user_id', $user->id)
                    ->whereIn('module_id', $publishedModuleIds)
                    ->count();

                $totalCount = $publishedModuleIds->count();
                if ($totalCount > 0 && $doneCount >= $totalCount) {
                    $isAllCompleted = true;

                    // Buat Path Completion
                    $pathCompletion = LearningCompletion::firstOrCreate(
                        [
                            'user_id'          => $user->id,
                            'learning_path_id' => $learningPath->id,
                        ],
                        [
                            'completed_at' => now(),
                        ]
                    );

                    // Buat Sertifikat Kelulusan jika belum ada
                    $certNumber = 'KX-CERT-2026-' . strtoupper(Str::random(8));
                    $certificate = LmsUserCertificate::firstOrCreate(
                        [
                            'user_id'       => $user->id,
                            'completion_id' => $pathCompletion->id,
                        ],
                        [
                            'certificate_number' => $certNumber,
                            'title'              => "Sertifikat Kelulusan: {$learningPath->title}",
                            'description'        => "Resmi diterbitkan atas nama {$user->name} untuk menyelesaikan kurikulum {$learningPath->title}.",
                            'issued_at'          => now(),
                            'status'             => 'issued',
                        ]
                    );
                }
            }

            return [
                'completion'     => $completion,
                'badge'          => $badge,
                'newlyAwarded'   => $badge->wasRecentlyCreated,
                'isAllCompleted' => $isAllCompleted,
                'certificate'    => $certificate,
                'learningPath'   => $learningPath,
            ];
        });

        return response()->json([
            'status'  => 'success',
            'message' => $result['newlyAwarded']
                ? 'Selamat! Lencana baru berhasil diperoleh.'
                : 'Lencana untuk modul ini sudah tersimpan di profil Anda.',
            'data'    => [
                'isPassed'       => true,
                'score'          => $score,
                'passingScore'   => $passingScore,
                'newlyAwarded'   => $result['newlyAwarded'],
                'isAllCompleted' => $result['isAllCompleted'],
                'completion'     => [
                    'id'          => $result['completion']->id,
                    'moduleId'    => $module->id,
                    'completedAt' => $result['completion']->completed_at,
                ],
                'badge'          => [
                    'id'          => $result['badge']->id,
                    'code'        => $result['badge']->badge_code,
                    'name'        => $result['badge']->name,
                    'description' => $result['badge']->description,
                    'icon'        => $result['badge']->icon,
                    'awardedAt'   => $result['badge']->awarded_at,
                ],
                'learningPath'   => $result['learningPath'] ? [
                    'id'             => $result['learningPath']->id,
                    'slug'           => $result['learningPath']->slug ?? $result['learningPath']->id,
                    'title'          => $result['learningPath']->title,
                    'isAllCompleted' => $result['isAllCompleted'],
                ] : null,
                'certificate'    => $result['certificate'],
            ],
        ], $result['newlyAwarded'] ? 201 : 200);
    }

    /**
     * Cek status badge user untuk modul tertentu.
     */
    public function status(Request $request, $moduleId): JsonResponse
    {
        $user = $request->user();

        $module = is_numeric($moduleId)
            ? Module::find($moduleId)
            : Module::where('slug', $moduleId)->orWhere('id', $moduleId)->first();

        if (!$module) {
            return $this->error('Modul tidak ditemukan.', 404);
        }

        $badge = UserBadge::where('user_id', $user->id)
            ->where(function ($q) use ($module) {
                $q->where('badge_code', "module_passed_{$module->id}")
                  ->orWhere('badge_code', "module-{$module->id}-complete");
            })
            ->first();

        return response()->json([
            'status'  => 'success',
            'data'    => [
                'hasBadge' => !is_null($badge),
                'badge'    => $badge ? [
                    'id'          => $badge->id,
                    'code'        => $badge->badge_code,
                    'name'        => $badge->name,
                    'description' => $badge->description,
                    'icon'        => $badge->icon,
                    'awardedAt'   => $badge->awarded_at,
                ] : null,
            ],
        ]);
    }

    private function error(string $message, int $code): JsonResponse
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
        ], $code);
    }
}
