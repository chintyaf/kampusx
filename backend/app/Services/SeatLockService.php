<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventSeat;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Service untuk mengelola Seat-Locking Kuota & Denah Kursi Event.
 * Menggunakan Redis Atomic Operations untuk koordinasi konkuren latensi rendah,
 * serta MySQL untuk integritas durable transaksi dan pencegahan overbooking.
 */
class SeatLockService
{
    /**
     * Waktu hold default: 15 menit (900 detik), configurable melalui config payment.
     */
    public function getHoldTtl(): int
    {
        return config('payment.hold_minutes', 15) * 60;
    }

    /**
     * Mengambil denah kursi suatu event beserta status realtime (AVAILABLE, RESERVED, BOOKED).
     */
    public function getSeats(int $eventId, ?int $userId = null): array
    {
        // 1. Bersihkan reservasi kedaluwarsa secara otomatis
        $this->cleanupExpiredLocks($eventId);

        // 2. Inisialisasi kursi dinamis jika event belum memiliki layout di database
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
            // Sisa waktu hold aktual mengikuti locked_until di server (refresh tidak memperpanjang)
            $remainingSeconds = ($seat->locked_until && $seat->locked_until->isFuture())
                ? (int) max(0, $now->diffInSeconds($seat->locked_until, false))
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
        $reservedCount  = $mapped->where('status', 'RESERVED')->count();
        $bookedCount    = $mapped->where('status', 'BOOKED')->count();

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
     * Mencari nomor kursi yang tersedia secara otomatis jika peserta checkout langsung tanpa memilih kursi spesifik.
     */
    public function findAvailableSeatNumber(int $eventId, int $userId): string
    {
        $this->cleanupExpiredLocks($eventId);

        $seatCount = EventSeat::where('event_id', $eventId)->count();
        if ($seatCount === 0) {
            $this->initializeEventSeats($eventId);
        }

        // 1. Cek apakah user sudah memiliki kursi RESERVED miliknya sendiri yang masih aktif
        $mySeat = EventSeat::where('event_id', $eventId)
            ->where('status', 'RESERVED')
            ->where('locked_by_user_id', $userId)
            ->where('locked_until', '>', Carbon::now())
            ->first();

        if ($mySeat) {
            return $mySeat->seat_number;
        }

        // 2. Ambil kursi AVAILABLE pertama yang tersedia
        $availableSeat = EventSeat::where('event_id', $eventId)
            ->where('status', 'AVAILABLE')
            ->orderBy('seat_number', 'asc')
            ->first();

        return $availableSeat ? $availableSeat->seat_number : 'A1';
    }

    /**
     * Mengunci 1 nomor kursi spesifik menggunakan Redis Atomic SETNX.
     * Refresh halaman TIDAK memperpanjang waktu hold jika user yang sama sudah memiliki lock aktif.
     */
    public function lockSeatNumber(int $eventId, string $seatNumber, int $userId, ?int $ttlSeconds = null): array
    {
        $ttlSeconds = $ttlSeconds ?: $this->getHoldTtl();
        $this->cleanupExpiredLocks($eventId);

        // Pastikan denah kursi sudah terbentuk
        $seatCount = EventSeat::where('event_id', $eventId)->count();
        if ($seatCount === 0) {
            $this->initializeEventSeats($eventId);
        }

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

        // Jika kursi sedang di-lock oleh peserta lain
        if ($seat->status === 'RESERVED' && $seat->locked_by_user_id !== $userId) {
            return [
                'success' => false,
                'status'  => 'reserved',
                'message' => "Kursi {$seatNumber} sedang dikunci oleh peserta lain selama 15 menit.",
            ];
        }

        // Anti-Bypass Waiting List: Jika terdapat antrean aktif, kursi hanya boleh dikunci oleh peserta yang menerima OFFER
        $waitingListService = app(\App\Services\WaitingListService::class);
        if ($waitingListService->hasActiveQueue($eventId)) {
            $isMyActiveOffer = \App\Models\EventWaitlist::where('event_id', $eventId)
                ->where('user_id', $userId)
                ->where('status', \App\Models\EventWaitlist::STATUS_OFFERED)
                ->where('expires_at', '>', Carbon::now())
                ->exists();

            $isMyClaimedHold = \App\Models\EventWaitlist::where('event_id', $eventId)
                ->where('user_id', $userId)
                ->where('status', \App\Models\EventWaitlist::STATUS_CLAIMED)
                ->exists();

            if (!$isMyActiveOffer && !$isMyClaimedHold && $seat->locked_by_user_id !== $userId) {
                return [
                    'success' => false,
                    'status'  => 'queue_reserved',
                    'message' => 'Kursi ini sedang dicadangkan untuk antrean Waiting List. Silakan bergabung ke Waiting List.',
                ];
            }
        }

        // Refresh protection: Jika user yang sama sudah mengunci kursi ini, pertahankan sisa waktu awal
        if ($seat->status === 'RESERVED' && $seat->locked_by_user_id === $userId && $seat->locked_until && $seat->locked_until->isFuture()) {
            $remainingTtl = (int) max(1, Carbon::now()->diffInSeconds($seat->locked_until, false));

            return [
                'success'           => true,
                'status'            => 'RESERVED',
                'is_existing'       => true,
                'message'           => "Kursi {$seatNumber} tetap diamankan untuk Anda (waktu hold berlanjut).",
                'data'              => [
                    'seat_number'       => $seatNumber,
                    'lock_token'        => $seat->lock_token,
                    'expires_at'        => $seat->locked_until->toISOString(),
                    'ttl_seconds'       => $remainingTtl,
                    'driver'            => 'redis',
                ]
            ];
        }

        $lockKey = "seat_lock:event_{$eventId}:seat_{$seatNumber}";
        $lockToken = 'LOCK-' . strtoupper(Str::random(12)) . '-' . time();
        $lockExpiresAt = Carbon::now()->addSeconds($ttlSeconds);

        $lockPayload = json_encode([
            'token'       => $lockToken,
            'user_id'     => $userId,
            'event_id'    => $eventId,
            'seat_number' => $seatNumber,
            'locked_at'   => now()->toISOString(),
            'expires_at'  => $lockExpiresAt->toISOString(),
            'ttl_seconds' => $ttlSeconds,
        ]);

        $acquired = false;
        $driverUsed = 'redis';

        // 1. Eksekusi Redis Atomic SET ... EX {ttl} NX
        try {
            $redis = Redis::connection();
            $setResult = $redis->set($lockKey, $lockPayload, 'EX', $ttlSeconds, 'NX');
            $acquired = ($setResult === true || $setResult === 1 || $setResult === 'OK' || (string)$setResult === 'OK');
        } catch (\Throwable $e) {
            // Fail-safe consistent locking: Jika Redis offline, gunakan atomic MySQL database lock
            $driverUsed = 'database_fallback';
            Log::warning("[SeatLockService] Redis down, menggunakan fail-safe MySQL locking", [
                'event_id'    => $eventId,
                'seat_number' => $seatNumber,
                'error'       => $e->getMessage()
            ]);

            // Di database, periksa apakah kursi masih available via row-lock
            $acquired = DB::transaction(function () use ($eventId, $seatNumber, $userId) {
                $checkSeat = EventSeat::where('event_id', $eventId)
                    ->where('seat_number', $seatNumber)
                    ->lockForUpdate()
                    ->first();

                if ($checkSeat && ($checkSeat->status === 'AVAILABLE' || $checkSeat->locked_by_user_id === $userId)) {
                    return true;
                }
                return false;
            });
        }

        if (!$acquired) {
            return [
                'success' => false,
                'status'  => 'conflict',
                'message' => "Gagal mengunci kursi {$seatNumber}. Kursi baru saja dipilih oleh peserta lain.",
            ];
        }

        // 2. Sinkronkan status RESERVED secara durable ke database MySQL
        $seat->update([
            'status'            => 'RESERVED',
            'locked_by_user_id' => $userId,
            'lock_token'        => $lockToken,
            'locked_until'      => $lockExpiresAt,
        ]);

        return [
            'success'           => true,
            'status'            => 'RESERVED',
            'message'           => "Kursi {$seatNumber} berhasil diamankan selama 15 menit (Redis Atomic Lock aktif).",
            'data'              => [
                'seat_number'       => $seatNumber,
                'lock_token'        => $lockToken,
                'expires_at'        => $lockExpiresAt->toISOString(),
                'ttl_seconds'       => $ttlSeconds,
                'driver'            => $driverUsed,
            ]
        ];
    }

    /**
     * Memvalidasi dan mengunci kuota umum (General Admission) tanpa nomor kursi spesifik.
     * Menjamin: Confirmed quantity + active held quantity <= Capacity.
     */
    public function reserveGeneralQuota(int $eventId, ?int $ticketId, int $userId, int $quantity, ?int $ttlSeconds = null): array
    {
        $ttlSeconds = $ttlSeconds ?: $this->getHoldTtl();
        $lockKey = "quota_lock:event_{$eventId}" . ($ticketId ? ":ticket_{$ticketId}" : '');

        // 1. Koordinasi Redis Atomic Lock untuk mencegah race condition checkout kuota bersamaan
        $acquired = false;
        try {
            $redis = Redis::connection();
            // Ambil lock singkat 5 detik untuk kalkulasi atomik kuota
            $acquired = (bool) $redis->set("mutex:{$lockKey}", $userId, 'EX', 5, 'NX');
        } catch (\Throwable $e) {
            $acquired = true; // Fallback ke DB transaction lockForUpdate
        }

        try {
            return DB::transaction(function () use ($eventId, $ticketId, $quantity, $userId) {
                $eventTicket = $ticketId 
                    ? EventTicket::where('id', $ticketId)->lockForUpdate()->first()
                    : EventTicket::where('event_id', $eventId)->lockForUpdate()->first();

                if ($eventTicket && $eventTicket->capacity !== null) {
                    // Hitung total tiket yang sudah lunas atau sedang aktif di-hold dalam 15 menit
                    $holdCutoff = Carbon::now()->subSeconds($this->getHoldTtl());
                    $soldTickets = DB::table('order_items')
                        ->join('orders', 'order_items.order_id', '=', 'orders.id')
                        ->where('orders.event_id', $eventId)
                        ->where(function ($q) use ($holdCutoff) {
                            $q->where('orders.status', 'paid')
                              ->orWhere(function ($sub) use ($holdCutoff) {
                                  $sub->where('orders.status', 'pending')
                                      ->where('orders.created_at', '>=', $holdCutoff);
                              });
                        })
                        ->sum('order_items.quantity');

                    $available = $eventTicket->capacity - $soldTickets;
                    if ($quantity > $available) {
                        return [
                            'success'   => false,
                            'status'    => 'insufficient_quota',
                            'message'   => 'Kuota tiket tidak mencukupi. Sisa tiket: ' . max(0, $available),
                            'available' => max(0, $available),
                        ];
                    }
                }

                return [
                    'success'     => true,
                    'status'      => 'reserved',
                    'message'     => 'Kuota tiket berhasil diamankan.',
                    'quantity'    => $quantity,
                    'ttl_seconds' => $this->getHoldTtl(),
                ];
            });
        } finally {
            try {
                Redis::connection()->del("mutex:{$lockKey}");
            } catch (\Throwable $e) {}
        }
    }

    /**
     * Membebaskan lock kursi spesifik (kembali AVAILABLE) secara idempotent.
     */
    public function releaseSeatNumber(int $eventId, string $seatNumber, ?int $userId = null): array
    {
        $lockKey = "seat_lock:event_{$eventId}:seat_{$seatNumber}";

        try {
            Redis::connection()->del($lockKey);
        } catch (\Throwable $e) {
            Cache::forget($lockKey);
        }

        $query = EventSeat::where('event_id', $eventId)->where('seat_number', $seatNumber);
        if ($userId) {
            $query->where('locked_by_user_id', $userId);
        }
        $seat = $query->first();

        if ($seat && $seat->status === 'RESERVED') {
            $seat->update([
                'status'            => 'AVAILABLE',
                'locked_by_user_id' => null,
                'lock_token'        => null,
                'locked_until'      => null,
            ]);

            // Trigger hook waiting list
            $this->onReservationReleased($eventId, null, 1, $seatNumber);
        }

        return [
            'success' => true,
            'message' => "Kursi {$seatNumber} berhasil dilepaskan dan kembali tersedia.",
        ];
    }

    /**
     * Mengubah status kursi menjadi BOOKED setelah pembayaran terverifikasi.
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
     * Konfirmasi reservasi berdasarkan Order yang lunas secara atomik.
     */
    public function confirmReservationByOrder(Order $order): void
    {
        // 1. Cek apakah ada nomor kursi spesifik yang di-hold user pada event ini
        $reservedSeats = EventSeat::where('event_id', $order->event_id)
            ->where('locked_by_user_id', $order->user_id)
            ->where('status', 'RESERVED')
            ->get();

        foreach ($reservedSeats as $seat) {
            $this->confirmBooking($order->event_id, $seat->seat_number, $order->user_id);
        }
    }

    /**
     * Pelepasan reservasi terpusat dan idempotent berdasarkan record Order.
     * Menangani pembatalan atau kedaluwarsa kuota dan kursi.
     */
    public function releaseReservationByOrder(Order $order, string $reason = 'expired'): void
    {
        DB::transaction(function () use ($order, $reason) {
            // 1. Lepaskan kursi yang di-hold oleh user ini pada event terkait
            $reservedSeats = EventSeat::where('event_id', $order->event_id)
                ->where('locked_by_user_id', $order->user_id)
                ->where('status', 'RESERVED')
                ->get();

            foreach ($reservedSeats as $seat) {
                $this->releaseSeatNumber($order->event_id, $seat->seat_number, $order->user_id);
            }

            // 2. Tandai tiket dan order sebagai expired/cancelled/failed
            $mappedStatus = in_array($reason, ['expired', 'cancelled', 'failed'], true) ? $reason : 'expired';
            $order->update(['status' => $mappedStatus]);

            $totalQuantityReleased = 0;
            foreach ($order->orderItems as $item) {
                $item->tickets()->where('status', 'pending')->update(['status' => 'cancelled']);
                $totalQuantityReleased += $item->quantity;
            }

            // 3. Panggil hook waiting list untuk kuota umum
            if ($totalQuantityReleased > 0) {
                $this->onReservationReleased($order->event_id, null, $totalQuantityReleased);
            }

            Log::info("[SeatLockService] Reservasi order berhasil dilepaskan", [
                'order_id'          => $order->order_id,
                'reason'            => $reason,
                'quantity_released' => $totalQuantityReleased,
            ]);
        });
    }

    /**
     * Membersihkan seluruh lock kursi dan order yang sudah kedaluwarsa secara otomatis.
     */
    public function cleanupExpiredLocks(?int $eventId = null): int
    {
        $now = Carbon::now();
        $query = EventSeat::where('status', 'RESERVED')
            ->where('locked_until', '<', $now);

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        $expiredSeats = $query->get();
        $releasedCount = 0;

        foreach ($expiredSeats as $seat) {
            $lockKey = "seat_lock:event_{$seat->event_id}:seat_{$seat->seat_number}";
            try {
                Redis::connection()->del($lockKey);
            } catch (\Throwable $e) {}

            $seat->update([
                'status'            => 'AVAILABLE',
                'locked_by_user_id' => null,
                'lock_token'        => null,
                'locked_until'      => null,
            ]);

            $releasedCount++;
            $this->onReservationReleased($seat->event_id, null, 1, $seat->seat_number);
        }

        return $releasedCount;
    }

    /**
     * Integration Hook: Titik integrasi dengan modul Waiting List saat kuota/kursi dilepas.
     */
    protected function onReservationReleased(int $eventId, ?int $ticketId, int $quantity, ?string $freedSeatNumber = null): void
    {
        Log::info("[SeatLockService] Integration Point: Kuota tiket dilepaskan, dispatching offer ke waiting list", [
            'event_id'          => $eventId,
            'ticket_id'         => $ticketId,
            'quantity_released' => $quantity,
            'freed_seat_number' => $freedSeatNumber,
        ]);

        try {
            app(\App\Services\WaitingListService::class)->dispatchNextOffer($eventId, $ticketId, $freedSeatNumber);
        } catch (\Throwable $e) {
            Log::warning("[SeatLockService] Gagal dispatch offer ke waiting list: " . $e->getMessage());
        }
    }

    /**
     * Inisialisasi dinamis denah kursi (Menghilangkan hardcoded 24 kursi).
     * Menggunakan kapasitas tiket dari database secara proporsional.
     */
    public function initializeEventSeats(int $eventId, ?int $capacity = null): void
    {
        if (!$capacity) {
            $eventTicket = EventTicket::where('event_id', $eventId)->first();
            $capacity = $eventTicket?->capacity ?: 32; // Default 32 jika unlimited/tidak diatur
        }

        // Tentukan baris (A, B, C, ...) dengan 8 kursi per baris
        $cols = 8;
        $totalSeats = max(8, min(200, (int) $capacity));
        $rowsNeeded = (int) ceil($totalSeats / $cols);

        $rowLetters = range('A', 'Z');
        $insertData = [];
        $created = 0;

        for ($r = 0; $r < $rowsNeeded; $r++) {
            $rowChar = $rowLetters[$r] ?? ('R' . ($r + 1));
            for ($c = 1; $c <= $cols; $c++) {
                if ($created >= $totalSeats) break;

                $seatNum = "{$rowChar}{$c}";
                $insertData[] = [
                    'event_id'    => $eventId,
                    'seat_number' => $seatNum,
                    'status'      => 'AVAILABLE', // Semua kursi baru mulai dari AVAILABLE
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
                $created++;
            }
        }

        EventSeat::insert($insertData);
    }

    /**
     * Rekonsiliasi data dari MySQL ke Redis jika Redis restart atau key hilang.
     */
    public function reconcileWithRedis(?int $eventId = null): int
    {
        $now = Carbon::now();
        $query = EventSeat::where('status', 'RESERVED')
            ->where('locked_until', '>', $now);

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        $activeSeats = $query->get();
        $reconciled = 0;

        foreach ($activeSeats as $seat) {
            $remainingTtl = (int) max(1, $now->diffInSeconds($seat->locked_until, false));
            $lockKey = "seat_lock:event_{$seat->event_id}:seat_{$seat->seat_number}";

            $lockPayload = json_encode([
                'token'       => $seat->lock_token,
                'user_id'     => $seat->locked_by_user_id,
                'event_id'    => $seat->event_id,
                'seat_number' => $seat->seat_number,
                'expires_at'  => $seat->locked_until->toISOString(),
                'ttl_seconds' => $remainingTtl,
            ]);

            try {
                Redis::connection()->set($lockKey, $lockPayload, 'EX', $remainingTtl);
                $reconciled++;
            } catch (\Throwable $e) {
                Log::warning("[SeatLockService] Gagal merekonsiliasi kursi ke Redis: " . $e->getMessage());
            }
        }

        return $reconciled;
    }
}
