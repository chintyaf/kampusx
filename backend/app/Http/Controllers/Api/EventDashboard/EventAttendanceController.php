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

        return response()->json([
            'success' => true,
            'data' => [
                'checkin_link' => $event->checkin_link,
                'checkin_expires_at' => $event->checkin_expires_at,
                'checkout_link' => $event->checkout_link,
                'checkout_expires_at' => $event->checkout_expires_at,
            ]
        ]);
    }

    public function generateLink(Request $request, $eventId)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'type' => 'required|in:in,out',
            'expires_at' => 'nullable|date'
        ]);

        // 2. Pastikan event ada (otomatis mengembalikan error 404 jika tidak ketemu)
        $event = Event::findOrFail($eventId);

        $type = $request->type;
        $expiresAt = $request->expires_at; // Format: YYYY-MM-DD HH:mm:ss

        // 3. Membuat payload unik. Gunakan pemisah '|' agar aman
        $payload = $event->id . '|' . $type . '|' . $expiresAt;

        // 4. Membuat signature HMAC SHA256 menggunakan APP_KEY bawaan Laravel
        // * Ini yang bikin peserta tidak bisa mengedit QR code untuk membuat link palsu
        $signature = hash_hmac('sha256', $payload, config('app.key'));

        // 5. Merakit URL Final di Backend
        // Mengambil base URL React dari .env (default ke localhost jika belum disetting)
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $finalUrl = "{$frontendUrl}/attend-venue?event_id={$event->id}&type={$type}&signature={$signature}";

        if ($expiresAt) {
            $finalUrl .= "&expires_at={$expiresAt}";
        }

        // 6. Menyimpan URL dan Waktu Kedaluwarsa ke Database
        // Menggunakan properti assignment langsung untuk menghindari isu $fillable
        if ($type === 'in') {
            $event->checkin_link = $finalUrl;
            $event->checkin_expires_at = $expiresAt;
        } else {
            $event->checkout_link = $finalUrl;
            $event->checkout_expires_at = $expiresAt;
        }
        $event->save();

        // 7. Kembalikan response JSON yang menyertakan URL yang sudah jadi
        return response()->json([
            'success' => true,
            'message' => 'Link berhasil dibuat dan disimpan.',
            'data' => [
                'event_id' => $event->id,
                'type' => $type,
                'expires_at' => $expiresAt,
                'signature' => $signature,
                'url' => $finalUrl // React sekarang cukup membaca URL dari properti ini
            ]
        ]);
    }

    public function processAttendance(Request $request){
        // 1. Validasi format input dari frontend React
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'type' => 'required|in:in,out',
            'signature' => 'required|string',
            'device_token' => 'required|string', // Berasal dari localStorage peserta
            'expires_at' => 'nullable|date',
        ]);

        $eventId = $request->event_id;
        $type = $request->type;
        $expiresAt = $request->expires_at;
        $signature = $request->signature;
        $deviceToken = $request->device_token;

        // Asumsi peserta harus login untuk bisa absen
        $userId = auth()->id();

        // ---------------------------------------------------------
        // LAYER 1: Verifikasi Integritas Link (Anti-Edit URL)
        // ---------------------------------------------------------
        $payload = $eventId . '|' . $type . '|' . $expiresAt;
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
        // Yang menentukan peserta terdaftar di event adalah kepemilikan Ticket aktif,
        // bukan AttendanceLog (yang hanya berisi catatan kehadiran).
        // Alur relasi: tickets -> order_items -> orders (event_id)
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

        // Setelah tiket ditemukan, cari atau buat AttendanceLog berdasarkan ticket_id.
        // firstOrNew: jika belum ada log untuk tiket ini, buat objek baru (belum disimpan ke DB).
        $attendance = AttendanceLog::firstOrNew([
            'ticket_id' => $ticket->id,
            'event_id'  => $eventId,
        ]);

        // Pastikan user_id tersimpan pada log (berguna untuk query langsung)
        $attendance->user_id = $userId;

        // ---------------------------------------------------------
        // LAYER 4: Verifikasi Device Lock (Anti-Titip Absen)
        // ---------------------------------------------------------
        if (is_null($attendance->device_id)) {
            // Jika kosong, ini adalah pertama kali peserta absen. Kunci perangkatnya!
            $attendance->device_id = $deviceToken;
        } elseif ($attendance->device_id !== $deviceToken) {
            // Jika sudah ada isinya tapi tidak cocok dengan token yang dikirim
            return response()->json([
                'success' => false,
                'message' => 'Presensi ditolak. Anda harus menggunakan perangkat (HP/Laptop) yang sama dengan saat pertama kali Check-in.'
            ], 403);
        }

        // ---------------------------------------------------------
        // LAYER 5: Pencatatan Kehadiran
        // ---------------------------------------------------------
        if ($type === 'in') {
            if ($attendance->scan_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan Check-in sebelumnya.'
                ], 400);
            }
            $attendance->scan_time = Carbon::now();
            $attendance->method = 'online_link';
        } else { // type === 'out'
            if (!$attendance->scan_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum melakukan Check-in. Silakan Check-in terlebih dahulu.'
                ], 400);
            }

            if ($attendance->checkout_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan Check-out sebelumnya.'
                ], 400);
            }
            $attendance->checkout_time = Carbon::now();
        }

        // Simpan semua perubahan (waktu presensi & device_id baru jika ada)
        $attendance->save();

        return response()->json([
            'success' => true,
            'message' => $type === 'in' ? 'Check-in berhasil dicatat!' : 'Check-out berhasil dicatat!'
        ]);
    }

}
