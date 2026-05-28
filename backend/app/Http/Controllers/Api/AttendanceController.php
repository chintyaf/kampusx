<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Ticket;
use App\Models\Event;
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
            'event_id' => 'required|integer', // Panitia men-scan tiket pada context suatu event
            'type' => 'nullable|in:check-in,check-out'
        ]);

        $type = $request->type ?? 'check-in';

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

        // Cek Event Window Control
        $event = Event::find($request->event_id);
        if ($event) {
            $now = Carbon::now();
            if ($event->attendance_open_at && $now->lt($event->attendance_open_at)) {
                return response()->json(['message' => 'Sesi presensi belum dibuka.'], 403);
            }
            if ($event->attendance_close_at && $now->gt($event->attendance_close_at)) {
                return response()->json(['message' => 'Sesi presensi sudah ditutup.'], 403);
            }
        }

        // Cek Kehadiran di attendance_logs
        $log = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('event_id', $request->event_id)
            ->first();

        if ($type === 'check-in') {
            if ($log) {
                return response()->json(['message' => 'Tiket sudah check-in sebelumnya'], 409);
            }
            
            // Catat check-in
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
            $ticket->update(['status' => 'checked_in']);
            
            return response()->json([
                'success' => true,
                'message' => 'Berhasil memverifikasi check-in kehadiran',
                'ticket_id' => $ticket->id
            ], 200);
        } else {
            // Check-out
            if (!$log) {
                return response()->json(['message' => 'Peserta belum check-in'], 400);
            }
            if ($log->check_out_time) {
                return response()->json(['message' => 'Peserta sudah check-out sebelumnya'], 409);
            }
            
            DB::table('attendance_logs')
                ->where('id', $log->id)
                ->update(['check_out_time' => Carbon::now(), 'updated_at' => Carbon::now()]);
                
            return response()->json([
                'success' => true,
                'message' => 'Berhasil memverifikasi check-out',
                'ticket_id' => $ticket->id
            ], 200);
        }
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
            'event_id' => 'required|integer',
            'type' => 'nullable|in:check-in,check-out'
        ]);
        
        $type = $request->type ?? 'check-in';

        $ticket = Ticket::find($request->ticket_id);
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        // Cek Event Window Control
        $event = Event::find($request->event_id);
        if ($event) {
            $now = Carbon::now();
            if ($event->attendance_open_at && $now->lt($event->attendance_open_at)) {
                return response()->json(['message' => 'Sesi presensi belum dibuka.'], 403);
            }
            if ($event->attendance_close_at && $now->gt($event->attendance_close_at)) {
                return response()->json(['message' => 'Sesi presensi sudah ditutup.'], 403);
            }
        }

        // Cek log
        $log = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('event_id', $request->event_id)
            ->first();

        if ($type === 'check-in') {
            if ($log) {
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

            $ticket->update(['status' => 'checked_in']);

            return response()->json([
                'success' => true,
                'message' => 'Check-in manual berhasil dicatat'
            ], 200);
        } else {
            // Check-out manual
            if (!$log) {
                return response()->json(['message' => 'Peserta belum check-in'], 400);
            }
            if ($log->check_out_time) {
                return response()->json(['message' => 'Peserta sudah check-out sebelumnya'], 409);
            }
            
            DB::table('attendance_logs')
                ->where('id', $log->id)
                ->update(['check_out_time' => Carbon::now(), 'updated_at' => Carbon::now()]);
                
            return response()->json([
                'success' => true,
                'message' => 'Check-out manual berhasil dicatat'
            ], 200);
        }
    }

    /**
     * POST /api/attendance/self-checkin
     * Mencatat kehadiran mandiri menggunakan QR Venue
     */
    public function selfCheckin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'type' => 'nullable|in:check-in,check-out'
        ]);

        $type = $request->type ?? 'check-in';

        $event = Event::where('self_checkin_token', $request->token)->first();
        if (!$event) {
            return response()->json(['message' => 'Token QR tidak valid atau sudah kadaluarsa'], 404);
        }

        // Cek Event Window Control
        $now = Carbon::now();
        if ($event->attendance_open_at && $now->lt($event->attendance_open_at)) {
            return response()->json(['message' => 'Sesi presensi belum dibuka.'], 403);
        }
        if ($event->attendance_close_at && $now->gt($event->attendance_close_at)) {
            return response()->json(['message' => 'Sesi presensi sudah ditutup.'], 403);
        }

        // Cari tiket peserta untuk event ini
        $user = $request->user();
        $ticket = Ticket::where('participant_id', $user->id)
            ->whereHas('orderItem.order', function($q) use ($event) {
                $q->where('event_id', $event->id);
            })
            ->whereIn('status', ['active', 'checked_in'])
            ->first();

        if (!$ticket) {
            return response()->json(['message' => 'Anda tidak memiliki tiket yang valid untuk event ini.'], 403);
        }

        // Cek log
        $log = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('event_id', $event->id)
            ->first();

        if ($type === 'check-in') {
            if ($log) {
                return response()->json(['message' => 'Kehadiran Anda sudah tercatat sebelumnya.'], 409);
            }

            DB::table('attendance_logs')->insert([
                'ticket_id' => $ticket->id,
                'event_id' => $event->id,
                'session_id' => null,
                'scan_time' => Carbon::now(),
                'scanned_by' => $user->id, // self
                'method' => 'self_checkin',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $ticket->update(['status' => 'checked_in']);

            return response()->json([
                'success' => true,
                'message' => 'Kehadiran berhasil dicatat. Selamat mengikuti acara!'
            ], 200);
        } else {
            // Check-out
            if (!$log) {
                return response()->json(['message' => 'Anda belum melakukan check-in.'], 400);
            }
            if ($log->check_out_time) {
                return response()->json(['message' => 'Anda sudah check-out sebelumnya.'], 409);
            }
            
            DB::table('attendance_logs')
                ->where('id', $log->id)
                ->update(['check_out_time' => Carbon::now(), 'updated_at' => Carbon::now()]);
                
            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil dicatat. Terima kasih!'
            ], 200);
        }
    }
}
