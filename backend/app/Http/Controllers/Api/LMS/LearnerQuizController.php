<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Services\Lms\CompletionService;
use App\Services\Lms\LearningDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LearnerQuizController extends Controller
{
    /** Toleransi (detik) untuk latensi jaringan setelah timer habis. */
    private const GRACE_SECONDS = 10;

    public function __construct(
        private readonly LearningDataService $learningDataService,
        private readonly CompletionService $completionService,
    ) {}

    /**
     * GET member/modules/{moduleId}/quiz
     * Metadata kuis + riwayat attempt (untuk halaman detail modul).
     */
    public function show(Request $request, int $moduleId): JsonResponse
    {
        $quiz = $this->publishedQuiz($moduleId);

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->orderBy('attempt_number')
            ->get();

        return response()->json([
            'data' => [
                'id'                 => $quiz->id,
                'title'              => $quiz->title,
                'description'        => $quiz->description,
                'bloom_level'        => $quiz->bloom_level,
                'time_limit_minutes' => $quiz->time_limit_minutes,
                'passing_score'      => (float) $quiz->passing_score,
                'question_count'     => $quiz->questions()->count(),
                'has_in_progress'    => $attempts->contains('status', 'in_progress'),
                'best_score'         => $attempts->where('status', 'graded')->max('score'),
                'is_passed'          => $attempts->contains('is_passed', true),
                'attempts'           => $attempts->map(fn (QuizAttempt $a) => [
                    'id'             => $a->id,
                    'attempt_number' => $a->attempt_number,
                    'status'         => $a->status,
                    'score'          => $a->score !== null ? (float) $a->score : null,
                    'is_passed'      => $a->is_passed,
                    'completed_at'   => $a->completed_at?->toIso8601String(),
                ])->values(),
            ],
        ]);
    }

    /**
     * POST member/modules/{moduleId}/quiz/start
     * Mulai attempt baru, atau lanjutkan attempt in_progress (idempotent).
     */
    public function start(Request $request, int $moduleId): JsonResponse
    {
        $quiz   = $this->publishedQuiz($moduleId);
        $userId = $request->user()->id;

        $attempt = DB::transaction(function () use ($quiz, $userId) {
            // Kunci baris kuis agar request ganda (mis. StrictMode / double click)
            // tidak membuat dua attempt sekaligus.
            Quiz::whereKey($quiz->id)->lockForUpdate()->first();

            $existing = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $userId)
                ->where('status', 'in_progress')
                ->first();

            if ($existing) {
                return $existing;
            }

            $nextNumber = (int) QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $userId)
                ->max('attempt_number') + 1;

            return QuizAttempt::create([
                'user_id'        => $userId,
                'quiz_id'        => $quiz->id,
                'attempt_number' => $nextNumber,
                'status'         => 'in_progress',
                'started_at'     => now(),
            ]);
        });

        if ($attempt->wasRecentlyCreated) {
            $attempt->setRelation('quiz', $quiz);
            $this->learningDataService->recordQuizStarted($userId, $attempt, [
                'module_id' => $moduleId,
            ]);
        }

        $questions = $quiz->questions()->with(['options' => fn ($q) => $q->orderBy('order_index')])->get();

        if ($questions->isEmpty()) {
            abort(422, 'Kuis ini belum memiliki soal.');
        }

        $saved = QuizAnswer::where('attempt_id', $attempt->id)
            ->whereNotNull('selected_option_id')
            ->pluck('selected_option_id', 'question_id');

        return response()->json([
            'data' => [
                'quiz' => [
                    'id'                 => $quiz->id,
                    'title'              => $quiz->title,
                    'description'        => $quiz->description,
                    'time_limit_minutes' => $quiz->time_limit_minutes,
                    'passing_score'      => (float) $quiz->passing_score,
                    // is_correct & explanation sengaja TIDAK dikirim di sini
                    'questions'          => $questions->map(fn ($q) => [
                        'id'       => $q->id,
                        'bloom'    => $q->bloom_level,
                        'question' => $q->question_text,
                        'options'  => $q->options->map(fn ($o) => [
                            'id'   => $o->id,
                            'key'  => $o->option_label,
                            'text' => $o->option_text,
                        ])->values(),
                    ])->values(),
                ],
                'attempt' => [
                    'id'                => $attempt->id,
                    'attempt_number'    => $attempt->attempt_number,
                    'started_at'        => $attempt->started_at->toIso8601String(),
                    'remaining_seconds' => $this->remainingSeconds($quiz, $attempt),
                    'answers'           => (object) $saved->all(), // { questionId: optionId }
                ],
            ],
        ]);
    }

    /**
     * PUT member/modules/{moduleId}/quiz/attempts/{attemptId}/answers
     * Autosave satu jawaban.
     */
    public function saveAnswer(Request $request, int $moduleId, int $attemptId): JsonResponse
    {
        $quiz    = $this->publishedQuiz($moduleId);
        $attempt = $this->ownedAttempt($request, $quiz, $attemptId);

        $this->ensureInProgress($attempt);

        if ($this->isExpired($quiz, $attempt, self::GRACE_SECONDS)) {
            abort(422, 'Waktu pengerjaan sudah habis.');
        }

        $data = $request->validate([
            'question_id' => ['required', 'integer'],
            'option_id'   => ['nullable', 'integer'],
        ]);

        $question = $quiz->questions()->whereKey($data['question_id'])->first();
        abort_if(! $question, 422, 'Soal tidak termasuk dalam kuis ini.');

        $optionId = $data['option_id'] ?? null;
        if ($optionId !== null) {
            abort_unless(
                $question->options()->whereKey($optionId)->exists(),
                422,
                'Opsi tidak valid untuk soal ini.'
            );
        }

        QuizAnswer::updateOrCreate(
            ['attempt_id' => $attempt->id, 'question_id' => $question->id],
            ['selected_option_id' => $optionId, 'answered_at' => now()]
        );

        return response()->json(['data' => ['saved' => true]]);
    }

    /**
     * POST member/modules/{moduleId}/quiz/attempts/{attemptId}/submit
     * Nilai attempt di server. Idempotent: submit ulang mengembalikan hasil yang sama.
     */
    public function submit(Request $request, int $moduleId, int $attemptId): JsonResponse
    {
        $quiz = $this->publishedQuiz($moduleId);
        $this->ownedAttempt($request, $quiz, $attemptId);

        $payload = $request->validate([
            'answers'               => ['nullable', 'array'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.option_id'   => ['nullable', 'integer'],
        ]);

        $wasJustGraded = false;

        $attempt = DB::transaction(function () use ($quiz, $attemptId, $payload, &$wasJustGraded) {
            $attempt = QuizAttempt::whereKey($attemptId)->lockForUpdate()->firstOrFail();

            if ($attempt->status !== 'in_progress') {
                return $attempt; // sudah dinilai
            }

            $questions = $quiz->questions()->with('options')->get();

            // Pilihan dari payload hanya dipakai jika masih dalam batas waktu;
            // selebihnya dinilai dari jawaban yang sudah tersimpan (autosave).
            $chosen = QuizAnswer::where('attempt_id', $attempt->id)
                ->pluck('selected_option_id', 'question_id')
                ->all();

            if (! $this->isExpired($quiz, $attempt, self::GRACE_SECONDS)) {
                foreach ($payload['answers'] ?? [] as $row) {
                    $chosen[$row['question_id']] = $row['option_id'] ?? null;
                }
            }

            // Submit manual harus lengkap; jawaban parsial hanya diterima
            // jika waktu sudah habis (auto-submit dari client).
            if (! $this->isExpired($quiz, $attempt)) {
                $unanswered = $questions->filter(fn ($q) => empty($chosen[$q->id]))->count();
                abort_if($unanswered > 0, 422, 'Semua soal harus dijawab sebelum mengirim.');
            }

            $correctCount = 0;

            foreach ($questions as $question) {
                $optionId = $chosen[$question->id] ?? null;
                $selected = $optionId ? $question->options->firstWhere('id', $optionId) : null;
                $isCorrect = $selected ? (bool) $selected->is_correct : false;

                if ($isCorrect) {
                    $correctCount++;
                }

                QuizAnswer::updateOrCreate(
                    ['attempt_id' => $attempt->id, 'question_id' => $question->id],
                    [
                        'selected_option_id' => $selected?->id,
                        'is_correct'         => $selected ? $isCorrect : false,
                        'answered_at'        => $selected ? now() : null,
                    ]
                );
            }

            $total = $questions->count();
            $score = $total > 0 ? round(($correctCount / $total) * 100, 2) : 0;

            $attempt->update([
                'score'        => $score,
                'is_passed'    => $score >= (float) $quiz->passing_score,
                'status'       => 'graded',
                'completed_at' => now(),
            ]);

            $wasJustGraded = true;

            return $attempt->fresh();
        });

        if ($wasJustGraded) {
            $attempt->setRelation('quiz', $quiz);
            $this->learningDataService->recordQuizSubmitted($request->user()->id, $attempt, [
                'module_id' => $moduleId,
            ]);
        }

        return response()->json(['data' => $this->resultPayload($quiz, $attempt)]);
    }

    /**
     * GET member/modules/{moduleId}/quiz/attempts/{attemptId}
     * Hasil + review attempt yang sudah dinilai.
     */
    public function result(Request $request, int $moduleId, int $attemptId): JsonResponse
    {
        $quiz    = $this->publishedQuiz($moduleId);
        $attempt = $this->ownedAttempt($request, $quiz, $attemptId);

        abort_if($attempt->status === 'in_progress', 409, 'Attempt belum diselesaikan.');

        return response()->json(['data' => $this->resultPayload($quiz, $attempt)]);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private function publishedQuiz(int $moduleId): Quiz
    {
        return Quiz::where('module_id', $moduleId)
            ->where('is_published', true)
            ->firstOrFail();
    }

    private function ownedAttempt(Request $request, Quiz $quiz, int $attemptId): QuizAttempt
    {
        return QuizAttempt::whereKey($attemptId)
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
    }

    private function ensureInProgress(QuizAttempt $attempt): void
    {
        abort_if($attempt->status !== 'in_progress', 409, 'Attempt sudah diselesaikan.');
    }

    private function deadline(Quiz $quiz, QuizAttempt $attempt): ?\Illuminate\Support\Carbon
    {
        return $quiz->time_limit_minutes
            ? $attempt->started_at->copy()->addMinutes($quiz->time_limit_minutes)
            : null;
    }

    private function remainingSeconds(Quiz $quiz, QuizAttempt $attempt): ?int
    {
        $deadline = $this->deadline($quiz, $attempt);

        return $deadline ? max(0, now()->diffInSeconds($deadline, false)) : null;
    }

    private function isExpired(Quiz $quiz, QuizAttempt $attempt, int $graceSeconds = 0): bool
    {
        $deadline = $this->deadline($quiz, $attempt);

        return $deadline !== null && now()->greaterThan($deadline->copy()->addSeconds($graceSeconds));
    }

    private function resultPayload(Quiz $quiz, QuizAttempt $attempt): array
    {
        $questions = $quiz->questions()->with('options')->get();
        $answers   = QuizAnswer::where('attempt_id', $attempt->id)->get()->keyBy('question_id');

        $review = $questions->map(function ($q, $i) use ($answers) {
            $answer = $answers->get($q->id);

            return [
                'question_id'        => $q->id,
                'order'              => $i + 1,
                'question'           => $q->question_text,
                'selected_option_id' => $answer?->selected_option_id,
                'correct_option_id'  => $q->options->firstWhere('is_correct', true)?->id,
                'is_correct'         => (bool) $answer?->is_correct,
                'explanation'        => $q->explanation,
            ];
        })->values();

        return [
            'attempt_id'      => $attempt->id,
            'attempt_number'  => $attempt->attempt_number,
            'score'           => (float) $attempt->score,
            'is_passed'       => (bool) $attempt->is_passed,
            'passing_score'   => (float) $quiz->passing_score,
            'correct_count'   => $review->where('is_correct', true)->count(),
            'total_questions' => $questions->count(),
            'completed_at'    => $attempt->completed_at?->toIso8601String(),
            'review'          => $review,
        ];
    }
}
