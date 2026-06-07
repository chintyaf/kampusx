<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RedemptionController extends Controller
{
    /**
     * Redeem a global reward using member global points.
     */
    public function redeemGlobalReward(Request $request)
    {
        // 1. Validasi input request
        $request->validate([
            'reward_id' => 'required|exists:rewards,id',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan login terlebih dahulu.'
            ], 401);
        }

        try {
            // Gunakan DB::transaction
            $result = DB::transaction(function () use ($request, $user) {
                // Lock row reward untuk mencegah perlombaan stok (race conditions)
                $reward = Reward::lockForUpdate()->findOrFail($request->reward_id);

                // Pastikan reward bertipe 'global'
                if ($reward->type !== 'global' || $reward->event_id !== null) {
                    return [
                        'success' => false,
                        'message' => 'Reward ini bukan reward global.',
                        'code' => 400
                    ];
                }

                // Cek keaktifan reward
                if (!$reward->is_active) {
                    return [
                        'success' => false,
                        'message' => 'Reward ini sedang tidak aktif.',
                        'code' => 400
                    ];
                }

                // Cek stock di tabel rewards. Tolak jika stok habis (0).
                // Jika stock diset (tidak null) dan nilainya <= 0, tolak.
                if ($reward->stock !== null && $reward->stock <= 0) {
                    return [
                        'success' => false,
                        'message' => 'Stok reward sudah habis.',
                        'code' => 400
                    ];
                }

                // Hitung total saldo poin global user saat ini dari sum(amount) di tabel point_transactions
                $balance = PointTransaction::where('user_id', $user->id)
                    ->where('type', 'global')
                    ->sum('amount');

                // Tolak jika saldo kurang dari harga reward
                if ($balance < $reward->points_cost) {
                    return [
                        'success' => false,
                        'message' => 'Saldo poin global Anda tidak mencukupi.',
                        'code' => 400
                    ];
                }

                // Cek batas penukaran per user (jika ditentukan)
                if ($reward->limit_per_user !== null) {
                    $redeemedCount = RedemptionHistory::where('user_id', $user->id)
                        ->where('reward_id', $reward->id)
                        ->where('status', '!=', 'cancelled')
                        ->count();

                    if ($redeemedCount >= $reward->limit_per_user) {
                        return [
                            'success' => false,
                            'message' => 'Anda telah mencapai batas maksimum penukaran untuk reward ini.',
                            'code' => 400
                        ];
                    }
                }

                // EKSEKUSI
                // 1. Kurangi stok reward (hanya jika stok dibatasi/tidak null)
                if ($reward->stock !== null) {
                    $reward->decrement('stock');
                }

                // 2. Insert row baru ke point_transactions dengan nilai amount negatif (-) sebesar harga reward
                $transaction = PointTransaction::create([
                    'user_id' => $user->id,
                    'event_id' => null,
                    'activity_id' => null,
                    'amount' => -$reward->points_cost,
                    'type' => 'global',
                    'description' => 'Penukaran Reward Global: ' . $reward->title,
                ]);

                // 3. Insert row ke redemption_history dengan status 'pending'
                $redemption = RedemptionHistory::create([
                    'user_id' => $user->id,
                    'reward_id' => $reward->id,
                    'points_spent' => $reward->points_cost,
                    'status' => 'pending',
                    'notes' => $request->input('notes'),
                    'redeemed_at' => now(),
                ]);

                return [
                    'success' => true,
                    'message' => 'Reward global berhasil ditukarkan.',
                    'data' => [
                        'redemption' => $redemption,
                        'transaction' => $transaction,
                        'new_balance' => $balance - $reward->points_cost
                    ],
                    'code' => 200
                ];
            });

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], $result['code']);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['data']
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses penukaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the authenticated user's points ledger (balance and transaction history).
     */
    public function pointsLedger(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan login terlebih dahulu.'
            ], 401);
        }

        // Sum global points
        $globalBalance = PointTransaction::where('user_id', $user->id)
            ->where('type', 'global')
            ->sum('amount');

        // Sum local points per event
        $localBalance = DB::table('local_member_points')
            ->where('user_id', $user->id)
            ->sum('points_balance');

        // Get transaction history
        $transactions = PointTransaction::with(['event', 'activity'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Get local points breakdown per event
        $localPointsBreakdown = \App\Models\LocalMemberPoint::with('event')
            ->where('user_id', $user->id)
            ->where('points_balance', '>', 0)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'global_balance' => (int) $globalBalance,
                'local_balance' => (int) $localBalance,
                'local_points_breakdown' => $localPointsBreakdown,
                'transactions' => $transactions
            ]
        ], 200);
    }

    /**
     * Get the list of active global rewards.
     */
    public function globalRewardsList(Request $request)
    {
        $rewards = Reward::whereNull('event_id')
            ->where('type', 'global')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rewards
        ], 200);
    }
}
