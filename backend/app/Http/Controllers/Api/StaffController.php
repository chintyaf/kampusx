<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Event;
use App\Models\EventStation;
use App\Models\Ticket;
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
                'image_path' => $event->image_path
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
            'pos_pin' => 'required|string'
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
        if (!$ticketOrder || $ticketOrder->event_id !== $event->id) {
            return response()->json(['message' => 'Tiket tidak terdaftar untuk event ini.'], 422);
        }

        // 2. VERIFIKASI PEMBAYARAN LUNAS
        if ($ticketOrder->status !== 'paid') {
            return response()->json(['message' => 'Tiket belum lunas / pembayaran pending.'], 422);
        }

        // 3. VERIFIKASI TANGGAL EVENT (BELUM KEDALUWARSA)
        // Batasan: Hari acara masih berlaku (sampai max tanggal end_date)
        if ($event->end_date && Carbon::parse($event->end_date)->endOfDay()->isPast()) {
            return response()->json(['message' => 'Event ini sudah selesai / kedaluwarsa.'], 422);
        }

        // 4. VERIFIKASI DUPLIKAT ABSEN DI POS INI
        $isDuplicate = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('post_id', $station->id)
            ->exists();

        if ($isDuplicate) {
            return response()->json([
                'message' => 'Peserta sudah melakukan check-in di POS ini sebelumnya.',
                'attendee_name' => $ticket->attendee_name
            ], 409);
        }

        // Catat Kehadiran
        DB::table('attendance_logs')->insert([
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'post_id' => $station->id,
            'session_id' => null,
            'scan_time' => Carbon::now(),
            'scanned_by' => auth('sanctum')->id(),
            'method' => 'qr',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Perbarui status tiket menjadi used
        $ticket->update(['status' => 'used']);

        // Ambil Ringkasan Kehadiran
        $stats = $this->getAttendanceStats($event->id, $station->id);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil memverifikasi kehadiran ' . $ticket->attendee_name,
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
            'pos_pin' => 'required|string'
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
        if (!$ticketOrder || $ticketOrder->event_id !== $event->id) {
            return response()->json(['message' => 'Tiket tidak terdaftar untuk event ini.'], 422);
        }

        // 2. VERIFIKASI PEMBAYARAN LUNAS
        if ($ticketOrder->status !== 'paid') {
            return response()->json(['message' => 'Tiket belum lunas / pembayaran pending.'], 422);
        }

        // 3. VERIFIKASI DUPLIKAT ABSEN DI POS INI
        $isDuplicate = DB::table('attendance_logs')
            ->where('ticket_id', $ticket->id)
            ->where('post_id', $station->id)
            ->exists();

        if ($isDuplicate) {
            return response()->json([
                'message' => 'Peserta sudah melakukan check-in di POS ini sebelumnya.',
                'attendee_name' => $ticket->attendee_name
            ], 409);
        }

        // Catat Kehadiran Manual
        DB::table('attendance_logs')->insert([
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'post_id' => $station->id,
            'session_id' => null,
            'scan_time' => Carbon::now(),
            'scanned_by' => auth('sanctum')->id(),
            'method' => 'manual',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        $ticket->update(['status' => 'used']);

        // Ambil Ringkasan Kehadiran
        $stats = $this->getAttendanceStats($event->id, $station->id);

        return response()->json([
            'success' => true,
            'message' => 'Kehadiran manual berhasil dicatat untuk ' . $ticket->attendee_name,
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
        $ticketsQuery = Ticket::whereHas('orderItem.order', function ($q) use ($event) {
            $q->where('event_id', $event->id)->where('status', 'paid');
        });

        if ($query) {
            $ticketsQuery->where(function($q) use ($query) {
                $q->where('attendee_name', 'LIKE', "%{$query}%")
                  ->orWhere('ticket_code', 'LIKE', "%{$query}%")
                  ->orWhere('attendee_email', 'LIKE', "%{$query}%");
            });
        }

        $tickets = $ticketsQuery->take(15)->get(['id', 'attendee_name', 'attendee_email', 'ticket_code', 'status']);

        return response()->json([
            'success' => true,
            'data' => $tickets
        ], 200);
    }

    /**
     * Helper method to calculate POS stats dynamically.
     */
    private function getAttendanceStats($eventId, $stationId)
    {
        // 1. Total Kuota Pos (Total Tiket Lunas untuk event ini)
        $totalTickets = Ticket::whereHas('orderItem.order', function ($q) use ($eventId) {
            $q->where('event_id', $eventId)->where('status', 'paid');
        })->count();

        // 2. Jumlah Hadir (Check-in di POS ini)
        $checkedIn = DB::table('attendance_logs')
            ->where('event_id', $eventId)
            ->where('post_id', $stationId)
            ->count();

        // 3. Jumlah Belum Hadir
        $notCheckedIn = max(0, $totalTickets - $checkedIn);

        return [
            'total_quota' => $totalTickets,
            'checked_in' => $checkedIn,
            'remaining' => $notCheckedIn
        ];
    }
}
