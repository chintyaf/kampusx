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

    /**
     * POST /api/attendance/venue-scan
     * Mencatat kehadiran ketika peserta men-scan QR Venue (Onsite)
     */
    public function venueScan(Request $request)
    {
        $request->validate([
            'qr_string' => 'required|string',
            'event_id' => 'required|integer'
        ]);

        $qrParts = explode('.', $request->qr_string);
        if (count($qrParts) !== 2) {
            return response()->json(['message' => 'Format QR tidak valid'], 400);
        }

        $venuePrefix = $qrParts[0];
        $receivedHash = $qrParts[1];

        // Parse type and expires_at from prefix
        $type = 'in';
        $eventIdParsed = null;
        $expiresAt = null;

        // Pattern: venue_{type}_{eventId}_{expiresAt}
        if (preg_match('/^venue_(in|out)_(\d+)_(.+)$/', $venuePrefix, $matches)) {
            $type = $matches[1];
            $eventIdParsed = $matches[2];
            $expiresAt = $matches[3];
        } elseif (preg_match('/^venue_(in|out)_(\d+)$/', $venuePrefix, $matches)) {
            $type = $matches[1];
            $eventIdParsed = $matches[2];
        } elseif (preg_match('/^venue_(\d+)$/', $venuePrefix, $matches)) {
            $type = 'in';
            $eventIdParsed = $matches[1];
        } else {
            return response()->json(['message' => 'Format QR tidak dikenali'], 400);
        }

        // Validasi prefix
        if ((int)$eventIdParsed !== (int)$request->event_id) {
            return response()->json(['message' => 'QR Code tidak sesuai dengan event ini'], 403);
        }

        // Verifikasi Hash
        $secretKey = config('app.key');
        $stringToSign = $venuePrefix;
        $expectedHash = hash_hmac('sha256', $stringToSign, $secretKey);

        if (!hash_equals($expectedHash, $receivedHash)) {
            return response()->json(['message' => 'QR Code tidak valid / palsu'], 403);
        }

        if ($expiresAt) {
            try {
                $expiryDate = \Carbon\Carbon::parse($expiresAt);
                if (\Carbon\Carbon::now()->greaterThan($expiryDate)) {
                    return response()->json(['message' => 'Link presensi sudah kedaluwarsa dan tidak dapat diakses lagi.'], 403);
                }
            } catch (\Exception $e) {
                return response()->json(['message' => 'Format waktu kedaluwarsa tidak valid'], 400);
            }
        }

        // Cari tiket user yang sedang login untuk event ini yang pembayarannya lunas (paid)
        $userId = $request->user()->id;
        $ticket = Ticket::where('participant_id', $userId)
            ->whereHas('orderItem.order', function ($q) use ($request) {
                $q->where('event_id', $request->event_id)->where('status', 'paid');
            })->first();

        if (!$ticket) {
            return response()->json(['message' => 'Anda tidak memiliki tiket yang valid untuk event ini'], 404);
        }

        // Cek log absensi
        $attendanceLog = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('event_id', $request->event_id)
            ->first();

        if ($type === 'in') {
            if ($attendanceLog) {
                return response()->json(['message' => 'Anda sudah melakukan check-in sebelumnya'], 409);
            }

            // Catat kehadiran
            DB::table('attendance_logs')->insert([
                'ticket_id' => $ticket->id,
                'event_id' => $request->event_id,
                'session_id' => null,
                'scan_time' => Carbon::now(),
                'scanned_by' => $userId, // User menscan dirinya sendiri
                'method' => 'venue_qr',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $ticket->update(['status' => 'used']);

            return response()->json([
                'success' => true,
                'type' => 'in',
                'message' => 'Kehadiran berhasil dicatat'
            ], 200);

        } else if ($type === 'out') {
            if (!$attendanceLog) {
                return response()->json(['message' => 'Anda belum melakukan check-in, tidak bisa check-out'], 403);
            }

            if ($attendanceLog->checkout_time) {
                return response()->json(['message' => 'Anda sudah melakukan check-out sebelumnya'], 409);
            }

            DB::table('attendance_logs')
                ->where('id', $attendanceLog->id)
                ->update([
                    'checkout_time' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]);

            return response()->json([
                'success' => true,
                'type' => 'out',
                'message' => 'Check-out berhasil dicatat. Terima kasih telah mengikuti acara!'
            ], 200);
        }
    }
}
