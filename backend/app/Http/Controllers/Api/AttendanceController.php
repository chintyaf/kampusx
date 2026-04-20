<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Ticket;
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

        return response()->json([
            'success' => true,
            'message' => 'Kehadiran manual berhasil dicatat'
        ], 200);
    }
}
