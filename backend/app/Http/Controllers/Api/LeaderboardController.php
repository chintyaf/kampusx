<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;

/**
 * Controller untuk menyediakan data dinamis Leaderboard & Gamifikasi
 * Digunakan oleh React LeaderboardPage (/api/leaderboard).
 */
class LeaderboardController extends Controller
{
    /**
     * GET /api/leaderboard
     * Mengembalikan data leaderboard dinamis berjenjang multi-tier.
     */
    public function index(Request $request)
    {
        $timeframe = $request->query('timeframe', 'bulanan');
        $selectedTier = strtoupper($request->query('tier', 'ALL'));
        $currentUser = auth('sanctum')->user();

        // Siapkan rentang waktu dan label
        $now = Carbon::now();
        if ($timeframe === 'mingguan') {
            $periodLabel = 'Mingguan (' . $now->locale('id')->isoFormat('D MMMM Y') . ')';
            $daysRemaining = $now->endOfWeek()->diffInDays($now) . ' hari ' . ($now->endOfWeek()->diffInHours($now) % 24) . ' jam';
        } elseif ($timeframe === 'semua_waktu') {
            $periodLabel = 'Semua Waktu (All-Time Hall of Fame)';
            $daysRemaining = 'Permanen';
        } else {
            $periodLabel = 'Bulanan (' . $now->locale('id')->isoFormat('MMMM Y') . ')';
            $daysRemaining = $now->endOfMonth()->diffInDays($now) . ' hari ' . ($now->endOfMonth()->diffInHours($now) % 24) . ' jam';
        }

        // Ambil semua user terurut berdasarkan poin
        $query = User::query()
            ->with(['university', 'soulboundTokens'])
            ->withCount(['tickets' => function ($q) {
                $q->where('status', 'active');
            }])
            ->orderBy('points', 'desc')
            ->orderBy('id', 'asc');

        if ($selectedTier !== 'ALL' && in_array($selectedTier, ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'])) {
            $query->where('tier', ucfirst(strtolower($selectedTier)));
        }

        $allRankedUsers = $query->get();

        // Petakan daftar peringkat
        $mappedRanks = [];
        $currentUserRankInfo = null;
        $rankCounter = 1;

        foreach ($allRankedUsers as $user) {
            $initials = collect(explode(' ', $user->name))
                ->filter()
                ->map(fn($part) => strtoupper(substr($part, 0, 1)))
                ->take(2)
                ->implode('');

            $rankItem = [
                'id'              => $user->id,
                'rank'            => $rankCounter,
                'name'            => $user->name,
                'initials'        => $initials ?: 'KX',
                'points'          => (int) $user->points,
                'tier'            => $user->tier ?? $user->calculateTier(),
                'campus'          => $user->university ? $user->university->name : 'Universitas Indonesia',
                'major'           => 'Teknik Informatika',
                'eventsAttended'  => (int) ($user->tickets_count ?? 0),
                'sbtVerified'     => $user->soulboundTokens->isNotEmpty(),
                'trend'           => ($rankCounter <= 3) ? 'up' : (($rankCounter % 2 === 0) ? 'neutral' : 'up'),
                'isCurrentUser'   => $currentUser && $currentUser->id === $user->id,
            ];

            $mappedRanks[] = $rankItem;

            if ($currentUser && $currentUser->id === $user->id) {
                $currentUserRankInfo = $rankItem;
            }

            $rankCounter++;
        }

        // Pisahkan Top Three Podium dan Table Ranks
        $topThree = array_slice($mappedRanks, 0, 3);
        $tableRanks = array_slice($mappedRanks, 3);

        // Jika user login ditemukan, lengkapi data progress menuju ranking di atasnya
        if ($currentUser) {
            $userRankIndex = array_search($currentUser->id, array_column($mappedRanks, 'id'));
            $userRankNumber = ($userRankIndex !== false) ? ($userRankIndex + 1) : count($mappedRanks) + 1;
            
            $nextRankPoints = $currentUser->points + 500;
            $nextRank = max(1, $userRankNumber - 1);
            if ($userRankIndex > 0) {
                $nextRankPoints = $mappedRanks[$userRankIndex - 1]['points'];
            }

            $currentUserData = [
                'id'              => $currentUser->id,
                'name'            => 'Kamu (' . $currentUser->name . ')',
                'initials'        => $currentUserRankInfo['initials'] ?? 'KM',
                'rank'            => $userRankNumber,
                'points'          => (int) $currentUser->points,
                'nextRankPoints'  => $nextRankPoints,
                'nextRank'        => $nextRank,
                'tier'            => $currentUser->tier ?? $currentUser->calculateTier(),
                'campus'          => $currentUser->university ? $currentUser->university->name : 'Universitas Indonesia',
                'major'           => 'Teknik Informatika',
                'eventsAttended'  => $currentUserRankInfo['eventsAttended'] ?? 0,
                'trend'           => 'up',
                'trendCount'      => '+3 peringkat'
            ];
        } else {
            // Guest fallback currentUser memakai peringkat pertama atau sampel
            $fallback = $topThree[0] ?? [
                'id' => 0, 'name' => 'Tamu KampusX', 'initials' => 'TM', 'rank' => 1,
                'points' => 0, 'nextRankPoints' => 500, 'nextRank' => 1, 'tier' => 'Bronze',
                'campus' => 'KampusX University', 'major' => 'Mahasiswa', 'eventsAttended' => 0,
                'trend' => 'neutral', 'trendCount' => '0 peringkat'
            ];
            $currentUserData = $fallback;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'periodLabel'    => $periodLabel,
                'daysRemaining'  => $daysRemaining,
                'currentUser'    => $currentUserData,
                'topThree'       => $topThree,
                'tableRanks'     => $tableRanks,
                'total_members'  => count($mappedRanks),
            ]
        ], 200);
    }
}
