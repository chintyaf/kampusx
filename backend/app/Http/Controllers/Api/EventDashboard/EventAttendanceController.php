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
        $expiresAt = $request->expires_at ? Carbon::parse($request->expires_at)->format('Y-m-d H:i:s') : null;
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
            'session_id' => 'required_if:type,session_in,session_out|nullable|exists:event_sessions,id',
            'signature'  => 'required|string',
            'expires_at' => 'nullable|date',
            'device_token' => 'nullable|string',
        ]);

        // 2. LAYER 1 & 2: Verifikasi Link (Fungsi Terpisah)
        $linkError = $this->verifyLinkIntegrityAndExpiry($request);
        if ($linkError) {
            return $linkError;
        }

        // 3. LAYER 3: Verifikasi Tiket Peserta (Fungsi Terpisah)
        $ticket = $this->getActiveTicket(auth()->id(), $request->event_id);
        if (!$ticket) {
            \Illuminate\Support\Facades\Log::info('QR Ticket Failure', ['user_id' => auth()->id(), 'event_id' => $request->event_id]);
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar sebagai peserta dalam acara ini atau tiket Anda tidak aktif.'
            ], 403);
        }

        // 4. LAYER 4 & 5: Eksekusi Absensi (Fungsi Terpisah)
        $response = $this->recordAttendanceLog($ticket, $request);
        \Illuminate\Support\Facades\Log::info('QR Final Response', ['response' => $response->getData(true)]);
        return $response;
    }

    // =========================================================================
    // HELPER FUNCTIONS (UNTUK MENGHILANGKAN TUMPUKAN IF)
    // =========================================================================

    /**
     * Memvalidasi keaslian signature hmac dan waktu expired link
     */
    private function verifyLinkIntegrityAndExpiry(Request $request)
    {
        $normalizedExpiresAt = $request->expires_at ? Carbon::parse($request->expires_at)->format('Y-m-d H:i:s') : null;

        // Ganti IF dengan ternary pendek untuk membuat array payload
        $payloadParts = str_contains($request->type, 'session')
            ? [$request->event_id, $request->type, $request->session_id, $normalizedExpiresAt]
            : [$request->event_id, $request->type, $normalizedExpiresAt];

        $expectedSignature = hash_hmac('sha256', implode('|', $payloadParts), config('app.key'));
        \Illuminate\Support\Facades\Log::info('QR Verify Debug Extended', [
            'request_data' => $request->all(),
            'payloadParts' => $payloadParts,
            'expectedSignature' => $expectedSignature,
            'receivedSignature' => $request->signature,
            'match' => hash_equals($expectedSignature, $request->signature)
        ]);

        if (!hash_equals($expectedSignature, $request->signature)) {
            return response()->json(['success' => false, 'message' => 'Link presensi tidak valid atau telah dimodifikasi.'], 403);
        }

        if ($normalizedExpiresAt && Carbon::now()->greaterThan(Carbon::parse($normalizedExpiresAt))) {
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
        $type = $request->type;
        $isCheckout = in_array($type, ['out', 'session_out']);

        if ($isCheckout) {
            // Cari log kehadiran terbaru untuk tiket ini pada event ini (apakah bertipe event in atau session_in)
            $attendance = AttendanceLog::where('ticket_id', $ticket->id)
                ->where('event_id', $request->event_id)
                ->whereNotNull('scan_time')
                ->latest('scan_time')
                ->first();

            if (!$attendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Check-out gagal. Anda belum tercatat melakukan Check-in.'
                ], 400);
            }

            if ($attendance->checkout_time) {
                return response()->json([
                    'success' => false,
                    'message' => $type === 'out'
                        ? 'Anda sudah melakukan Check-out sebelumnya.'
                        : 'Anda sudah melakukan Check-out hari ini sebelumnya.'
                ], 400);
            }
        } else {
            $attendance = AttendanceLog::firstOrNew([
                'ticket_id'  => $ticket->id,
                'event_id'   => $request->event_id,
                'session_id' => str_contains($type, 'session') ? $request->session_id : null,
            ]);

            if ($attendance->scan_time) {
                return response()->json([
                    'success' => false,
                    'message' => $type === 'in'
                        ? 'Anda sudah melakukan Check-in'
                        : 'Anda sudah melakukan Check-in untuk sesi ini sebelumnya.'
                ], 400);
            }
        }

        $attendance->user_id = auth()->id();
        $attendance->method = 'online_link';

        if ($request->device_token) {
            $attendance->device_id = $request->device_token;
        }

        if ($isCheckout) {
            $attendance->checkout_time = Carbon::now();
            $msg = $type === 'out' ? 'Check-out berhasil dicatat!' : 'Check-out hari ini berhasil dicatat!';
        } else {
            $attendance->scan_time = Carbon::now();
            $msg = $type === 'in' ? 'Check-in awal berhasil dicatat!' : 'Check-in sesi berhasil dicatat!';
        }

        $attendance->save();

        return response()->json(['success' => true, 'message' => $msg]);
    }
}
