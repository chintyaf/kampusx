<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RedemptionController extends Controller
{
    /**
     * Redeem global reward menggunakan Reward Credits (saldo spendable).
     *
     * PENTING: Reward Credits adalah saldo TERPISAH dari Global Points.
     * Global Points (users.points) TIDAK berkurang, sehingga tier TIDAK turun.
     * Hanya Reward Credits (users.reward_credits) yang dikurangi.
     */
    public function redeemGlobalReward(Request $request)
    {
        $request->validate([
            'reward_id' => 'required|exists:rewards,id',
            'notes'     => 'nullable|string',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Silakan login terlebih dahulu.'], 401);
        }

        try {
            $result = DB::transaction(function () use ($request, $user) {
                // Lock reward untuk mencegah race condition stok
                $reward = Reward::lockForUpdate()->findOrFail($request->reward_id);

                // Validasi: harus reward global
                if ($reward->type !== 'global' || $reward->event_id !== null) {
                    return ['success' => false, 'message' => 'Reward ini bukan reward global.', 'code' => 400];
                }

                if (!$reward->is_active) {
                    return ['success' => false, 'message' => 'Reward ini sedang tidak aktif.', 'code' => 400];
                }

                if ($reward->stock !== null && $reward->stock <= 0) {
                    return ['success' => false, 'message' => 'Stok reward sudah habis.', 'code' => 400];
                }

                // Validasi batas penukaran per user
                if ($reward->limit_per_user !== null) {
                    $redeemed = RedemptionHistory::where('user_id', $user->id)
                        ->where('reward_id', $reward->id)
                        ->where('status', '!=', 'cancelled')
                        ->count();
                    if ($redeemed >= $reward->limit_per_user) {
                        return ['success' => false, 'message' => 'Anda telah mencapai batas maksimum penukaran untuk reward ini.', 'code' => 400];
                    }
                }

                // Lock user untuk baca saldo Reward Credits secara atomis
                $lockedUser = \App\Models\User::lockForUpdate()->find($user->id);
                $creditBalance = (int) ($lockedUser->reward_credits ?? 0);

                // Validasi saldo Reward Credits — BUKAN Global Points
                if ($creditBalance < $reward->points_cost) {
                    return [
                        'success' => false,
                        'message' => "Reward Credits tidak mencukupi. Saldo Anda: {$creditBalance}, Dibutuhkan: {$reward->points_cost}.",
                        'code'    => 400,
                    ];
                }

                // Kurangi stok
                if ($reward->stock !== null) {
                    $reward->decrement('stock');
                }

                // Kurangi Reward Credits (Global Points TIDAK diubah → tier TIDAK turun)
                $lockedUser->spendRewardCredits(
                    $reward->points_cost,
                    "Penukaran Reward Global: {$reward->title}"
                );

                // Catat di redemption_history
                $redemption = RedemptionHistory::create([
                    'user_id'      => $user->id,
                    'reward_id'    => $reward->id,
                    'points_spent' => $reward->points_cost,  // jumlah credits yang dipakai
                    'status'       => 'pending',
                    'notes'        => $request->input('notes'),
                    'redeemed_at'  => now(),
                ]);

                Log::info('Global reward redeemed', [
                    'user_id'        => $user->id,
                    'reward_id'      => $reward->id,
                    'credits_spent'  => $reward->points_cost,
                    'credits_remain' => $lockedUser->reward_credits,
                    'global_points'  => $lockedUser->points, // tidak berubah
                ]);

                return [
                    'success'     => true,
                    'message'     => 'Reward global berhasil ditukarkan.',
                    'data'        => [
                        'redemption'           => $redemption,
                        'credits_spent'        => $reward->points_cost,
                        'new_credit_balance'   => (int) $lockedUser->reward_credits,
                        'global_points'        => (int) $lockedUser->points,  // tidak berubah
                        'tier'                 => $lockedUser->tier,           // tidak berubah
                    ],
                    'code'        => 200,
                ];
            });

            if (!$result['success']) {
                return response()->json(['success' => false, 'message' => $result['message']], $result['code']);
            }

            return response()->json(['success' => true, 'message' => $result['message'], 'data' => $result['data']], 200);

        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memproses penukaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Daftar reward global aktif + saldo Reward Credits user.
     */
    public function globalRewardsList(Request $request)
    {
        $user          = Auth::user();
        $creditBalance = $user ? (int) ($user->reward_credits ?? 0) : 0;

        $rewards = Reward::whereNull('event_id')
            ->where('type', 'global')
            ->where('is_active', true)
            ->orderBy('points_cost', 'asc')
            ->get()
            ->map(fn($r) => array_merge($r->toArray(), [
                'can_afford' => $creditBalance >= $r->points_cost,
            ]));

        return response()->json([
            'success'        => true,
            'credit_balance' => $creditBalance,  // saldo Reward Credits user
            'data'           => $rewards,
        ], 200);
    }

    /**
     * Ledger poin user (global + local + credit).
     */
    public function pointsLedger(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $globalBalance = (int) ($user->points ?? 0);
        $creditBalance = (int) ($user->reward_credits ?? 0);

        $localBalance = DB::table('local_member_points')
            ->where('user_id', $user->id)
            ->sum('points_balance');

        $transactions = PointTransaction::with(['event', 'activity'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $localPointsBreakdown = \App\Models\LocalMemberPoint::with('event')
            ->where('user_id', $user->id)
            ->where('points_balance', '>', 0)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'global_balance'          => $globalBalance,  // untuk tier
                'credit_balance'          => $creditBalance,  // saldo spendable
                'local_balance'           => (int) $localBalance,
                'local_points_breakdown'  => $localPointsBreakdown,
                'transactions'            => $transactions,
            ],
        ], 200);
    }
}

