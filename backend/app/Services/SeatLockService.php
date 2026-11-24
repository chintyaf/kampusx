<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventSeat;
use App\Models\EventTicket;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Service untuk mengelola Seat-Locking Kuota & Denah Kursi Event Berbasis Redis Atomic SETNX.
 * Mencegah Race Condition (Overbooking) selama 15 Menit.
 * Sesuai Bagian 6 Tugas Akhir.
 */
class SeatLockService
{
    public const DEFAULT_LOCK_TTL = 900; // 15 Menit = 900 Detik

    /**
     * Mengambil denah kursi suatu event beserta status realtime (AVAILABLE, RESERVED, BOOKED)
     */
    public function getSeats(int $eventId, ?int $userId = null): array
    {
        // 1. Bersihkan reservasi kedaluwarsa terlebih dahulu
        $this->cleanupExpiredLocks($eventId);

        // 2. Pastikan kursi di-generate jika belum tersedia (Default 24 kursi: Baris A, B, C)
        $seatCount = EventSeat::where('event_id', $eventId)->count();
        if ($seatCount === 0) {
            $this->initializeEventSeats($eventId);
        }

        $seats = EventSeat::where('event_id', $eventId)
            ->orderBy('seat_number', 'asc')
            ->get();

        $now = Carbon::now();

        $mapped = $seats->map(function ($seat) use ($userId, $now) {
            $isMine = ($userId && $seat->locked_by_user_id === $userId);
            $remainingSeconds = ($seat->locked_until && $seat->locked_until->isFuture())
                ? $now->diffInSeconds($seat->locked_until)
                : 0;

            return [
                'id'                => $seat->id,
                'seat_number'       => $seat->seat_number,
                'status'            => $seat->status, // AVAILABLE, RESERVED, BOOKED
                'is_mine'           => $isMine,
                'locked_until'      => $seat->locked_until ? $seat->locked_until->toISOString() : null,
                'remaining_seconds' => $remainingSeconds,
            ];
        });

        $availableCount = $mapped->where('status', 'AVAILABLE')->count();
        $reservedCount = $mapped->where('status', 'RESERVED')->count();
        $bookedCount = $mapped->where('status', 'BOOKED')->count();

        return [
            'event_id'        => $eventId,
            'total_seats'     => $mapped->count(),
            'available_count' => $availableCount,
            'reserved_count'  => $reservedCount,
            'booked_count'    => $bookedCount,
            'seats'           => $mapped->values(),
        ];
    }

    /**
     * Mengunci 1 nomor kursi spesifik menggunakan Redis Atomic SETNX
     */
    public function lockSeatNumber(int $eventId, string $seatNumber, int $userId, int $ttlSeconds = self::DEFAULT_LOCK_TTL): array
    {
        $this->cleanupExpiredLocks($eventId);

        $seat = EventSeat::where('event_id', $eventId)
            ->where('seat_number', $seatNumber)
            ->first();

        if (!$seat) {
            return [
                'success' => false,
                'status'  => 'not_found',
                'message' => "Kursi {$seatNumber} tidak ditemukan pada event ini.",
            ];
        }

        if ($seat->status === 'BOOKED') {
            return [
                'success' => false,
                'status'  => 'booked',
                'message' => "Kursi {$seatNumber} sudah dibeli (BOOKED) oleh peserta lain.",
            ];
        }

        if ($seat->status === 'RESERVED' && $seat->locked_by_user_id !== $userId) {
            return [
                'success' => false,
                'status'  => 'reserved',
                'message' => "Kursi {$seatNumber} sedang dikunci oleh peserta lain selama 15 menit.",
            ];
        }

        $lockKey = "seat_lock:event_{$eventId}:seat_{$seatNumber}";
        $lockToken = 'LOCK-' . strtoupper(Str::random(12)) . '-' . time();
        $lockPayload = json_encode([
            'token'       => $lockToken,
            'user_id'     => $userId,
            'event_id'    => $eventId,
            'seat_number' => $seatNumber,
            'locked_at'   => now()->toISOString(),
            'expires_at'  => now()->addSeconds($ttlSeconds)->toISOString(),
        ]);

        $acquired = false;
        $driverUsed = 'redis';

        // 1. Coba eksekusi Redis Atomic SET ... EX 900 NX
        try {
            $redis = Redis::connection();
            $setResult = $redis->set($lockKey, $lockPayload, 'EX', $ttlSeconds, 'NX');
            $acquired = ($setResult === true || $setResult === 1 || $setResult === 'OK' || (string)$setResult === 'OK');

            // Jika user sebelumnya sudah punya lock yang sama, perpanjang
            if (!$acquired) {
                $existing = $redis->get($lockKey);
                if ($existing) {
                    $existingData = json_decode($existing, true);
                    if (isset($existingData['user_id']) && $existingData['user_id'] == $userId) {
                        $acquired = true;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Graceful High-Availability Fallback ke Laravel Cache Atomic Lock
            $driverUsed = 'cache_fallback';
            $lock = Cache::lock($lockKey, $ttlSeconds);
            $acquired = $lock->get();
        }

        if (!$acquired) {
            return [
                'success' => false,
                'status'  => 'conflict',
                'message' => "Gagal mengunci kursi {$seatNumber}. Kursi baru saja dipilih oleh peserta lain.",
            ];
        }

        // 2. Sinkronkan status RESERVED ke database MySQL
        $seat->update([
            'status'            => 'RESERVED',
            'locked_by_user_id' => $userId,
            'lock_token'        => $lockToken,
            'locked_until'      => Carbon::now()->addSeconds($ttlSeconds),
        ]);

        return [
            'success'           => true,
            'status'            => 'RESERVED',
            'message'           => "Kursi {$seatNumber} berhasil diamankan selama 15 menit (Redis Atomic Lock aktif).",
            'data'              => [
                'seat_number'       => $seatNumber,
                'lock_token'        => $lockToken,
                'expires_at'        => Carbon::now()->addSeconds($ttlSeconds)->toISOString(),
                'ttl_seconds'       => $ttlSeconds,
                'driver'            => $driverUsed,
            ]
        ];
    }

    /**
     * Membebaskan lock kursi (kembali AVAILABLE)
     */
    public function releaseSeatNumber(int $eventId, string $seatNumber, int $userId): array
    {
        $lockKey = "seat_lock:event_{$eventId}:seat_{$seatNumber}";

        try {
            Redis::connection()->del($lockKey);
        } catch (\Throwable $e) {
            Cache::forget($lockKey);
        }

        $seat = EventSeat::where('event_id', $eventId)
            ->where('seat_number', $seatNumber)
            ->where('locked_by_user_id', $userId)
            ->first();

        if ($seat && $seat->status === 'RESERVED') {
            $seat->update([
                'status'            => 'AVAILABLE',
                'locked_by_user_id' => null,
                'lock_token'        => null,
                'locked_until'      => null,
            ]);
        }

        return [
            'success' => true,
            'message' => "Kursi {$seatNumber} berhasil dilepaskan dan kembali tersedia.",
        ];
    }

    /**
     * Mengubah status kursi menjadi BOOKED setelah pembayaran terverifikasi
     */
    public function confirmBooking(int $eventId, string $seatNumber, int $userId): array
    {
        $lockKey = "seat_lock:event_{$eventId}:seat_{$seatNumber}";

        try {
            Redis::connection()->del($lockKey);
        } catch (\Throwable $e) {
            Cache::forget($lockKey);
        }

        $seat = EventSeat::where('event_id', $eventId)
            ->where('seat_number', $seatNumber)
            ->first();

        if ($seat) {
            $seat->update([
                'status'            => 'BOOKED',
                'locked_by_user_id' => $userId,
                'lock_token'        => null,
                'locked_until'      => null,
            ]);
        }

        return [
            'success' => true,
            'status'  => 'BOOKED',
            'message' => "Kursi {$seatNumber} resmi terbeli (BOOKED).",
            'seat'    => $seat,
        ];
    }

    /**
     * Membersihkan lock yang sudah kedaluwarsa secara otomatis
     */
    protected function cleanupExpiredLocks(int $eventId): void
    {
        EventSeat::where('event_id', $eventId)
            ->where('status', 'RESERVED')
            ->where('locked_until', '<', Carbon::now())
            ->update([
                'status'            => 'AVAILABLE',
                'locked_by_user_id' => null,
                'lock_token'        => null,
                'locked_until'      => null,
            ]);
    }

    /**
     * Inisialisasi awal 24 kursi default untuk event baru (Baris A1-A8, B1-B8, C1-C8)
     */
    protected function initializeEventSeats(int $eventId): void
    {
        $rows = ['A', 'B', 'C'];
        $cols = 8;
        $insertData = [];

        foreach ($rows as $r) {
            for ($c = 1; $c <= $cols; $c++) {
                $seatNum = "{$r}{$c}";
                $insertData[] = [
                    'event_id'    => $eventId,
                    'seat_number' => $seatNum,
                    'status'      => ($seatNum === 'A1' || $seatNum === 'A2') ? 'BOOKED' : 'AVAILABLE',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }
        }

        EventSeat::insert($insertData);
    }
}
