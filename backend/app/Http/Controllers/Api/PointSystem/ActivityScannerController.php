<?php

namespace App\Http\Controllers\Api\PointSystem;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;
use App\Models\Ticket;
use App\Models\Activity;

class ActivityScannerController extends Controller
{
    /**
     * Memindai tiket peserta dan memberikan poin lokal berdasarkan aktivitas.
     */
    public function scanTicket(Request $request, $eventId)
    {
        // 1. Validasi input request
        $validated = $request->validate([
            'ticket_code' => 'required|string',
            'activity_slug' => 'required|string|in:check_in,ask_question,booth_visit',
            'description' => 'nullable|string'
        ]);

        $ticketCode = strtoupper(trim($validated['ticket_code']));
        $activitySlug = $validated['activity_slug'];
        $description = $validated['description'] ?? null;

        // 2. Cari tiket dan relasinya
        $ticket = Ticket::with(['orderItem.order'])
            ->where('ticket_code', $ticketCode)
            ->first();

        if (!$ticket || $ticket->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Tiket tidak valid atau telah dibatalkan.'
            ], 422);
        }

        // Pastikan tiket milik event ini
        $ticketEventId = $ticket->orderItem->order->event_id ?? null;
        if ($ticketEventId != $eventId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tiket terdaftar pada event berbeda.'
            ], 422);
        }

        $userId = $ticket->participant_id;
        if (!$userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Peserta tidak terhubung dengan user account.'
            ], 422);
        }

        // 3. Ambil/buat master activity
        $defaultActivities = [
            'check_in' => ['name' => 'Check-in Kehadiran', 'points' => 50],
            'ask_question' => ['name' => 'Tanya Jawab (Ask Question)', 'points' => 10],
            'booth_visit' => ['name' => 'Kunjungan Booth (Booth Visit)', 'points' => 15],
        ];

        $activityInfo = $defaultActivities[$activitySlug];
        $activity = Activity::firstOrCreate(
            ['slug' => $activitySlug],
            [
                'name' => $activityInfo['name'],
                'points_rewarded' => $activityInfo['points'],
                'type' => 'local',
                'is_active' => true
            ]
        );

        // 4. Validasi double claim (anti fraud)
        if ($activitySlug === 'check_in') {
            $exists = PointTransaction::where('user_id', $userId)
                ->where('event_id', $eventId)
                ->where('activity_id', $activity->id)
                ->exists();
            if ($exists) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta ini sudah melakukan check-in kehadiran sebelumnya.'
                ], 422);
            }
        }

        if ($activitySlug === 'booth_visit') {
            $boothName = $description ?: 'Booth';
            $exists = PointTransaction::where('user_id', $userId)
                ->where('event_id', $eventId)
                ->where('activity_id', $activity->id)
                ->where('description', $boothName)
                ->exists();
            if ($exists) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Peserta sudah memindai kunjungan \"{$boothName}\" sebelumnya."
                ], 422);
            }
        }

        // 5. Eksekusi penambahan poin di database transaction (Database Transaction & Concurrency Control)
        $points = $activity->points_rewarded;

        /**
         * APPROACH EXPLANATION: Database Transaction & Pessimistic Locking
         * 
         * Mengapa kita menggunakan pendekatan ini:
         * 1. DB::transaction: Memastikan konsistensi penulisan data. Jika proses penambahan saldo poin
         *    berhasil tetapi pembuatan log `PointTransaction` gagal, database akan me-rollback seluruh operasi.
         * 2. lockForUpdate() (Pessimistic Locking):
         *    Mengunci baris saldo poin milik user agar transaksi/proses pemindaian lain yang terjadi secara bersamaan
         *    tidak membaca nilai saldo yang lama (stale data). Ini krusial untuk mencegah race condition 
         *    saat scanning massal atau aktivitas konkuren lainnya.
         */
        $result = DB::transaction(function () use ($userId, $eventId, $activity, $points, $description) {
            $localPoint = LocalMemberPoint::firstOrCreate(
                ['user_id' => $userId, 'event_id' => $eventId],
                ['points_balance' => 0]
            );

            $lockedPoint = LocalMemberPoint::where('id', $localPoint->id)
                ->lockForUpdate()
                ->first();

            $oldBalance = $lockedPoint->points_balance;
            $lockedPoint->points_balance += $points;
            $lockedPoint->save();

            PointTransaction::create([
                'type' => 'local',
                'user_id' => $userId,
                'event_id' => $eventId,
                'activity_id' => $activity->id,
                'amount' => $points,
                'description' => $description ?: $activity->name,
            ]);

            return [
                'old_balance' => $oldBalance,
                'new_balance' => $lockedPoint->points_balance
            ];
        });

        // NOTIFICATION: Kirim notifikasi ke peserta
        $participantUser = \App\Models\User::find($userId);
        if ($participantUser) {
            $stasiunName = $description ?: $activity->name;
            $participantUser->notify(new \App\Notifications\OperationalNotification(
                "Poin Aktivitas Ditambahkan!",
                "Selamat! Kamu mendapatkan +{$points} poin dari aktivitas \"{$activity->name}\".",
                "points_earned",
                [
                    'event_id' => $eventId,
                    'points' => $points,
                    'activity_name' => $activity->name,
                    'description' => $stasiunName
                ]
            ));
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil memberikan +{$points} poin!",
            'data' => [
                'participant_name' => $ticket->attendee_name,
                'ticket_code' => $ticketCode,
                'activity_name' => $activity->name,
                'points_rewarded' => $points,
                'old_balance' => $result['old_balance'],
                'new_balance' => $result['new_balance'],
            ]
        ], 200);
    }
}
