<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Reward;
use App\Models\RedemptionHistory;
use App\Models\LocalMemberPoint;
use App\Models\Event;
use App\Models\PointTransaction;
use App\Models\Setting;

class OrganizerRewardController extends Controller
{
    /**
     * Tampilkan katalog reward lokal untuk event tertentu.
     */
    public function index($eventId)
    {
        $rewards = Reward::where('event_id', $eventId)
            ->where('type', 'local')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rewards
        ]);
    }

    /**
     * Simpan reward lokal baru.
     */
    public function store(Request $request, $eventId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'points_cost' => 'required|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'limit_per_user' => 'nullable|integer|min:0',
            'reward_type' => 'required|in:physical,digital',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('image_path')) {
            $request->validate([
                'image_path' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);
            $file = $request->file('image_path');
            $path = $file->store("rewards/{$eventId}", 'public');
            $validated['image_path'] = $path;
        } else {
            $request->validate([
                'image_path' => 'nullable|string'
            ]);
            $validated['image_path'] = $request->input('image_path');
        }

        $validated['event_id'] = $eventId;
        $validated['type'] = 'local';
        $validated['is_active'] = $request->has('is_active')
            ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            : true;

        $reward = Reward::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Reward lokal berhasil dibuat.',
            'data' => $reward
        ], 201);
    }

    /**
     * Tampilkan detail reward lokal.
     */
    public function show($eventId, $rewardId)
    {
        $reward = Reward::where('event_id', $eventId)
            ->where('type', 'local')
            ->where('id', $rewardId)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $reward
        ]);
    }

    /**
     * Perbarui reward lokal.
     */
    public function update(Request $request, $eventId, $rewardId)
    {
        $reward = Reward::where('event_id', $eventId)
            ->where('type', 'local')
            ->where('id', $rewardId)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'points_cost' => 'required|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'limit_per_user' => 'nullable|integer|min:0',
            'reward_type' => 'required|in:physical,digital',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('image_path')) {
            $request->validate([
                'image_path' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);
            // Hapus gambar lama jika ada
            if ($reward->image_path && Storage::disk('public')->exists($reward->image_path)) {
                Storage::disk('public')->delete($reward->image_path);
            }
            $file = $request->file('image_path');
            $path = $file->store("rewards/{$eventId}", 'public');
            $validated['image_path'] = $path;
        } else {
            if ($request->has('image_path')) {
                $request->validate([
                    'image_path' => 'nullable|string'
                ]);
                $validated['image_path'] = $request->input('image_path');
            }
        }

        $validated['is_active'] = $request->has('is_active')
            ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            : $reward->is_active;

        $reward->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Reward lokal berhasil diperbarui.',
            'data' => $reward
        ]);
    }

    /**
     * Hapus reward lokal.
     */
    public function destroy($eventId, $rewardId)
    {
        $reward = Reward::where('event_id', $eventId)
            ->where('type', 'local')
            ->where('id', $rewardId)
            ->firstOrFail();

        // Hapus file gambar dari storage jika ada
        if ($reward->image_path && Storage::disk('public')->exists($reward->image_path)) {
            Storage::disk('public')->delete($reward->image_path);
        }

        $reward->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Reward lokal berhasil dihapus.'
        ]);
    }

    /**
     * Menampilkan semua daftar transaksi penukaran untuk event ini.
     */
    public function listRedemptions($eventId)
    {
        $redemptions = RedemptionHistory::with(['user', 'reward'])
            ->whereHas('reward', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $redemptions
        ]);
    }

    /**
     * Organizer memperbarui status klaim/penukaran reward.
     */
    public function updateRedemptionStatus(Request $request, $eventId, $redemptionId)
    {
        $redemption = RedemptionHistory::where('id', $redemptionId)
            ->whereHas('reward', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            })
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:claimed,delivered,cancelled',
            'cancellation_reason' => 'required_if:status,cancelled|nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($redemption->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi penukaran ini sudah diproses sebelumnya.'
            ], 422);
        }

        $newStatus = $validated['status'];
        $cancellationReason = $validated['cancellation_reason'] ?? null;
        $notes = $validated['notes'] ?? null;

        DB::transaction(function () use ($redemption, $newStatus, $cancellationReason, $notes, $eventId) {
            if ($newStatus === 'cancelled') {
                /**
                 * APPROACH EXPLANATION: Database Transaction & Locking (Refund Poin)
                 * Saat membatalkan penukaran (cancelled), kita harus mengembalikan poin lokal member.
                 * Kita menggunakan firstOrCreate untuk memastikan record LocalMemberPoint ada, 
                 * lalu melakukan SELECT ... FOR UPDATE (via lockForUpdate()) untuk mengamankan record tersebut 
                 * dari race condition/baca-tulis konkuren selama proses pengembalian poin berlangsung.
                 */
                $localPoint = LocalMemberPoint::firstOrCreate(
                    ['user_id' => $redemption->user_id, 'event_id' => $eventId],
                    ['points_balance' => 0]
                );

                $lockedPoint = LocalMemberPoint::where('id', $localPoint->id)
                    ->lockForUpdate()
                    ->first();

                $lockedPoint->points_balance += $redemption->points_spent;
                $lockedPoint->save();

                /**
                 * APPROACH EXPLANATION: Concurrency Safety (Kembalikan Stok)
                 * Jika transaksi dibatalkan, stok reward fisik/digital harus dikembalikan (+1).
                 * Pemanggilan lockForUpdate() pada record Reward memastikan penyesuaian stok 
                 * aman dari modifikasi konkuren oleh penukaran lain yang berjalan bersamaan.
                 */
                $reward = Reward::where('id', $redemption->reward_id)
                    ->lockForUpdate()
                    ->first();

                if ($reward && $reward->stock !== null) {
                    $reward->stock += 1;
                    $reward->save();
                }

                $redemption->cancellation_reason = $cancellationReason;
            }

            if ($notes !== null) {
                $redemption->notes = $notes;
            }

            $redemption->status = $newStatus;
            $redemption->save();
        });

        return response()->json([
            'status' => 'success',
            'message' => "Status penukaran berhasil diperbarui menjadi {$newStatus}.",
            'data' => $redemption->load(['user', 'reward'])
        ]);
    }

    /**
     * Reset sisa poin lokal member menjadi 0 dan konversi ke poin global (inject ke global balance).
     */
    public function resetLocalPoints($eventId)
    {
        $event = Event::findOrFail($eventId);

        // 1. Validasi status event (harus aktif / tidak boleh draft atau cancelled)
        if (in_array($event->status, ['draft', 'cancelled'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal: Event tidak dapat dikonversi karena masih berupa draft atau telah dibatalkan.'
            ], 422);
        }

        // 2. Ambil rasio konversi dari Admin settings (key: local_to_global_ratio)
        $setting = Setting::where('key', 'local_to_global_ratio')->first();
        $ratio = $setting ? (int) $setting->value : config('gamification.local_to_global_ratio', 10);

        // 3. Eksekusi reset & konversi dalam transaksi database
        $result = DB::transaction(function () use ($eventId, $ratio, $event) {
            // Ambil semua record local member points yang memiliki poin > 0 untuk event ini
            $localPoints = LocalMemberPoint::with('user')
                ->where('event_id', $eventId)
                ->where('points_balance', '>', 0)
                ->lockForUpdate()
                ->get();

            $convertedList = [];

            foreach ($localPoints as $localPoint) {
                $originalBalance = $localPoint->points_balance;

                // Set local point balance ke 0
                $localPoint->points_balance = 0;
                $localPoint->save();

                // Catat log transaksi negatif di ledger poin lokal event
                PointTransaction::create([
                    'type' => 'local',
                    'user_id' => $localPoint->user_id,
                    'event_id' => $eventId,
                    'activity_id' => null,
                    'amount' => -$originalBalance,
                    'description' => "Reset Poin Lokal Event Selesai: {$event->title}",
                ]);

                // Hitung konversi ke global point
                $globalPoints = (int) floor($originalBalance / $ratio);

                // Jika hasil konversi > 0, injeksi ke global point
                if ($globalPoints > 0) {
                    PointTransaction::create([
                        'type' => 'global',
                        'user_id' => $localPoint->user_id,
                        'event_id' => null,
                        'activity_id' => null,
                        'amount' => $globalPoints,
                        'description' => "Konversi Poin Lokal Event {$event->title} (Rasio 1:{$ratio})",
                    ]);

                    // Sinkronisasi kolom points di tabel users
                    if ($localPoint->user) {
                        $localPoint->user->increment('points', $globalPoints);
                    }
                }

                $convertedList[] = [
                    'user_id' => $localPoint->user_id,
                    'name' => $localPoint->user->name ?? null,
                    'email' => $localPoint->user->email ?? null,
                    'local_points_before' => $originalBalance,
                    'global_points_added' => $globalPoints,
                ];
            }

            return $convertedList;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Reset poin lokal dan konversi ke poin global berhasil diselesaikan.',
            'data' => [
                'event_id' => (int) $eventId,
                'event_title' => $event->title,
                'conversion_ratio' => $ratio,
                'resets' => $result
            ]
        ], 200);
    }
}
