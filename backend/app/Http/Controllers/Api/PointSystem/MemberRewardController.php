<?php

namespace App\Http\Controllers\Api\PointSystem;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Reward;
use App\Models\RedemptionHistory;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;

class MemberRewardController extends Controller
{
    /**
     * Menampilkan daftar reward lokal yang aktif untuk peserta.
     */
    public function listAvailableRewards($eventId)
    {
        if (!is_numeric($eventId)) {
            $event = \App\Models\Event::where('slug', $eventId)->first();
            $eventId = $event ? $event->id : 0;
        }

        $rewards = Reward::where('event_id', $eventId)
            ->where('type', 'local')
            ->where('is_active', true)
            ->orderBy('points_cost', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rewards
        ]);
    }

    /**
     * Memproses penukaran reward lokal oleh peserta.
     */
    public function redeemReward(Request $request, $eventId, $rewardId)
    {
        $userId = auth()->id();

        if (!is_numeric($eventId)) {
            $event = \App\Models\Event::where('slug', $eventId)->first();
            $eventId = $event ? $event->id : 0;
        }

        // 1. Cari reward beserta relasi lokasi event
        $reward = Reward::with('event.locationDetail')
            ->where('event_id', $eventId)
            ->where('type', 'local')
            ->where('id', $rewardId)
            ->firstOrFail();

        // 2. Validasi status keaktifan reward
        if (!$reward->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reward ini sedang tidak aktif dan tidak dapat ditukarkan.'
            ], 422);
        }

        // 3. Validasi stok reward
        if ($reward->stock !== null && $reward->stock <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stok reward ini sudah habis.'
            ], 422);
        }

        // 4. Validasi batas penukaran per user (limit_per_user)
        if ($reward->limit_per_user !== null) {
            $userRedemptionsCount = RedemptionHistory::where('user_id', $userId)
                ->where('reward_id', $rewardId)
                ->where('status', '!=', 'cancelled')
                ->count();

            if ($userRedemptionsCount >= $reward->limit_per_user) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Anda telah mencapai batas maksimum penukaran ({$reward->limit_per_user}x) untuk reward ini."
                ], 422);
            }
        }

        // 5. Validasi tipe reward fisik pada event online (Notes/Alamat wajib diisi)
        $eventLocationType = $reward->event->locationDetail->type ?? null;
        if ($reward->reward_type === 'physical' && $eventLocationType === 'online') {
            $validatedNotes = $request->validate([
                'notes' => 'required|string|min:10'
            ], [
                'notes.required' => 'Alamat pengiriman wajib diisi pada kolom catatan untuk penukaran reward fisik di event online.',
                'notes.min' => 'Harap isi alamat pengiriman dengan lengkap di kolom catatan (minimal 10 karakter).'
            ]);
        } else {
            $validatedNotes = $request->validate([
                'notes' => 'nullable|string'
            ]);
        }

        // 6. Cek kecukupan saldo poin lokal
        $localPoint = LocalMemberPoint::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->first();

        if (!$localPoint || $localPoint->points_balance < $reward->points_cost) {
            $userBalance = $localPoint ? $localPoint->points_balance : 0;
            return response()->json([
                'status' => 'error',
                'message' => "Saldo poin lokal Anda tidak mencukupi. Saldo Anda: {$userBalance} Pts, Poin dibutuhkan: {$reward->points_cost} Pts."
            ], 422);
        }

        // 7. Eksekusi transaksi penukaran reward (Database Transaction & Concurrency Control)
        $pointsSpent = $reward->points_cost;
        $notes = $validatedNotes['notes'] ?? null;

        /**
         * APPROACH EXPLANATION: Database Transaction & Pessimistic Locking
         * 
         * Mengapa kita menggunakan pendekatan ini:
         * 1. DB::transaction: Menjamin sifat ACID (Atomicity, Consistency, Isolation, Durability).
         *    Jika terjadi kegagalan di tengah jalan (misal: gagal membuat log riwayat penukaran), 
         *    seluruh perubahan (pengurangan saldo poin, pengurangan stok reward) akan di-rollback otomatis.
         * 2. lockForUpdate() (Pessimistic Locking / SELECT ... FOR UPDATE):
         *    Mencegah race condition ketika ada request konkuren yang masuk secara bersamaan (milidetik yang sama).
         *    Tanpa locking, user bisa mengeksploitasi celah (double spending) dengan mengirimkan beberapa request
         *    redeem sekaligus sebelum database sempat meng-update saldo poin atau stok reward.
         */
        $redemption = DB::transaction(function () use ($userId, $eventId, $reward, $pointsSpent, $notes) {
            // Lock record saldo poin lokal untuk keamanan mutasi (mencegah double-spending)
            $lockedPoint = LocalMemberPoint::where('user_id', $userId)
                ->where('event_id', $eventId)
                ->lockForUpdate()
                ->first();

            $lockedPoint->points_balance -= $pointsSpent;
            $lockedPoint->save();

            // Lock & kurangi stok reward secara konkuren (mencegah overselling ketika stok menipis)
            $lockedReward = Reward::where('id', $reward->id)
                ->lockForUpdate()
                ->first();

            if ($lockedReward->stock !== null) {
                // Lakukan validasi stok ulang di dalam lock untuk memastikan stok masih tersedia setelah dikunci
                if ($lockedReward->stock <= 0) {
                    throw new \Exception('Stok reward habis pada saat pemrosesan.');
                }
                $lockedReward->stock -= 1;
                $lockedReward->save();
            }

            // Catat log transaksi negatif di ledger mutasi poin
            PointTransaction::create([
                'type' => 'local',
                'user_id' => $userId,
                'event_id' => $eventId,
                'activity_id' => null, // null karena bukan dari aktivitas, melainkan penukaran reward
                'amount' => -$pointsSpent,
                'description' => "Penukaran Reward: {$reward->title}",
            ]);

            // Buat baris baru di riwayat penukaran (redemption_history)
            return RedemptionHistory::create([
                'user_id' => $userId,
                'reward_id' => $reward->id,
                'points_spent' => $pointsSpent,
                'status' => 'pending',
                'notes' => $notes,
                'redeemed_at' => now(),
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Penukaran reward lokal berhasil diajukan.',
            'data' => $redemption->load('reward')
        ], 201);
    }

    /**
     * Mendapatkan informasi saldo poin lokal dan riwayat penukaran milik peserta.
     */
    public function getMemberPointDetails($eventId)
    {
        $userId = auth()->id();

        if (!is_numeric($eventId)) {
            $event = \App\Models\Event::where('slug', $eventId)->first();
            $eventId = $event ? $event->id : 0;
        }

        // Ambil saldo poin lokal
        $localPoint = LocalMemberPoint::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->first();

        // Ambil riwayat penukaran
        $redemptions = RedemptionHistory::with('reward')
            ->where('user_id', $userId)
            ->whereHas('reward', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            })
            ->orderBy('redeemed_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'points_balance' => $localPoint ? $localPoint->points_balance : 0,
                'redemptions' => $redemptions
            ]
        ]);
    }
}
