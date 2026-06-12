<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\AttendanceLog;
use App\Models\AttendanceLink;
use Carbon\Carbon;

class EventAttendanceController extends Controller
{
    public function getLinks($eventId)
    {
        $event = Event::findOrFail($eventId);
        $sessions = $event->sessions()
            ->orderBy('day_number', 'asc')
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'checkin_link' => $event->checkin_link,
                'checkin_expires_at' => $event->checkin_expires_at,
                'checkout_link' => $event->checkout_link,
                'checkout_expires_at' => $event->checkout_expires_at,
                'sessions' => $sessions->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'title' => $session->title,
                        'day_number' => $session->day_number,
                        'date' => $session->date,
                        'start_time' => $session->start_time,
                        'end_time' => $session->end_time,
                        'checkin_link' => $session->checkin_link,
                        'checkin_expires_at' => $session->checkin_expires_at,
                        'checkout_link' => $session->checkout_link,
                        'checkout_expires_at' => $session->checkout_expires_at,
                    ];
                })
            ]
        ]);
    }

    public function generateLink(Request $request, $eventId)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'type' => 'required|in:in,out,session_in,session_out',
            'session_id' => 'required_if:type,session_in,session_out|exists:event_sessions,id',
            'expires_at' => 'nullable|date'
        ]);

        // 2. Pastikan event ada
        $event = Event::findOrFail($eventId);

        $type = $request->type;
        $expiresAt = $request->expires_at; // Format: YYYY-MM-DD HH:mm:ss
        $sessionId = $request->session_id;

        // 3. Membuat payload unik.
        if ($type === 'session_in' || $type === 'session_out') {
            $session = $event->sessions()->findOrFail($sessionId);
            $payload = $event->id . '|' . $type . '|' . $sessionId . '|' . $expiresAt;
        } else {
            $payload = $event->id . '|' . $type . '|' . $expiresAt;
        }

        // 4. Membuat signature HMAC SHA256 menggunakan APP_KEY bawaan Laravel
        $signature = hash_hmac('sha256', $payload, config('app.key'));

        // 5. Generate Short Code unik & Simpan ke tabel attendance_links
        do {
            $code = \Str::upper(\Str::random(8));
        } while (AttendanceLink::where('code', $code)->exists());

        AttendanceLink::updateOrCreate(
            [
                'event_id' => $event->id,
                'type' => $type,
                'session_id' => $sessionId ?? null
            ],
            [
                'code' => $code,
                'expires_at' => $expiresAt,
                'signature' => $signature
            ]
        );

        // 6. Merakit URL Pendek Final di Backend
        $frontendUrl = config('app.frontend_url');
        $finalUrl = "{$frontendUrl}/a/{$code}";

        // 7. Menyimpan URL Pendek dan Waktu Kedaluwarsa ke Database
        if ($type === 'in') {
            $event->checkin_link = $finalUrl;
            $event->checkin_expires_at = $expiresAt;
            $event->save();
        } elseif ($type === 'out') {
            $event->checkout_link = $finalUrl;
            $event->checkout_expires_at = $expiresAt;
            $event->save();
        } elseif ($type === 'session_in') {
            $session->checkin_link = $finalUrl;
            $session->checkin_expires_at = $expiresAt;
            $session->save();
        } else { // session_out
            $session->checkout_link = $finalUrl;
            $session->checkout_expires_at = $expiresAt;
            $session->save();
        }

        // 8. Kembalikan response JSON yang menyertakan URL yang sudah jadi
        return response()->json([
            'success' => true,
            'message' => 'Link berhasil dibuat dan disimpan.',
            'data' => [
                'event_id' => $event->id,
                'session_id' => $sessionId,
                'type' => $type,
                'expires_at' => $expiresAt,
                'signature' => $signature,
                'url' => $finalUrl
            ]
        ]);
    }

    public function resolveLink($code)
    {
        $link = AttendanceLink::where('code', $code)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'event_id' => $link->event_id,
                'session_id' => $link->session_id,
                'type' => $link->type,
                'expires_at' => $link->expires_at ? \Carbon\Carbon::parse($link->expires_at)->format('Y-m-d H:i:s') : null,
                'signature' => $link->signature
            ]
        ]);
    }

    public function processAttendance(Request $request)
    {
        // 1. Validasi format input dari frontend React
        $request->validate([
            'event_id'   => 'required|exists:events,id',
            'type'       => 'required|in:in,out,session_in,session_out',
            'session_id' => 'required_if:type,session_in,session_out|exists:event_sessions,id',
            'signature'  => 'required|string',
            'expires_at' => 'nullable|date',
        ]);

        // 2. LAYER 1 & 2: Verifikasi Link (Fungsi Terpisah)
        $linkError = $this->verifyLinkIntegrityAndExpiry($request);
        if ($linkError) {
            return $linkError;
        }

        // 3. LAYER 3: Verifikasi Tiket Peserta (Fungsi Terpisah)
        $ticket = $this->getActiveTicket(auth()->id(), $request->event_id);
        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar sebagai peserta dalam acara ini atau tiket Anda tidak aktif.'
            ], 403);
        }

        // 4. LAYER 4 & 5: Eksekusi Absensi (Fungsi Terpisah)
        return $this->recordAttendanceLog($ticket, $request);
    }

    // =========================================================================
    // HELPER FUNCTIONS (UNTUK MENGHILANGKAN TUMPUKAN IF)
    // =========================================================================

    /**
     * Memvalidasi keaslian signature hmac dan waktu expired link
     */
    private function verifyLinkIntegrityAndExpiry(Request $request)
    {
        // Ganti IF dengan ternary pendek untuk membuat array payload
        $payloadParts = str_contains($request->type, 'session')
            ? [$request->event_id, $request->type, $request->session_id, $request->expires_at]
            : [$request->event_id, $request->type, $request->expires_at];

        $expectedSignature = hash_hmac('sha256', implode('|', $payloadParts), config('app.key'));

        if (!hash_equals($expectedSignature, $request->signature)) {
            return response()->json(['success' => false, 'message' => 'Link presensi tidak valid atau telah dimodifikasi.'], 403);
        }

        if ($request->expires_at && Carbon::now()->greaterThan(Carbon::parse($request->expires_at))) {
            return response()->json(['success' => false, 'message' => 'Waktu akses untuk link presensi ini sudah berakhir.'], 403);
        }

        return null; // Lolos validasi
    }

    /**
     * Mengambil data tiket aktif peserta
     */
    private function getActiveTicket($userId, $eventId)
    {
        return Ticket::where('participant_id', $userId)
            ->where('status', 'active')
            ->whereHas('orderItem.order', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->first();
    }

    /**
     * Mencatat absen masuk/keluar secara dinamis tanpa if-else bercabang
     */
    private function recordAttendanceLog($ticket, Request $request)
    {
        $targetSessionId = str_contains($request->type, 'session') ? $request->session_id : null;

        $attendance = AttendanceLog::firstOrNew([
            'ticket_id'  => $ticket->id,
            'event_id'   => $request->event_id,
            'session_id' => $targetSessionId,
        ]);

        $attendance->user_id = auth()->id();
        $attendance->method = 'online_link';

        // MAPPING CONFIGURATION: Teknik sakti untuk membuang ribuan IF bercabang
        $attendanceMap = [
            'in' => [
                'column'  => 'scan_time',
                'already' => 'Anda sudah melakukan Check-in',
                'success' => 'Check-in awal berhasil dicatat!'
            ],
            'session_in' => [
                'column'  => 'scan_time',
                'already' => 'Anda sudah melakukan Check-in untuk sesi ini sebelumnya.',
                'success' => 'Check-in sesi berhasil dicatat!'
            ],
            'out' => [
                'column'  => 'checkout_time',
                'already' => 'Anda sudah melakukan Check-out sebelumnya.',
                'success' => 'Check-out berhasil dicatat!'
            ],
            'session_out' => [
                'column'  => 'checkout_time',
                'already' => 'Anda sudah melakukan Check-out hari ini sebelumnya.',
                'success' => 'Check-out hari ini berhasil dicatat!'
            ],
        ][$request->type];

        $targetColumn = $attendanceMap['column'];

        // Cek apakah kolom waktu (scan_time / checkout_time) sudah terisi
        if ($attendance->$targetColumn) {
            return response()->json(['success' => false, 'message' => $attendanceMap['already']], 400);
        }

        // Isi kolom secara dinamis dan simpan
        $attendance->$targetColumn = Carbon::now();
        $attendance->save();

        return response()->json(['success' => true, 'message' => $attendanceMap['success']]);
    }
}
