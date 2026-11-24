<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use App\Models\LearningPath;
use App\Models\LearningCompletion;
use App\Models\Lesson;
use App\Models\Quiz;

class CredentialApiController extends Controller
{
    /**
     * 1. Main Function
     * Mengatur proses pengiriman credential Learning Path.
     */
    public function sendCredential(Request $request, $learningPathId)
    {
        $user = $request->user();

        $learningPath = LearningPath::with([
            'modules.lessons.quizzes'
        ])->findOrFail($learningPathId);

        // Validasi penyelesaian Learning Path
        $validation = $this->validateLearningPath(
            $learningPath,
            $user->id
        );

        if ($validation !== true) {
            return response()->json([
                'success' => false,
                'message' => $validation
            ], 422);
        }

        // Susun satu payload untuk seluruh Learning Path
        $payload = $this->buildLearningPathPayload(
            $learningPath,
            $user->id
        );

        // Kirim satu kali ke Credential API
        $result = $this->dispatchCredential($payload);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['success']
                ? 'Credential Learning Path berhasil dikirim.'
                : 'Credential Learning Path gagal dikirim.',
            'data' => $result
        ], $result['success'] ? 200 : 502);
    }


    /**
     * 2. Validate Learning Path
     * Memastikan seluruh Lesson, Quiz, dan Learning Path selesai.
     */
    private function validateLearningPath($learningPath, $userId)
    {
        $modules = $learningPath->modules;

        if ($modules->isEmpty()) {
            return 'Learning Path belum memiliki Module.';
        }

        $lessons = $modules->flatMap(
            fn ($module) => $module->lessons
        );

        $quizzes = $lessons->flatMap(
            fn ($lesson) => $lesson->quizzes
        );

        $lessonType = (new Lesson())->getMorphClass();
        $quizType = (new Quiz())->getMorphClass();
        $pathType = $learningPath->getMorphClass();

        $completions = LearningCompletion::where(
            'user_id',
            $userId
        )
        ->whereIn('completable_type', [
            $lessonType,
            $quizType,
            $pathType
        ])
        ->get()
        ->keyBy(fn ($item) =>
            $item->completable_type . ':' .
            $item->completable_id
        );

        // Validasi seluruh Lesson
        foreach ($lessons as $lesson) {
            $completion = $completions->get(
                $lessonType . ':' . $lesson->id
            );

            if (!$completion || !$completion->completed_at) {
                return 'Masih terdapat Lesson yang belum selesai.';
            }
        }

        // Validasi seluruh Quiz
        foreach ($quizzes as $quiz) {
            $completion = $completions->get(
                $quizType . ':' . $quiz->id
            );

            if (
                !$completion ||
                !$completion->completed_at ||
                $completion->score === null
            ) {
                return 'Masih terdapat Quiz yang belum diselesaikan.';
            }

            if (
                $quiz->passing_score === null ||
                $completion->score < $quiz->passing_score
            ) {
                return 'Terdapat Quiz yang belum memenuhi passing score.';
            }
        }

        // Validasi penyelesaian Learning Path
        $pathCompletion = $completions->get(
            $pathType . ':' . $learningPath->id
        );

        if (!$pathCompletion || !$pathCompletion->completed_at) {
            return 'Learning Path belum ditandai selesai.';
        }

        return true;
    }


    /**
     * 3. Build Learning Path Payload
     * Mengumpulkan seluruh nilai Quiz dalam Learning Path.
     */
    private function buildLearningPathPayload($learningPath, $userId)
    {
        $quizType = (new Quiz())->getMorphClass();

        // Ambil seluruh Quiz dari semua Module
        $quizIds = $learningPath->modules
            ->flatMap(fn ($module) => $module->lessons)
            ->flatMap(fn ($lesson) => $lesson->quizzes)
            ->pluck('id');

        // Ambil nilai Quiz Member
        $scores = LearningCompletion::where(
            'user_id',
            $userId
        )
        ->where('completable_type', $quizType)
        ->whereIn('completable_id', $quizIds)
        ->whereNotNull('score')
        ->pluck('score');

        $averageScore = $scores->isNotEmpty()
            ? round($scores->avg(), 2)
            : null;

        return [
            'user_id' => $userId,
            'learning_path_id' => $learningPath->id,
            'score' => $averageScore,
            'status_lulus' => true,
            'timestamp' => now()->utc()->toIso8601String()
        ];
    }


    /**
     * 4. Dispatch Credential
     * Mengirim payload ke Credential API Brigitta.
     */
    private function dispatchCredential(array $payload)
    {
        $apiUrl = config('services.credential.url');
        $apiToken = config('services.credential.token');

        if (!$apiUrl) {
            return [
                'learning_path_id' => $payload['learning_path_id'],
                'success' => false,
                'message' => 'Credential API URL belum dikonfigurasi.'
            ];
        }

        try {
            $http = Http::acceptJson()
                ->asJson()
                ->timeout(20);

            if ($apiToken) {
                $http->withToken($apiToken);
            }

            $response = $http->post($apiUrl, $payload);

            return [
                'learning_path_id' => $payload['learning_path_id'],
                'success' => $response->successful(),
                'response' => $response->json()
            ];

        } catch (\Throwable $e) {

            Log::error('Credential API Error', [
                'learning_path_id' => $payload['learning_path_id'],
                'error' => $e->getMessage()
            ]);

            return [
                'learning_path_id' => $payload['learning_path_id'],
                'success' => false,
                'message' => 'Gagal menghubungi Credential API.'
            ];
        }
    }
}
