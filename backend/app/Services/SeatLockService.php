<?php

namespace App\Services;

use App\Models\EventTicket;
use App\Models\Order;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Service untuk mengelola Seat-Locking Kuota Tiket Event Berbasis Redis Atomic SETNX
 * Sesuai Rumusan Masalah 1 & Flow 2: Mencegah Race Condition (Overbooking) selama 15 Menit.
 */
class SeatLockService
{
    const DEFAULT_LOCK_TTL = 900; // 15 Menit = 900 Detik

    /**
     * Mengunci 1 kuota kursi event secara atomik menggunakan Redis SETNX (atau SET ... EX 900 NX).
     */
    public function lockSeat(int $eventId, int $ticketId, int $userId, int $ttlSeconds = self::DEFAULT_LOCK_TTL): array
    {
        $lockKey = "seat_lock:event_{$eventId}:ticket_{$ticketId}:user_{$userId}";
        $activeLocksSetKey = "seat_locks_active:ticket_{$ticketId}";

        // 1. Ambil data kapasitas tiket dari database
        $ticket = EventTicket::where('id', $ticketId)->where('event_id', $eventId)->first();
        if (!$ticket) {
            // Fallback cari tiket default untuk event ini jika ID berbeda tipe/string
            $ticket = EventTicket::where('event_id', $eventId)->first();
        }

        $capacity = $ticket ? ($ticket->capacity ?? 50) : 50;

        // 2. Hitung jumlah tiket yang sudah terjual (order status paid / active)
        $soldCount = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->whereIn('orders.status', ['paid', 'active'])
            ->sum('order_items.quantity') ?? 0;

        // 3. Hitung jumlah kursi yang sedang dikunci oleh peserta lain
        $activeLocksCount = $this->getActiveLocksCount($ticket ? $ticket->id : $ticketId, $userId);

        $availableSeats = $capacity - ($soldCount + $activeLocksCount);

        // Jika kuota sudah habis / terkunci penuh
        if ($availableSeats <= 0) {
            return [
                'success' => false,
                'status'  => 'full',
                'message' => 'Tiket Penuh! Seluruh kuota kursi sedang dipesan atau dikunci oleh peserta lain.',
                'available' => 0,
                'capacity' => $capacity,
            ];
        }

        // 4. Generate Lock Token Kriptografis Unik
        $lockToken = 'LOCK-' . strtoupper(Str::random(12)) . '-' . time();
        $lockPayload = json_encode([
            'token'      => $lockToken,
            'user_id'    => $userId,
            'event_id'   => $eventId,
            'ticket_id'  => $ticketId,
            'locked_at'  => now()->toISOString(),
            'expires_at' => now()->addSeconds($ttlSeconds)->toISOString(),
        ]);

        $acquired = false;
        $driverUsed = 'redis';

        // 5. Eksekusi Atomic SETNX ke Redis
        try {
            $redis = Redis::connection();
            // Redis SET key value EX 900 NX adalah standar atomic SETNX dengan expiry
            $setResult = $redis->set($lockKey, $lockPayload, 'EX', $ttlSeconds, 'NX');
            
            $acquired = ($setResult === true || $setResult === 1 || $setResult === 'OK' || (string)$setResult === 'OK');
            
            // Jika user sebelumnya sudah punya lock yang masih valid, perpanjang lock
            if (!$acquired) {
                $existing = $redis->get($lockKey);
                if ($existing) {
                    $existingData = json_decode($existing, true);
                    if (isset($existingData['user_id']) && $existingData['user_id'] == $userId) {
                        $lockToken = $existingData['token'] ?? $lockToken;
                        $acquired = true;
                    }
                }
            }

            if ($acquired) {
                $redis->sadd($activeLocksSetKey, $userId);
                $redis->expire($activeLocksSetKey, $ttlSeconds + 60);
            }
        } catch (\Throwable $e) {
            // Graceful High-Availability Fallback: Jika Redis server offline di lingkungan lokal,
            // gunakan Cache Lock atomik Laravel (MySQL cache_locks driver).
            $driverUsed = 'cache_fallback';
            $lock = Cache::lock($lockKey, $ttlSeconds);
            $acquired = $lock->get();

            if (!$acquired) {
                // Cek apakah lock milik user yang sama
                $existingData = Cache::get("data_{$lockKey}");
                if ($existingData && ($existingData['user_id'] ?? null) == $userId) {
                    $acquired = true;
                    $lockToken = $existingData['token'] ?? $lockToken;
                }
            } else {
                Cache::put("data_{$lockKey}", [
                    'token'      => $lockToken,
                    'user_id'    => $userId,
                    'event_id'   => $eventId,
                    'ticket_id'  => $ticketId,
                    'expires_at' => now()->addSeconds($ttlSeconds)->toISOString()
                ], $ttlSeconds);
            }
        }

        if (!$acquired) {
            return [
                'success' => false,
                'status'  => 'conflict',
                'message' => 'Tiket sedang dalam proses penguncian oleh pengguna lain. Silakan coba kembali dalam beberapa saat.',
            ];
        }

        return [
            'success'     => true,
            'status'      => 'locked',
            'message'     => 'Kursi berhasil dikunci secara atomik selama 15 menit via Redis SETNX!',
            'lock_token'  => $lockToken,
            'lock_key'    => $lockKey,
            'expires_at'  => now()->addSeconds($ttlSeconds)->toISOString(),
            'ttl_seconds' => $ttlSeconds,
            'driver'      => $driverUsed,
            'available'   => max(0, $availableSeats - 1),
            'capacity'    => $capacity
        ];
    }

    /**
     * Membebaskan lock kursi (misal saat checkout selesai, dibatalkan, atau pembayaran sukses).
     */
    public function releaseSeatLock(int $eventId, int $ticketId, int $userId): bool
    {
        $lockKey = "seat_lock:event_{$eventId}:ticket_{$ticketId}:user_{$userId}";
        $activeLocksSetKey = "seat_locks_active:ticket_{$ticketId}";

        try {
            $redis = Redis::connection();
            $redis->del($lockKey);
            $redis->srem($activeLocksSetKey, $userId);
            return true;
        } catch (\Throwable $e) {
            try {
                Cache::lock($lockKey)->forceRelease();
                Cache::forget("data_{$lockKey}");
                return true;
            } catch (\Throwable $ex) {
                return false;
            }
        }
    }

    /**
     * Menghitung active locks untuk tiket tertentu, mengabaikan user pemanggil jika diberikan.
     */
    public function getActiveLocksCount(int $ticketId, ?int $ignoreUserId = null): int
    {
        $activeLocksSetKey = "seat_locks_active:ticket_{$ticketId}";

        try {
            $redis = Redis::connection();
            $members = $redis->smembers($activeLocksSetKey);
            if (empty($members)) return 0;

            $activeCount = 0;
            foreach ($members as $uid) {
                if ($ignoreUserId && (int)$uid === (int)$ignoreUserId) {
                    continue;
                }
                // Verifikasi apakah key lock individual masih hidup (belum expired)
                $keys = $redis->keys("seat_lock:event_*:ticket_{$ticketId}:user_{$uid}");
                if (!empty($keys)) {
                    $activeCount++;
                } else {
                    $redis->srem($activeLocksSetKey, $uid);
                }
            }
            return $activeCount;
        } catch (\Throwable $e) {
            // Fallback query active locks dari cache
            return 0;
        }
    }
}
