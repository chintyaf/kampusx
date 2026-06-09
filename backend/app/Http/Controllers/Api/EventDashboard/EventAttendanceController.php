<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\AttendanceLog;
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
        } while (\App\Models\AttendanceLink::where('code', $code)->exists());

        \App\Models\AttendanceLink::updateOrCreate(
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
        $link = \App\Models\AttendanceLink::where('code', $code)->firstOrFail();

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

    public function processAttendance(Request $request){
        // 1. Validasi format input dari frontend React
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'type' => 'required|in:in,out,session_in,session_out',
            'session_id' => 'required_if:type,session_in,session_out|exists:event_sessions,id',
            'signature' => 'required|string',
            'device_token' => 'required|string', // Berasal dari localStorage peserta
            'expires_at' => 'nullable|date',
        ]);

        $eventId = $request->event_id;
        $type = $request->type;
        $sessionId = $request->session_id;
        $expiresAt = $request->expires_at;
        $signature = $request->signature;
        $deviceToken = $request->device_token;

        // Asumsi peserta harus login untuk bisa absen
        $userId = auth()->id();

        // ---------------------------------------------------------
        // LAYER 1: Verifikasi Integritas Link (Anti-Edit URL)
        // ---------------------------------------------------------
        if ($type === 'session_in' || $type === 'session_out') {
            $payload = $eventId . '|' . $type . '|' . $sessionId . '|' . $expiresAt;
        } else {
            $payload = $eventId . '|' . $type . '|' . $expiresAt;
        }
        $expectedSignature = hash_hmac('sha256', $payload, config('app.key'));

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'success' => false,
                'message' => 'Link presensi tidak valid atau telah dimodifikasi.'
            ], 403);
        }

        // ---------------------------------------------------------
        // LAYER 2: Verifikasi Waktu Kedaluwarsa
        // ---------------------------------------------------------
        if ($expiresAt && Carbon::now()->greaterThan(Carbon::parse($expiresAt))) {
            return response()->json([
                'success' => false,
                'message' => 'Waktu akses untuk link presensi ini sudah berakhir.'
            ], 403);
        }

        // ---------------------------------------------------------
        // LAYER 3: Verifikasi Status Peserta (via Ticket)
        // ---------------------------------------------------------
        $ticket = Ticket::where('participant_id', $userId)
            ->where('status', 'active')
            ->whereHas('orderItem.order', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar sebagai peserta dalam acara ini atau tiket Anda tidak aktif.'
            ], 403);
        }

        // ---------------------------------------------------------
        // LAYER 4 & 5: Verifikasi Device Lock & Pencatatan Kehadiran
        // ---------------------------------------------------------
        if ($type === 'in') {
            $attendance = AttendanceLog::firstOrNew([
                'ticket_id' => $ticket->id,
                'event_id'  => $eventId,
                'session_id' => null,
            ]);

            $attendance->user_id = $userId;

            if (is_null($attendance->device_id)) {
                $attendance->device_id = $deviceToken;
            } elseif ($attendance->device_id !== $deviceToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Presensi ditolak. Anda harus menggunakan perangkat (HP/Laptop) yang sama dengan saat pertama kali Check-in.'
                ], 403);
            }

            if ($attendance->scan_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan Check-in masuk pas awal sebelumnya.'
                ], 400);
            }

            $attendance->scan_time = Carbon::now();
            $attendance->method = 'online_link';
            $attendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Check-in awal berhasil dicatat!'
            ]);

        } elseif ($type === 'session_in') {
            // Pastikan sudah melakukan check-in awal (bisa check-in event global, atau check-in sesi pertama di hari yang sama)
            $session = \App\Models\EventSession::findOrFail($sessionId);
            $sessionIdsOnSameDay = \App\Models\EventSession::where('event_id', $eventId)
                ->where('day_number', $session->day_number)
                ->pluck('id');

            $initialAttendance = AttendanceLog::where('ticket_id', $ticket->id)
                ->where('event_id', $eventId)
                ->where(function ($query) use ($sessionIdsOnSameDay) {
                    $query->whereNull('session_id')
                          ->orWhereIn('session_id', $sessionIdsOnSameDay);
                })
                ->whereNotNull('scan_time')
                ->first();

            if (!$initialAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum melakukan Check-in masuk. Silakan lakukan Check-in masuk terlebih dahulu.'
                ], 400);
            }

            // Pastikan device sesuai
            if ($initialAttendance->device_id !== $deviceToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Presensi ditolak. Anda harus menggunakan perangkat (HP/Laptop) yang sama dengan saat pertama kali Check-in.'
                ], 403);
            }

            $attendance = AttendanceLog::firstOrNew([
                'ticket_id' => $ticket->id,
                'event_id'  => $eventId,
                'session_id' => $sessionId,
            ]);

            $attendance->user_id = $userId;

            if ($attendance->scan_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan Check-in untuk sesi ini sebelumnya.'
                ], 400);
            }

            $attendance->device_id = $deviceToken;
            $attendance->scan_time = Carbon::now();
            $attendance->method = 'online_link';
            $attendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Check-in sesi berhasil dicatat!'
            ]);

        } elseif ($type === 'session_out') {
            $session = \App\Models\EventSession::findOrFail($sessionId);

            // Find all sessions on the same day
            $sessionIdsOnSameDay = \App\Models\EventSession::where('event_id', $eventId)
                ->where('day_number', $session->day_number)
                ->pluck('id');

            // Find checkin log on any of the sessions on the same day for this ticket/user
            $initialAttendance = AttendanceLog::where('ticket_id', $ticket->id)
                ->where('event_id', $eventId)
                ->whereIn('session_id', $sessionIdsOnSameDay)
                ->whereNotNull('scan_time')
                ->first();

            if (!$initialAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum melakukan Check-in masuk hari ini. Silakan lakukan Check-in masuk terlebih dahulu.'
                ], 400);
            }

            // Pastikan device sesuai
            if (is_null($initialAttendance->device_id)) {
                $initialAttendance->device_id = $deviceToken;
            } elseif ($initialAttendance->device_id !== $deviceToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Presensi ditolak. Anda harus menggunakan perangkat (HP/Laptop) yang sama dengan saat pertama kali Check-in.'
                ], 403);
            }

            if ($initialAttendance->checkout_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan Check-out hari ini sebelumnya.'
                ], 400);
            }

            $initialAttendance->checkout_time = Carbon::now();
            $initialAttendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Check-out hari ini berhasil dicatat!'
            ]);

        } else { // type === 'out' (global event checkout)
            // Pastikan sudah melakukan check-in awal
            $initialAttendance = AttendanceLog::where('ticket_id', $ticket->id)
                ->where('event_id', $eventId)
                ->whereNull('session_id')
                ->whereNotNull('scan_time')
                ->first();

            if (!$initialAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum melakukan Check-in masuk pas awal. Silakan lakukan Check-in masuk terlebih dahulu.'
                ], 400);
            }

            // Pastikan device sesuai
            if (is_null($initialAttendance->device_id)) {
                $initialAttendance->device_id = $deviceToken;
            } elseif ($initialAttendance->device_id !== $deviceToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Presensi ditolak. Anda harus menggunakan perangkat (HP/Laptop) yang sama dengan saat pertama kali Check-in.'
                ], 403);
            }

            if ($initialAttendance->checkout_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan Check-out sebelumnya.'
                ], 400);
            }

            $initialAttendance->checkout_time = Carbon::now();
            $initialAttendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil dicatat!'
            ]);
        }
    }

}
