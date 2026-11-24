<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Badge;
use App\Models\StudentBadge;
use App\Models\PointTransaction;
use App\Services\Gamification\GamificationService;

class GamificationController extends Controller
{
    protected GamificationService $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Ambil user yang terautentikasi. Tolak jika tidak login.
     * Tidak ada lagi fallback ke user demo/hardcoded untuk mencegah kebocoran data di produksi.
     */
    protected function getActiveUser(Request $request): User
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            abort(401, 'Silakan login terlebih dahulu.');
        }
        return $user;
    }

    /**
     * GET /api/gamification/dashboard
     */
    public function dashboard(Request $request)
    {
        $user = $this->getActiveUser($request);
        $summary = $this->gamificationService->getDashboardSummary($user);

        return response()->json([
            'success' => true,
            'message' => 'Gamification Dashboard berhasil dimuat.',
            'data'    => $summary,
        ], 200);
    }

    /**
     * GET /api/gamification/points-history
     */
    public function pointsHistory(Request $request)
    {
        $user = $this->getActiveUser($request);
        $perPage = (int) $request->query('per_page', 15);

        $history = PointTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat transaksi poin berhasil dimuat.',
            'data'    => $history->items(),
            'meta'    => [
                'current_page' => $history->currentPage(),
                'last_page'    => $history->lastPage(),
                'total'        => $history->total(),
                'per_page'     => $history->perPage(),
            ],
            'user' => [
                'name'         => $user->name,
                'total_points' => (int) $user->points,
                'tier'         => $user->tier ?? $user->calculateTier(),
            ]
        ], 200);
    }

    /**
     * GET /api/gamification/tier-progress
     */
    public function tierProgress(Request $request)
    {
        $user = $this->getActiveUser($request);
        $points = (int) ($user->points ?? 0);
        $tier = $user->tier ?? $user->calculateTier();

        $details = $this->gamificationService->calculateTierProgressDetails($points, $tier);

        return response()->json([
            'success' => true,
            'message' => 'Tier progress berhasil dimuat.',
            'data'    => $details,
        ], 200);
    }

    /**
     * GET /api/gamification/badges
     */
    public function badges(Request $request)
    {
        $user = $this->getActiveUser($request);

        // Pastikan evaluasi badge terbaru telah diperiksa
        $this->gamificationService->evaluateAndUnlockBadges($user);

        $studentBadges = StudentBadge::where('user_id', $user->id)
            ->pluck('unlocked_at', 'badge_id')
            ->toArray();

        $allBadges = Badge::where('is_active', true)->get()->map(function ($badge) use ($studentBadges) {
            $isUnlocked = isset($studentBadges[$badge->id]);
            $unlockedAt = $isUnlocked ? $studentBadges[$badge->id] : null;

            return [
                'id'          => $badge->id,
                'code'        => $badge->code,
                'name'        => $badge->name,
                'description' => $badge->description,
                'criteria'    => $badge->criteria,
                'icon'        => $badge->icon,
                'category'    => $badge->category,
                'is_unlocked' => $isUnlocked,
                'unlocked_at' => $unlockedAt ? \Carbon\Carbon::parse($unlockedAt)->format('d M Y, H:i') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar badge achievement berhasil dimuat.',
            'data'    => [
                'total_badges'    => $allBadges->count(),
                'unlocked_badges' => count($studentBadges),
                'badges'          => $allBadges,
            ]
        ], 200);
    }

    /**
     * GET /api/gamification/leaderboard
     */
    public function leaderboard(Request $request)
    {
        $timeframe = $request->query('timeframe', 'bulanan');
        $currentUser = $this->getActiveUser($request);

        $participants = User::where('role', 'participant')
            ->with(['university', 'badges'])
            ->withCount(['tickets' => function ($q) {
                $q->whereIn('status', ['active', 'used', 'completed']);
            }])
            ->orderBy('points', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        $rank = 1;
        $leaderboardData = [];
        $currentUserRank = null;

        foreach ($participants as $p) {
            $initials = collect(explode(' ', $p->name))
                ->filter()
                ->map(fn($part) => strtoupper(substr($part, 0, 1)))
                ->take(2)
                ->implode('');

            $item = [
                'id'              => $p->id,
                'rank'            => $rank,
                'name'            => $p->name,
                'email'           => $p->email,
                'avatar_path'     => $p->avatar_path,
                'initials'        => $initials ?: 'MHS',
                'points'          => (int) $p->points,
                'tier'            => $p->tier ?? $p->calculateTier(),
                'campus'          => $p->university ? $p->university->name : 'Universitas Indonesia',
                'events_attended' => (int) $p->tickets_count,
                'badges_count'    => $p->badges->count(),
                'is_current_user' => ($currentUser && $currentUser->id === $p->id),
            ];

            $leaderboardData[] = $item;

            if ($currentUser && $currentUser->id === $p->id) {
                $currentUserRank = $item;
            }

            $rank++;
        }

        return response()->json([
            'success' => true,
            'message' => 'Data leaderboard ranking mahasiswa berhasil dimuat dari MySQL.',
            'data'    => [
                'current_user' => $currentUserRank,
                'leaderboard'  => $leaderboardData,
                'top_three'    => array_slice($leaderboardData, 0, 3),
            ]
        ], 200);
    }
}
