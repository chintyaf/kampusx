<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Event;
use App\Models\EventStation;
use App\Models\Ticket;
use App\Models\Activity;
use App\Models\PointTransaction;
use App\Models\LocalMemberPoint;
use Carbon\Carbon;

class StaffController extends Controller
{
    /**
     * POST /api/v1/staff/verify-pin
     * Verifikasi PIN Pos/Staff untuk mengambil data event dan daftar POS aktif.
     */
    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|max:10'
        ]);

        $event = Event::where('pos_pin', $request->pin)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'PIN tidak valid atau event tidak ditemukan.'
            ], 422);
        }

        // Ambil POS (stations) aktif untuk event ini
        $stations = EventStation::where('event_id', $event->id)
            ->where('is_active', true)
            ->get(['id', 'name', 'description', 'photo_path']);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'image_path' => $event->image_path,
                'start_date' => $event->start_date ? $event->start_date->format('Y-m-d H:i:s') : null,
                'end_date' => $event->end_date ? $event->end_date->format('Y-m-d H:i:s') : null,
                'timezone' => $event->timezone
            ],
            'stations' => $stations
        ], 200);
    }

    /**
     * POST /api/v1/staff/scan
     * Memproses scan QR Code dari handphone staff pos.
     */
    public function scan(Request $request)
    {
        $request->validate([
            'qr_string' => 'required|string',
            'post_id' => 'required|integer|exists:event_stations,id',
            'pos_pin' => 'required|string',
            'scan_type' => 'nullable|string|in:in,out'
        ]);

        $station = EventStation::findOrFail($request->post_id);
        $event = Event::findOrFail($station->event_id);

        // Verifikasi PIN
        if ($event->pos_pin !== $request->pos_pin) {
            return response()->json(['message' => 'Otorisasi gagal. PIN tidak sesuai.'], 403);
        }

        // Dekode QR String (Format: ticket_code.hash atau ticket_code saja)
        $qrParts = explode('.', $request->qr_string);
        $ticketCode = $qrParts[0];

        $ticket = Ticket::with('orderItem.order')->where('ticket_code', $ticketCode)->first();

        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan.'], 404);
        }

        // Validasi Kunci Keamanan QR (jika ada tanda tanda hash)
        if (count($qrParts) === 2) {
            $receivedHash = $qrParts[1];
            $secretKey = config('app.key');
            $stringToSign = $ticket->id . '|' . $ticket->ticket_code;
            $expectedHash = hash_hmac('sha256', $stringToSign, $secretKey);

            if (!hash_equals($expectedHash, $receivedHash)) {
                return response()->json(['message' => 'QR Code tidak valid / palsu.'], 403);
            }
        }

        // 1. VERIFIKASI STRICT EVENT ID MATCH
        $ticketOrderItem = $ticket->orderItem;
        $ticketOrder = $ticketOrderItem ? $ticketOrderItem->order : null;
        if (!$ticketOrder || (int) $ticketOrder->event_id !== (int) $event->id) {
            return response()->json(['message' => 'Tiket tidak terdaftar untuk event ini.'], 422);
        }

        // 2. VERIFIKASI PEMBAYARAN LUNAS
        if ($ticketOrder->status !== 'paid') {
            return response()->json(['message' => 'Tiket belum lunas / pembayaran pending.'], 422);
        }

        // 3. VERIFIKASI TANGGAL EVENT (BELUM KEDALUWARSA)
        if ($event->end_date && Carbon::parse($event->end_date)->endOfDay()->isPast()) {
            return response()->json(['message' => 'Event ini sudah selesai / kedaluwarsa.'], 422);
        }

        $scanType = $request->input('scan_type', 'in');

        // Validasi Check-in Lintas POS menggunakan status tiket
        if ($scanType === 'in') {
            if ($ticket->status === 'used') {
                return response()->json([
                    'message' => 'Tiket sudah digunakan! Peserta telah check-in sebelumnya.',
                    'attendee_name' => $ticket->attendee_name
                ], 409);
            }

            // Catat Kehadiran (Check-in)
            DB::table('attendance_logs')->insert([
                'ticket_id' => $ticket->id,
                'event_id' => $event->id,
                'post_id' => $station->id,
                'session_id' => null,
                'scan_time' => Carbon::now(),
                'checkout_time' => null,
                'scanned_by' => auth('sanctum')->id(),
                'method' => 'qr',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            // Perbarui status tiket menjadi used
            $ticket->update(['status' => 'used']);

            \App\Services\CertificateNotificationHelper::checkAndNotify($event->id, $ticket->participant_id);

            // Auto reward check-in points
            $this->awardAttendancePoints($ticket, $event->id);

            $msg = 'Berhasil memverifikasi check-in ' . $ticket->attendee_name;
        } else {
            // PERBAIKAN: Check-out
            if ($ticket->status !== 'used') {
                return response()->json([
                    'message' => 'Peserta belum melakukan check-in, tidak bisa check-out.',
                    'attendee_name' => $ticket->attendee_name
                ], 400);
            }

            // Cari log absensi terakhir untuk tiket ini
            $attendanceLog = DB::table('attendance_logs')
                ->where('ticket_id', $ticket->id)
                ->latest('scan_time')
                ->first();

            if ($attendanceLog && $attendanceLog->checkout_time) {
                return response()->json([
                    'message' => 'Peserta sudah melakukan check-out sebelumnya.',
                    'attendee_name' => $ticket->attendee_name
                ], 409);
            }

            // Update waktu check-out
            if ($attendanceLog) {
                DB::table('attendance_logs')
                    ->where('id', $attendanceLog->id)
                    ->update([
                        'checkout_time' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    ]);
            }

            $msg = 'Berhasil memverifikasi check-out ' . $ticket->attendee_name;
        }

        // Ambil Ringkasan Kehadiran Global
        $stats = $this->getAttendanceStats($event->id);

        return response()->json([
            'success' => true,
            'message' => $msg,
            'attendee' => [
                'name' => $ticket->attendee_name,
                'email' => $ticket->attendee_email,
                'code' => $ticket->ticket_code,
                'time' => Carbon::now()->format('H:i:s')
            ],
            'stats' => $stats
        ], 200);
    }

    /**
     * POST /api/v1/staff/manual-checkin
     * Mencatat check-in secara manual (manual override) dari tabel pencarian dashboard staff.
     */
    public function manualCheckin(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|integer|exists:tickets,id',
            'post_id' => 'required|integer|exists:event_stations,id',
            'pos_pin' => 'required|string',
            'scan_type' => 'nullable|string|in:in,out'
        ]);

        $station = EventStation::findOrFail($request->post_id);
        $event = Event::findOrFail($station->event_id);

        // Verifikasi PIN
        if ($event->pos_pin !== $request->pos_pin) {
            return response()->json(['message' => 'Otorisasi gagal. PIN tidak sesuai.'], 403);
        }

        $ticket = Ticket::with('orderItem.order')->findOrFail($request->ticket_id);

        // 1. VERIFIKASI STRICT EVENT ID MATCH
        $ticketOrderItem = $ticket->orderItem;
        $ticketOrder = $ticketOrderItem ? $ticketOrderItem->order : null;
        if (!$ticketOrder || (int) $ticketOrder->event_id !== (int) $event->id) {
            return response()->json(['message' => 'Tiket tidak terdaftar untuk event ini.'], 422);
        }

        // 2. VERIFIKASI PEMBAYARAN LUNAS
        if ($ticketOrder->status !== 'paid') {
            return response()->json(['message' => 'Tiket belum lunas / pembayaran pending.'], 422);
        }

        $scanType = $request->input('scan_type', 'in');

        // PERBAIKAN: Validasi Manual Lintas POS
        if ($scanType === 'in') {
            if ($ticket->status === 'used') {
                return response()->json([
                    'message' => 'Tiket sudah digunakan! Peserta telah check-in sebelumnya.',
                    'attendee_name' => $ticket->attendee_name
                ], 409);
            }

            // Catat Kehadiran (Check-in)
            DB::table('attendance_logs')->insert([
                'ticket_id' => $ticket->id,
                'event_id' => $event->id,
                'post_id' => $station->id,
                'session_id' => null,
                'scan_time' => Carbon::now(),
                'checkout_time' => null,
                'scanned_by' => auth('sanctum')->id(),
                'method' => 'manual',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            // Perbarui status tiket menjadi used
            $ticket->update(['status' => 'used']);

            \App\Services\CertificateNotificationHelper::checkAndNotify($event->id, $ticket->participant_id);

            // Auto reward check-in points
            $this->awardAttendancePoints($ticket, $event->id);

            $msg = 'Kehadiran manual (check-in) berhasil dicatat untuk ' . $ticket->attendee_name;
        } else {
            // Check-out
            if ($ticket->status !== 'used') {
                return response()->json([
                    'message' => 'Peserta belum melakukan check-in, tidak bisa check-out.',
                    'attendee_name' => $ticket->attendee_name
                ], 400);
            }

            $attendanceLog = DB::table('attendance_logs')
                ->where('ticket_id', $ticket->id)
                ->latest('scan_time')
                ->first();

            if ($attendanceLog && $attendanceLog->checkout_time) {
                return response()->json([
                    'message' => 'Peserta sudah melakukan check-out sebelumnya.',
                    'attendee_name' => $ticket->attendee_name
                ], 409);
            }

            // Update waktu check-out
            if ($attendanceLog) {
                DB::table('attendance_logs')
                    ->where('id', $attendanceLog->id)
                    ->update([
                        'checkout_time' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    ]);
            }

            $msg = 'Kehadiran manual (check-out) berhasil dicatat untuk ' . $ticket->attendee_name;
        }

        // Ambil Ringkasan Kehadiran Global
        $stats = $this->getAttendanceStats($event->id);

        return response()->json([
            'success' => true,
            'message' => $msg,
            'attendee' => [
                'name' => $ticket->attendee_name,
                'email' => $ticket->attendee_email,
                'code' => $ticket->ticket_code,
                'time' => Carbon::now()->format('H:i:s')
            ],
            'stats' => $stats
        ], 200);
    }

    /**
     * GET /api/v1/staff/search-tickets
     * Pencarian manual berbasis pencarian as-you-type untuk override.
     */
    public function searchTickets(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string',
            'event_id' => 'required|integer|exists:events,id',
            'pos_pin' => 'required|string'
        ]);

        $event = Event::findOrFail($request->event_id);

        // Verifikasi PIN
        if ($event->pos_pin !== $request->pos_pin) {
            return response()->json(['message' => 'Otorisasi gagal. PIN tidak sesuai.'], 403);
        }

        $query = $request->query('q');

        // Cari tiket yang terkait dengan order lunas di event ini
        $ticketsQuery = Ticket::with(['participant.localPoints'])->whereHas('orderItem.order', function ($q) use ($event) {
            $q->where('event_id', $event->id)->where('status', 'paid');
        });

        // Simpan jumlah data total/hadir secara terpisah untuk injeksi ke response
        $stats = $this->getAttendanceStats($event->id);

        if ($query) {
            $ticketsQuery->where(function($q) use ($query) {
                $q->where('attendee_name', 'LIKE', "%{$query}%")
                  ->orWhere('ticket_code', 'LIKE', "%{$query}%")
                  ->orWhere('attendee_email', 'LIKE', "%{$query}%");
            });
            
            // Batasi hanya untuk query pencarian agar ringan
            $tickets = $ticketsQuery->take(15)->get();
        } else {
            // Jika tidak ada query (load awal), ambil semua untuk menu daftar peserta
            $tickets = $ticketsQuery->get();
        }

        return response()->json([
            'success' => true,
            'data' => $tickets,
            'stats' => $stats, // Injeksi stat asli (memperbaiki bug perhitungan frontend)
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'start_date' => $event->start_date ? $event->start_date->format('Y-m-d H:i:s') : null,
                'end_date' => $event->end_date ? $event->end_date->format('Y-m-d H:i:s') : null,
                'timezone' => $event->timezone
            ]
        ], 200);
    }

    /**
     * Helper method to calculate Global Event Stats dynamically.
     */
    private function getAttendanceStats($eventId)
    {
        // 1. Total Kuota Keseluruhan Event (Tiket Lunas)
        $totalTickets = Ticket::whereHas('orderItem.order', function ($q) use ($eventId) {
            $q->where('event_id', $eventId)->where('status', 'paid');
        })->count();

        // 2. Jumlah Global Hadir (Tiket berstatus 'used')
        $checkedIn = Ticket::whereHas('orderItem.order', function ($q) use ($eventId) {
            $q->where('event_id', $eventId)->where('status', 'paid');
        })->where('status', 'used')->count();

        // 3. Jumlah Belum Hadir
        $notCheckedIn = max(0, $totalTickets - $checkedIn);

        return [
            'total_quota' => $totalTickets,
            'checked_in' => $checkedIn,
            'remaining' => $notCheckedIn
        ];
    }

    /**
     * Automatically award points for the check_in activity.
     */
    private function awardAttendancePoints($ticket, $eventId)
    {
        $userId = $ticket->participant_id;
        if (!$userId) {
            return;
        }

        $activity = Activity::where('slug', 'check_in')->first();
        if (!$activity || !$activity->is_active) {
            return;
        }

        // Check if already has points for check_in for this event to avoid duplicate points
        $exists = PointTransaction::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->where('activity_id', $activity->id)
            ->exists();

        if ($exists) {
            return;
        }

        $points = $activity->points_rewarded;

        DB::transaction(function () use ($userId, $eventId, $activity, $points) {
            $localPoint = LocalMemberPoint::firstOrCreate(
                ['user_id' => $userId, 'event_id' => $eventId],
                ['points_balance' => 0]
            );

            $lockedPoint = LocalMemberPoint::where('id', $localPoint->id)
                ->lockForUpdate()
                ->first();

            $lockedPoint->points_balance += $points;
            $lockedPoint->save();

            PointTransaction::create([
                'type' => 'local',
                'user_id' => $userId,
                'event_id' => $eventId,
                'activity_id' => $activity->id,
                'amount' => $points,
                'description' => 'Poin Kehadiran (Check-in)',
            ]);
        });

        // NOTIFICATION: Kirim notifikasi ke peserta
        $participantUser = \App\Models\User::find($userId);
        if ($participantUser) {
            $participantUser->notify(new \App\Notifications\OperationalNotification(
                "Poin Aktivitas Ditambahkan!",
                "Selamat! Kamu mendapatkan +{$points} poin dari aktivitas \"{$activity->name}\".",
                "points_earned",
                [
                    'event_id' => $eventId,
                    'points' => $points,
                    'activity_name' => $activity->name,
                    'description' => 'Poin Kehadiran (Check-in)'
                ]
            ));
        }
    }

    /**
     * POST /api/v1/staff/kiosk-scan
     * Memproses scan Kiosk berpoin dari staff (tanpa organizer login, menggunakan PIN).
     */
    public function kioskScan(Request $request)
    {
        $validated = $request->validate([
            'ticket_code' => 'required|string',
            'activity_slug' => 'required|string|in:check_in,ask_question,booth_visit',
            'description' => 'nullable|string',
            'pos_pin' => 'nullable|string'
        ]);

        $ticketCode = strtoupper(trim($validated['ticket_code']));
        $activitySlug = $validated['activity_slug'];
        $description = $validated['description'] ?? null;

        // Cari tiket dan event-nya
        $ticket = Ticket::with(['orderItem.order'])
            ->where('ticket_code', $ticketCode)
            ->first();

        if (!$ticket || $ticket->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Tiket tidak valid atau telah dibatalkan.'
            ], 422);
        }

        $eventId = $ticket->orderItem->order->event_id ?? null;
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan.'
            ], 404);
        }

        $userId = $ticket->participant_id;
        if (!$userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Peserta tidak terhubung dengan user account.'
            ], 422);
        }

        // Ambil/buat master activity
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

        // Validasi double claim (anti fraud)
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

        $points = $activity->points_rewarded;

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