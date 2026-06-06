<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LocalRewardController extends Controller
{
    /**
     * Get the list of local rewards and the user's local point balance for a specific event.
     */
    public function getLocalRewards($eventId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan login terlebih dahulu.'
            ], 401);
        }

        try {
            // Ambil reward bertipe 'local' spesifik untuk event ini
            $rewards = Reward::where('event_id', $eventId)
                ->where('type', 'local')
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();

            // Hitung saldo Local Point milik user untuk event tersebut
            $localBalance = PointTransaction::where('user_id', $user->id)
                ->where('event_id', $eventId)
                ->where('type', 'local')
                ->sum('amount');

            return response()->json([
                'success' => true,
                'data' => [
                    'rewards' => $rewards,
                    'local_balance' => (int) $localBalance
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat katalog reward lokal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Redeem a local reward using event-specific local points.
     */
    public function redeemLocalReward(Request $request, $eventId)
    {
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
            $result = DB::transaction(function () use ($request, $user, $eventId) {
                // Lock row reward untuk mencegah race condition stok
                $reward = Reward::lockForUpdate()->findOrFail($request->reward_id);

                // Verifikasi reward tersebut memang milik event ini dan tipenya local
                if ((int)$reward->event_id !== (int)$eventId || $reward->type !== 'local') {
                    return [
                        'success' => false,
                        'message' => 'Reward ini tidak cocok dengan event yang dipilih.',
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

                // Cek stok. Tolak jika stok habis (0).
                if ($reward->stock !== null && $reward->stock <= 0) {
                    return [
                        'success' => false,
                        'message' => 'Stok reward sudah habis.',
                        'code' => 400
                    ];
                }

                // Hitung saldo poin lokal saat ini dari sum(amount) di tabel point_transactions
                $balance = PointTransaction::where('user_id', $user->id)
                    ->where('event_id', $eventId)
                    ->where('type', 'local')
                    ->sum('amount');

                // Tolak jika saldo kurang dari harga reward
                if ($balance < $reward->points_cost) {
                    return [
                        'success' => false,
                        'message' => 'Saldo poin lokal Anda tidak mencukupi untuk event ini.',
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
                // 1. Kurangi stok reward (jika ada batasan stok)
                if ($reward->stock !== null) {
                    $reward->decrement('stock');
                }

                // 1.5. Kurangi saldo poin lokal di local_member_points (untuk konsistensi data)
                $localPoint = \App\Models\LocalMemberPoint::firstOrCreate(
                    ['user_id' => $user->id, 'event_id' => $eventId],
                    ['points_balance' => $balance]
                );

                $lockedPoint = \App\Models\LocalMemberPoint::where('id', $localPoint->id)
                    ->lockForUpdate()
                    ->first();

                $lockedPoint->points_balance -= $reward->points_cost;
                $lockedPoint->save();

                // 2. Catat pengurangan poin di point_transactions dengan nilai negatif (-) sebesar harga reward
                $transaction = PointTransaction::create([
                    'user_id' => $user->id,
                    'event_id' => $eventId,
                    'activity_id' => null,
                    'amount' => -$reward->points_cost,
                    'type' => 'local',
                    'description' => 'Penukaran Reward Lokal Event: ' . $reward->title,
                ]);

                // 3. Catat di tabel redemption_history dengan status 'pending'
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
                    'message' => 'Reward lokal berhasil ditukarkan.',
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
                'message' => 'Gagal memproses penukaran reward lokal: ' . $e->getMessage()
            ], 500);
        }
    }
}
