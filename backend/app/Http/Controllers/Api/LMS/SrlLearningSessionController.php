<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\SrlLearningSession;
use App\Services\Lms\LearningDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SrlLearningSessionController extends Controller
{
    public function __construct(private readonly LearningDataService $learningDataService)
    {
    }
    /**
     * Cek apakah user memiliki sesi SRL yang sedang aktif/planned saat modal dibuka.
     */
    public function active(Request $request): JsonResponse
    {
        $session = SrlLearningSession::where('user_id', $request->user()->id)
            ->ongoing()
            ->with('materials.target')
            ->latest()
            ->first();

        return response()->json([
            'session' => $session,
        ]);
    }

    /**
     * Phase 1 (Forethought): Membuat rencana sesi belajar baru dari SRL Modal.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'goal' => ['required', 'string', 'max:1000'],
            'motivation' => ['nullable', 'string', 'max:1000'],
            'strategies' => ['nullable', 'array'],
            'strategies.*' => ['string', 'max:255'],
            'estimated_minutes' => ['nullable', 'integer', 'min:5', 'max:300'],
            'confidence_level' => ['nullable', 'integer', 'min:1', 'max:5'],
            'start_immediately' => ['boolean'],
        ]);

        // Pastikan tidak ada sesi ongoing yang menggantung
        $hasOngoing = SrlLearningSession::where('user_id', $request->user()->id)
            ->ongoing()
            ->exists();

        if ($hasOngoing) {
            return response()->json([
                'message' => 'Selesaikan atau batalkan sesi belajar yang sedang aktif terlebih dahulu.',
            ], 422);
        }

        $startNow = $request->boolean('start_immediately', true);

        $session = SrlLearningSession::create([
            'user_id' => $request->user()->id,
            'status' => $startNow ? 'in_progress' : 'planned',
            'current_phase' => $startNow ? 'performance' : 'forethought',
            'goal' => $validated['goal'],
            'motivation' => $validated['motivation'] ?? null,
            'strategies' => $validated['strategies'] ?? [],
            'estimated_minutes' => $validated['estimated_minutes'] ?? 25,
            'confidence_level' => $validated['confidence_level'] ?? null,
            'started_at' => $startNow ? now() : null,
        ]);

        if ($startNow) {
            $this->learningDataService->recordSrlSessionActivity(
                userId: $request->user()->id,
                session: $session,
                activityType: 'srl_session_started',
                target: $session
            );
        }

        return response()->json([
            'message' => 'Sesi SRL berhasil dibuat.',
            'session' => $session->load('materials.target'),
        ], 201);
    }

    /**
     * Memulai sesi yang sebelumnya berstatus 'planned'.
     */
    public function start(Request $request, SrlLearningSession $srlLearningSession): JsonResponse
    {
        $this->authorizeSession($request, $srlLearningSession);

        $srlLearningSession->update([
            'status' => 'in_progress',
            'current_phase' => 'performance',
            'started_at' => $srlLearningSession->started_at ?? now(),
        ]);

        $this->learningDataService->recordSrlSessionActivity(
            userId: $request->user()->id,
            session: $srlLearningSession,
            activityType: 'srl_session_started',
            target: $srlLearningSession
        );

        return response()->json([
            'message' => 'Sesi pembelajaran dimulai.',
            'session' => $srlLearningSession->fresh('materials.target'),
        ]);
    }

    /**
     * Phase 2 (Performance): Simpan timer, catatan, atau level fokus secara berkala.
     */
    public function syncProgress(Request $request, SrlLearningSession $srlLearningSession): JsonResponse
    {
        $this->authorizeSession($request, $srlLearningSession);

        $validated = $request->validate([
            'accumulated_seconds' => ['sometimes', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'focus_level' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $srlLearningSession->update($validated);

        return response()->json([
            'session' => $srlLearningSession,
        ]);
    }

    /**
     * Mencatat/mendeteksi materi yang dibuka learner selama sesi berlangsung.
     */
    public function trackMaterial(Request $request, SrlLearningSession $srlLearningSession): JsonResponse
    {
        $this->authorizeSession($request, $srlLearningSession);

        if ($srlLearningSession->status !== 'in_progress') {
            return response()->json([
                'message' => 'Materi hanya dicatat saat sesi berstatus in_progress.',
            ], 422);
        }

        $validated = $request->validate([
            'target_type' => ['required', 'string', Rule::in(['lesson', 'module', 'quiz'])],
            'target_id' => ['required', 'integer'],
            'activity_type' => ['nullable', 'string', 'max:50'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'is_completed' => ['nullable', 'boolean'],
        ]);

        $modelClass = match ($validated['target_type']) {
            'lesson' => Lesson::class,
            'module' => Module::class,
            'quiz' => Quiz::class,
        };

        $target = $modelClass::findOrFail($validated['target_id']);

        $material = $srlLearningSession->trackMaterial(
            target: $target,
            activityType: $validated['activity_type'] ?? 'viewed',
            additionalSeconds: $validated['duration_seconds'] ?? 0,
            isCompleted: $validated['is_completed'] ?? false,
        );

        $this->learningDataService->recordSrlSessionActivity(
            userId: $request->user()->id,
            session: $srlLearningSession,
            activityType: $validated['activity_type'] ?? 'viewed',
            target: $target,
            durationSeconds: $validated['duration_seconds'] ?? 0,
            metadata: ['is_completed' => $validated['is_completed'] ?? false]
        );

        return response()->json([
            'material' => $material->load('target'),
        ]);
    }

    /**
     * Phase 3 (Self-Reflection): Menyelesaikan sesi dan menyimpan evaluasi diri.
     */
    public function reflect(Request $request, SrlLearningSession $srlLearningSession): JsonResponse
    {
        $this->authorizeSession($request, $srlLearningSession);

        $validated = $request->validate([
            'goal_achievement' => ['required', Rule::in(['tercapai', 'sebagian', 'belum'])],
            'factors' => ['nullable', 'array'],
            'factors.*' => ['string', 'max:255'],
            'evaluation' => ['nullable', 'string', 'max:2000'],
            'future_adjustment' => ['nullable', 'string', 'max:2000'],
            'accumulated_seconds' => ['sometimes', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'focus_level' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $srlLearningSession->update([
            ...$validated,
            'status' => 'completed',
            'current_phase' => 'reflection',
            'ended_at' => now(),
        ]);

        $this->learningDataService->recordSrlSessionActivity(
            userId: $request->user()->id,
            session: $srlLearningSession,
            activityType: 'srl_session_completed',
            target: $srlLearningSession,
            durationSeconds: (int) ($validated['accumulated_seconds'] ?? $srlLearningSession->accumulated_seconds ?? 0),
            metadata: ['goal_achievement' => $validated['goal_achievement']]
        );

        return response()->json([
            'message' => 'Refleksi tersimpan. Sesi pembelajaran selesai!',
            'session' => $srlLearningSession->fresh('materials.target'),
        ]);
    }

    /**
     * Membatalkan sesi yang sedang berjalan.
     */
    public function abandon(Request $request, SrlLearningSession $srlLearningSession): JsonResponse
    {
        $this->authorizeSession($request, $srlLearningSession);

        $srlLearningSession->update([
            'status' => 'abandoned',
            'ended_at' => now(),
        ]);

        return response()->json([
            'message' => 'Sesi pembelajaran dibatalkan.',
            'session' => $srlLearningSession,
        ]);
    }

    private function authorizeSession(Request $request, SrlLearningSession $session): void
    {
        abort_if($session->user_id !== $request->user()->id, 403, 'Unauthorized SRL session access.');
    }
}
