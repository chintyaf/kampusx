<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Event;
use App\Models\RewardCatalog;
use App\Models\RewardDecisionLog;
use App\Models\RewardFeedback;
use App\Services\Bandit\RewardDecisionEngine;

class RewardDecisionController extends Controller
{
    protected RewardDecisionEngine $decisionEngine;

    public function __construct(RewardDecisionEngine $decisionEngine)
    {
        $this->decisionEngine = $decisionEngine;
    }

    protected function getActiveUser(Request $request): User
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            $user = User::where('email', 'part@kampusx.com')->first()
                ?: User::where('role', 'participant')->first();
        }

        if (!$user) {
            $user = User::first();
        }

        return $user;
    }

    /**
     * GET /api/rewards
     * Mengambil seluruh katalog reward aktif dari MySQL
     */
    public function index(Request $request)
    {
        $rewards = RewardCatalog::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'message' => 'Katalog reward berhasil dimuat dari database.',
            'data'    => $rewards,
        ], 200);
    }

    /**
     * POST /api/rewards/recommend
     * Menjalankan Contextual Bandit + Thompson Sampling + Integer Programming
     */
    public function recommend(Request $request)
    {
        $user = $this->getActiveUser($request);
        $eventId = $request->input('event_id');
        $event = $eventId ? Event::find($eventId) : null;
        $basePrice = (float) $request->input('base_price', 50000.0);

        $decision = $this->decisionEngine->selectOptimalReward($user, $event, $basePrice);

        return response()->json([
            'success' => true,
            'message' => 'Rekomendasi reward berhasil diproses menggunakan Thompson Sampling & DISCO Constraints.',
            'data'    => $decision,
        ], 200);
    }

    /**
     * POST /api/rewards/claim
     * Mengklaim reward dan merekam feedback loop
     */
    public function claim(Request $request)
    {
        $validated = $request->validate([
            'decision_log_id' => 'required|exists:reward_decision_logs,id',
            'action'          => 'nullable|string|in:claimed,used_in_checkout,dismissed',
        ]);

        $user = $this->getActiveUser($request);
        $action = $validated['action'] ?? 'claimed';

        $result = $this->decisionEngine->recordFeedback((int) $validated['decision_log_id'], $user, $action);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result, 200);
    }

    /**
     * GET /api/rewards/decision-logs
     * Riwayat log pengambilan keputusan AI Bandit (Bahan Sidang STA)
     */
    public function decisionLogs(Request $request)
    {
        $user = $this->getActiveUser($request);
        $perPage = (int) $request->query('per_page', 10);

        $logs = RewardDecisionLog::with(['reward', 'feedbacks'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat decision log AI Bandit berhasil dimuat.',
            'data'    => $logs->items(),
            'meta'    => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'total'        => $logs->total(),
            ]
        ], 200);
    }

    /**
     * GET /api/rewards/history
     * Riwayat klaim reward yang pernah didapatkan mahasiswa
     */
    public function history(Request $request)
    {
        $user = $this->getActiveUser($request);

        $feedbacks = RewardFeedback::with(['decisionLog.reward'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat klaim reward mahasiswa berhasil dimuat.',
            'data'    => $feedbacks,
        ], 200);
    }
}
