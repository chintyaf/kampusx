<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Ticket;
use App\Models\Activity;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * POST /api/attendance/scan
     * Validasi Scanner (Core Logic)
     */
    public function scanQr(Request $request)
    {
        $request->validate([
            'qr_string' => 'required|string',
            'event_id' => 'required|integer' // Panitia men-scan tiket pada context suatu event
        ]);

        $qrParts = explode('.', $request->qr_string);
        if (count($qrParts) !== 2) {
            return response()->json(['message' => 'Format QR tidak valid'], 400);
        }

        $ticketCode = $qrParts[0];
        $receivedHash = $qrParts[1];

        $ticket = Ticket::where('ticket_code', $ticketCode)->first();

        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        // Verifikasi Hash
        $secretKey = config('app.key');
        $stringToSign = $ticket->id . '|' . $ticket->ticket_code;
        $expectedHash = hash_hmac('sha256', $stringToSign, $secretKey);

        if (!hash_equals($expectedHash, $receivedHash)) {
            return response()->json(['message' => 'QR Code tidak valid / palsu'], 403);
        }

        // Cek Duplikat di attendance_logs
        $isDuplicate = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('event_id', $request->event_id)
            ->exists();

        if ($isDuplicate) {
            return response()->json(['message' => 'Tiket sudah digunakan sebelumnya'], 409);
        }

        // Catat kehadiran
        DB::table('attendance_logs')->insert([
            'ticket_id' => $ticket->id,
            'event_id' => $request->event_id,
            'session_id' => $request->session_id ?? null,
            'scan_time' => Carbon::now(),
            'scanned_by' => $request->user()->id,
            'method' => 'qr',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Opsional: perbarui status tiket
        $ticket->update(['status' => 'used']);

        // Auto reward check-in points
        $this->awardAttendancePoints($ticket, $request->event_id);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil memverifikasi kehadiran',
            'ticket_id' => $ticket->id
        ], 200);
    }

    /**
     * GET /api/ticket/search
     * Pencarian Manual (Nama / NIM / Ticket Code)
     */
    public function searchTicket(Request $request)
    {
        $query = $request->query('q');

        if (!$query) {
            return response()->json(['data' => []], 200);
        }

        $tickets = Ticket::where('attendee_name', 'LIKE', "%{$query}%")
            ->orWhere('ticket_code', 'LIKE', "%{$query}%")
            ->orWhere('attendee_email', 'LIKE', "%{$query}%")
            ->get();

        return response()->json([
            'data' => $tickets
        ], 200);
    }

    /**
     * POST /api/attendance/manual
     * Mencatat kehadiran manual tanpa verifikasi hash
     */
    public function manualOverride(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|integer',
            'event_id' => 'required|integer'
        ]);

        $ticket = Ticket::find($request->ticket_id);
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        // Cek duplikat
        $isDuplicate = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('event_id', $request->event_id)
            ->exists();

        if ($isDuplicate) {
            return response()->json(['message' => 'Kehadiran sudah tercatat sebelumnya'], 409);
        }

        DB::table('attendance_logs')->insert([
            'ticket_id' => $ticket->id,
            'event_id' => $request->event_id,
            'session_id' => $request->session_id ?? null,
            'scan_time' => Carbon::now(),
            'scanned_by' => $request->user()->id,
            'method' => 'manual',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $ticket->update(['status' => 'used']);

        // Auto reward check-in points
        $this->awardAttendancePoints($ticket, $request->event_id);

        return response()->json([
            'success' => true,
            'message' => 'Kehadiran manual berhasil dicatat'
        ], 200);
    }

    

    public function attendVenue(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'type' => 'required|in:in,out',
            'expires_at' => 'nullable|date',
            'signature' => 'required|string',
            'device_token' => 'required|string' // Dikirim dari React localStorage
        ]);

        $eventId = $request->event_id;
        $type = $request->type;
        $expiresAt = $request->expires_at;
        $signature = $request->signature;
        $deviceToken = $request->device_token;
        $userId = auth()->id();

        // 1. Verifikasi Integritas Link (Anti-Tamper)
        $payload = $eventId . '|' . $type . '|' . $expiresAt;
        $expectedSignature = hash_hmac('sha256', $payload, config('app.key'));

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json(['success' => false, 'message' => 'Link presensi tidak valid atau telah dimodifikasi.'], 403);
        }

        // 2. Verifikasi Batas Waktu
        if ($expiresAt && Carbon::now()->greaterThan(Carbon::parse($expiresAt))) {
            return response()->json(['success' => false, 'message' => 'Link presensi sudah kedaluwarsa.'], 403);
        }

        // 3. Cari Data Presensi Peserta (Asumsi data attendance di-generate saat mendaftar event)
        // Jika skema databasenya berbeda, sesuaikan query ini
        $attendance = Attendance::where('event_id', $eventId)
                                ->where('user_id', $userId)
                                ->first();

        if (!$attendance) {
            return response()->json(['success' => false, 'message' => 'Anda tidak terdaftar dalam event ini.'], 403);
        }

        // 4. Verifikasi Device Lock
        if (is_null($attendance->device_id)) {
            // Pertama kali presensi, kunci perangkat ini
            $attendance->device_id = $deviceToken;
        } elseif ($attendance->device_id !== $deviceToken) {
            // Mencoba dari perangkat lain
            return response()->json(['success' => false, 'message' => 'Presensi ditolak. Anda harus menggunakan perangkat yang sama dengan saat pertama kali check-in.'], 403);
        }

        // 5. Update Waktu Presensi
        if ($type === 'in') {
            if ($attendance->check_in_time) {
                return response()->json(['success' => false, 'message' => 'Anda sudah melakukan check-in sebelumnya.'], 400);
            }
            $attendance->check_in_time = Carbon::now();
        } else {
            if (!$attendance->check_in_time) {
                return response()->json(['success' => false, 'message' => 'Anda harus check-in terlebih dahulu sebelum check-out.'], 400);
            }
            if ($attendance->check_out_time) {
                return response()->json(['success' => false, 'message' => 'Anda sudah melakukan check-out.'], 400);
            }
            $attendance->check_out_time = Carbon::now();
        }

        $attendance->save();

        return response()->json([
            'success' => true,
            'message' => 'Presensi berhasil dicatat.'
        ]);
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
    * POST /api/attendance/venue-scan
    * Mencatat kehadiran ketika peserta men-scan QR Venue (Onsite)
    */
    public function venueScan(Request $request)
    {
        $request->validate([
            'qr_string' => 'required|string',
            'event_id'  => 'required|integer',
        ]);

        $qrParts = explode('.', $request->qr_string);
        if (count($qrParts) !== 2) {
            return response()->json(['message' => 'Format QR tidak valid'], 400);
        }

        $ticket = Ticket::where('participant_id', $request->user()->id)->first();
        if (! $ticket) {
            return response()->json(['message' => 'Anda tidak memiliki tiket yang valid untuk event ini'], 404);
        }

        // Determine type: if prefix contains 'out' it's checkout, else check‑in
        $type = (strpos($qrParts[0], 'out') !== false) ? 'out' : 'in';

        if ($type === 'in') {
            // Prevent duplicate check‑in
            $exists = DB::table('attendance_logs')
                ->where('ticket_id', $ticket->id)
                ->where('event_id', $request->event_id)
                ->whereNull('checkout_time')
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'Anda sudah melakukan check‑in pada sesi ini sebelumnya'], 409);
            }

            DB::table('attendance_logs')->insert([
                'ticket_id' => $ticket->id,
                'event_id' => $request->event_id,
                'scan_time' => Carbon::now(),
                'method'    => 'venue_qr',
                'created_at'=> Carbon::now(),
                'updated_at'=> Carbon::now(),
            ]);

            $this->awardAttendancePoints($ticket, $request->event_id);

            return response()->json([
                'success' => true,
                'type'    => 'in',
                'message' => 'Kehadiran berhasil dicatat',
            ], 200);
        } else {
            // Checkout: must have a prior check‑in
            $log = DB::table('attendance_logs')
                ->where('ticket_id', $ticket->id)
                ->where('event_id', $request->event_id)
                ->whereNull('checkout_time')
                ->first();
            if (! $log) {
                return response()->json(['message' => 'Anda belum melakukan check‑in pada sesi ini, tidak bisa check‑out'], 403);
            }

            DB::table('attendance_logs')
                ->where('id', $log->id)
                ->update([
                    'checkout_time' => Carbon::now(),
                    'updated_at'    => Carbon::now(),
                ]);

            return response()->json([
                'success' => true,
                'type'    => 'out',
                'message' => 'Check‑out berhasil dicatat',
            ], 200);
        }
    }

}
