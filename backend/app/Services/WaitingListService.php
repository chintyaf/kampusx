<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventSeat;
use App\Models\EventTicket;
use App\Models\EventWaitlist;
use App\Models\Order;
use App\Models\User;
use App\Notifications\OperationalNotification;
use App\Services\Payment\Enums\PaymentStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Service Waiting List dengan Algoritma FIFO Queue Terintegrasi.
 * Bertanggung jawab atas:
 * 1. Pendaftaran antrean saat kapasitas/kursi penuh.
 * 2. Exclusive offer dispatching saat kuota dilepaskan.
 * 3. Pencegahan queue bypass (pengguna luar tidak boleh mendahului antrean).
 * 4. Perhitungan Estimasi Waktu Tunggu Dinamis (ETA).
 * 5. Penanganan offer expiration dan transisi ke checkout hold.
 */
class WaitingListService
{
    /**
     * Durasi offer default: 3 menit (configurable via event setting atau config).
     */
    public function getOfferTtl(?int $eventId = null): int
    {
        $customTtl = $eventId ? \Illuminate\Support\Facades\Cache::get("event_{$eventId}:offer_ttl_minutes") : null;
        $minutes = $customTtl ?: config('waitlist.offer_ttl_minutes', 3);
        return (int) ($minutes * 60);
    }

    /**
     * Memeriksa apakah terdapat antrean aktif pada suatu event / tiket.
     */
    public function hasActiveQueue(int $eventId, ?int $ticketId = null): bool
    {
        return EventWaitlist::where('event_id', $eventId)
            ->when($ticketId, fn($q) => $q->where('event_ticket_id', $ticketId))
            ->whereIn('status', [EventWaitlist::STATUS_WAITING, EventWaitlist::STATUS_OFFERED])
            ->exists();
    }

    /**
     * Memeriksa apakah kapasitas tiket sedang penuh atau seluruh kuota tersisa sedang di-hold.
     */
    public function isCapacityFullOrHeld(int $eventId, ?int $ticketId = null): bool
    {
        $eventTicket = $ticketId
            ? EventTicket::where('id', $ticketId)->first()
            : EventTicket::where('event_id', $eventId)->first();

        // Jika event tidak memiliki batas kapasitas (unlimited), maka tidak perlu waiting list
        if (!$eventTicket || $eventTicket->capacity === null) {
            return false;
        }

        $holdMinutes = config('payment.hold_minutes', 15);
        $holdCutoff = Carbon::now()->subMinutes($holdMinutes);

        // 1. Hitung pesanan lunas
        $paidTickets = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->where('orders.status', PaymentStatus::PAID)
            ->sum('order_items.quantity');

        // 2. Hitung pesanan pending yang masih aktif di-hold dalam 15 menit
        $heldTickets = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->where('orders.status', PaymentStatus::PENDING)
            ->where('orders.created_at', '>=', $holdCutoff)
            ->sum('order_items.quantity');

        // 3. Hitung tiket yang sedang dalam penawaran eksklusif (OFFERED)
        $offeredTickets = EventWaitlist::where('event_id', $eventId)
            ->when($ticketId, fn($q) => $q->where('event_ticket_id', $ticketId))
            ->where('status', EventWaitlist::STATUS_OFFERED)
            ->where('expires_at', '>', Carbon::now())
            ->sum('quantity');

        // 4. Hitung kursi yang sedang aktif di-lock (RESERVED) atau BOOKED di event_seats
        $heldSeats = EventSeat::where('event_id', $eventId)
            ->where('status', 'RESERVED')
            ->where('locked_until', '>', Carbon::now())
            ->count();

        $bookedSeats = EventSeat::where('event_id', $eventId)
            ->where('status', 'BOOKED')
            ->count();

        $seatCommitted = $heldSeats + $bookedSeats;
        $orderCommitted = $paidTickets + $heldTickets;

        $totalCommitted = max($seatCommitted, $orderCommitted) + $offeredTickets;

        return $totalCommitted >= $eventTicket->capacity;
    }

    /**
     * Mendaftarkan pengguna ke dalam Waiting List FIFO Queue.
     */
    public function join(User $user, int $eventId, ?int $ticketId = null): array
    {
        $event = Event::findOrFail($eventId);

        // 1. Validasi status event: pendaftaran harus belum ditutup
        if (in_array($event->status, ['cancelled', 'completed', 'finished'], true)) {
            return [
                'success' => false,
                'status'  => 'event_closed',
                'message' => 'Pendaftaran untuk event ini telah berakhir atau dibatalkan.',
            ];
        }

        if ($event->end_date && Carbon::parse($event->end_date)->isPast()) {
            return [
                'success' => false,
                'status'  => 'event_closed',
                'message' => 'Event telah selesai. Waiting list tidak lagi menerima antrean.',
            ];
        }

        return DB::transaction(function () use ($user, $event, $ticketId) {
            // 2. Cegah Duplicate Active Entry: 1 pengguna hanya boleh memiliki 1 antrean aktif
            $existingActive = EventWaitlist::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->when($ticketId, fn($q) => $q->where('event_ticket_id', $ticketId))
                ->whereIn('status', [EventWaitlist::STATUS_WAITING, EventWaitlist::STATUS_OFFERED])
                ->lockForUpdate()
                ->first();

            if ($existingActive) {
                $position = $this->calculatePosition($existingActive);
                return [
                    'success'  => false,
                    'status'   => 'already_queued',
                    'message'  => "Anda sudah terdaftar dalam antrean aktif event ini pada posisi #{$position}.",
                    'data'     => [
                        'waitlist_id'    => $existingActive->id,
                        'queue_number'   => $existingActive->queue_number,
                        'position'       => $position,
                        'status'         => $existingActive->status,
                    ]
                ];
            }

            // 3. Validasi Kondisi: Hanya boleh antre jika kuota memang sedang penuh / di-hold
            if (!$this->isCapacityFullOrHeld($event->id, $ticketId)) {
                return [
                    'success' => false,
                    'status'  => 'capacity_available',
                    'message' => 'Kapasitas tiket saat ini masih tersedia. Silakan lanjutkan pemesanan tiket langsung.',
                ];
            }

            // 4. Tentukan nomor antrean FIFO berikutnya secara berurutan
            $maxQueueNumber = EventWaitlist::where('event_id', $event->id)
                ->lockForUpdate()
                ->max('queue_number') ?? 0;

            $queueNumber = $maxQueueNumber + 1;

            // 5. Hitung Estimasi Waktu Tunggu Dinamis (ETA)
            $etaSeconds = $this->calculateEstimatedWaitTime($event->id, $queueNumber, $ticketId);

            // 6. Buat record antrean baru berstatus WAITING
            $waitlist = EventWaitlist::create([
                'user_id'                => $user->id,
                'event_id'               => $event->id,
                'event_ticket_id'        => $ticketId,
                'quantity'               => 1, // Scope v1: 1 tiket per antrean demi fairness
                'queue_number'           => $queueNumber,
                'status'                 => EventWaitlist::STATUS_WAITING,
                'estimated_wait_seconds' => $etaSeconds,
            ]);

            // Hitung posisi antrean saat ini
            $position = $this->calculatePosition($waitlist);

            // Kirim notifikasi in-app
            $user->notify(new OperationalNotification(
                "Masuk Waiting List: {$event->title}",
                "Anda berhasil masuk antrean tiket pada posisi #{$position}. Kami akan mengirim penawaran eksklusif saat kuota tersedia.",
                "waitlist_joined",
                ['event_id' => $event->id, 'queue_number' => $queueNumber]
            ));

            Log::info("[WaitingListService] User #{$user->id} bergabung ke antrean event #{$event->id}", [
                'queue_number' => $queueNumber,
                'position'     => $position,
                'eta_seconds'  => $etaSeconds,
            ]);

            return [
                'success' => true,
                'status'  => 'WAITING',
                'message' => "Berhasil bergabung dengan antrean Waiting List! Posisi Anda saat ini: #{$position}.",
                'data'    => [
                    'waitlist_id'            => $waitlist->id,
                    'status'                 => 'WAITING',
                    'queue_number'           => $waitlist->queue_number,
                    'position'               => $position,
                    'estimated_wait_seconds' => $etaSeconds,
                    'estimated_wait_text'    => $this->formatEtaText($etaSeconds),
                    'created_at'             => $waitlist->created_at->toISOString(),
                ]
            ];
        });
    }

    /**
     * Mengambil status antrean terkini dari peserta.
     */
    public function getMyStatus(User $user, int $eventId): array
    {
        $entry = EventWaitlist::where('event_id', $eventId)
            ->where('user_id', $user->id)
            ->whereIn('status', [EventWaitlist::STATUS_WAITING, EventWaitlist::STATUS_OFFERED])
            ->first();

        if (!$entry) {
            return [
                'in_queue' => false,
                'message'  => 'Anda tidak sedang berada dalam antrean event ini.',
            ];
        }

        // Jika offer telah melewati waktu kadaluwarsa, jalankan auto-expire
        if ($entry->isOffered() && $entry->hasOfferExpired()) {
            $this->expireSingleOffer($entry);
            return [
                'in_queue' => false,
                'status'   => 'EXPIRED',
                'message'  => 'Batas waktu penawaran Anda telah habis.',
            ];
        }

        $position = $this->calculatePosition($entry);
        $etaSeconds = $entry->isWaiting()
            ? $this->calculateEstimatedWaitTime($eventId, $entry->queue_number, $entry->event_ticket_id)
            : 0;

        $now = Carbon::now();
        $remainingOfferSeconds = ($entry->isOffered() && $entry->expires_at && $entry->expires_at->isFuture())
            ? (int) max(0, $now->diffInSeconds($entry->expires_at, false))
            : 0;

        return [
            'in_queue'                => true,
            'waitlist_id'             => $entry->id,
            'status'                  => $entry->status,
            'queue_number'            => $entry->queue_number,
            'position'                => $position,
            'seat_number'             => $entry->seat_number,
            'offer_token'             => $entry->offer_token,
            'offered_at'              => $entry->offered_at ? $entry->offered_at->toISOString() : null,
            'expires_at'              => $entry->expires_at ? $entry->expires_at->toISOString() : null,
            'remaining_offer_seconds' => $remainingOfferSeconds,
            'estimated_wait_seconds'  => $etaSeconds,
            'estimated_wait_text'     => $this->formatEtaText($etaSeconds),
            'can_claim'               => ($entry->isOffered() && $remainingOfferSeconds > 0),
        ];
    }

    /**
     * Membatalkan keikutsertaan dalam antrean.
     */
    public function cancel(User $user, int $eventId): array
    {
        return DB::transaction(function () use ($user, $eventId) {
            $entry = EventWaitlist::where('event_id', $eventId)
                ->where('user_id', $user->id)
                ->whereIn('status', [EventWaitlist::STATUS_WAITING, EventWaitlist::STATUS_OFFERED])
                ->lockForUpdate()
                ->first();

            if (!$entry) {
                return [
                    'success' => false,
                    'message' => 'Tidak ditemukan antrean aktif untuk dibatalkan.',
                ];
            }

            $wasOffered = $entry->isOffered();
            $seatNumber = $entry->seat_number;
            $ticketId   = $entry->event_ticket_id;

            $entry->update([
                'status' => EventWaitlist::STATUS_CANCELLED,
            ]);

            // Jika yang dibatalkan berstatus OFFERED, segera alihkan kursi ke antrean berikutnya!
            if ($wasOffered) {
                $this->dispatchNextOffer($eventId, $ticketId, $seatNumber);
            }

            Log::info("[WaitingListService] Antrean #{$entry->id} dibatalkan oleh user #{$user->id}");

            return [
                'success' => true,
                'message' => 'Antrean Waiting List berhasil dibatalkan.',
            ];
        });
    }

    /**
     * Inti Algoritma FIFO: Memberikan Penawaran Eksklusif (Offer) kepada Antrean Terdepan.
     * Dipanggil secara terpusat dan idempotent saat:
     * - Kursi / kuota dilepaskan (SeatLockService::onReservationReleased).
     * - Penawaran sebelumnya expired atau ditolak.
     */
    public function dispatchNextOffer(int $eventId, ?int $ticketId = null, ?string $freedSeatNumber = null): ?EventWaitlist
    {
        return DB::transaction(function () use ($eventId, $ticketId, $freedSeatNumber) {
            // 1. Ambil antrean WAITING dengan nomor urut terkecil (FIFO strictly)
            $candidate = EventWaitlist::where('event_id', $eventId)
                ->when($ticketId, fn($q) => $q->where('event_ticket_id', $ticketId))
                ->where('status', EventWaitlist::STATUS_WAITING)
                ->orderBy('queue_number', 'asc')
                ->lockForUpdate()
                ->first();

            if (!$candidate) {
                Log::info("[WaitingListService] Tidak ada antrean berstatus WAITING untuk event #{$eventId}.");
                return null;
            }

            // 2. Terbitkan Offer Token & hitung masa berlaku offer (configurable)
            $offerTtl = $this->getOfferTtl($eventId);
            $offerExpiresAt = Carbon::now()->addSeconds($offerTtl);
            $offerToken = 'OFFER-' . strtoupper(Str::random(12)) . '-' . time();

            // 3. Cadangkan kursi / kuota secara eksklusif untuk kandidat ini
            $candidate->update([
                'status'       => EventWaitlist::STATUS_OFFERED,
                'seat_number'  => $freedSeatNumber ?: $candidate->seat_number,
                'offer_token'  => $offerToken,
                'offered_at'   => Carbon::now(),
                'expires_at'   => $offerExpiresAt,
            ]);

            // 4. Kirim notifikasi prioritas ke peserta terpilih
            $user = $candidate->user;
            $event = $candidate->event;
            if ($user) {
                $user->notify(new OperationalNotification(
                    "Penawaran Tiket Tersedia: {$event->title}",
                    "Tiket telah tersedia untuk Anda! Klaim penawaran ini dalam 3 menit sebelum diberikan ke antrean berikutnya.",
                    "waitlist_offered",
                    [
                        'event_id'    => $eventId,
                        'offer_token' => $offerToken,
                        'expires_at'  => $offerExpiresAt->toISOString(),
                        'seat_number' => $candidate->seat_number,
                    ]
                ));
            }

            Log::info("[WaitingListService] Exclusive offer diberikan kepada user #{$candidate->user_id}", [
                'waitlist_id'  => $candidate->id,
                'queue_number' => $candidate->queue_number,
                'offer_token'  => $offerToken,
                'expires_at'   => $offerExpiresAt->toISOString(),
                'seat_number'  => $candidate->seat_number,
            ]);

            return $candidate;
        });
    }

    /**
     * Menerima penawaran (Accept Offer) dan mengubahnya menjadi Checkout Hold 15 Menit.
     * Menjamin: Kuota tidak dihitung ganda saat bertransisi dari OFFERED ke CLAIMED.
     */
    public function acceptOffer(string $offerToken, User $user, SeatLockService $seatLockService): array
    {
        return DB::transaction(function () use ($offerToken, $user, $seatLockService) {
            $entry = EventWaitlist::where('offer_token', $offerToken)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$entry) {
                return [
                    'success' => false,
                    'status'  => 'not_found',
                    'message' => 'Penawaran tidak valid atau tidak ditemukan.',
                ];
            }

            // Validasi status
            if ($entry->status !== EventWaitlist::STATUS_OFFERED) {
                return [
                    'success' => false,
                    'status'  => 'invalid_status',
                    'message' => "Penawaran ini sudah berstatus {$entry->status} dan tidak dapat diklaim lagi.",
                ];
            }

            // Validasi masa berlaku (3 menit)
            if ($entry->hasOfferExpired()) {
                $this->expireSingleOffer($entry);
                return [
                    'success' => false,
                    'status'  => 'expired',
                    'message' => 'Batas waktu penawaran telah habis (3 menit). Penawaran telah dialihkan ke antrean berikutnya.',
                ];
            }

            $eventId = $entry->event_id;
            $seatNumber = $entry->seat_number;
            $checkoutTtl = config('payment.hold_minutes', 15) * 60;

            // Jika event menggunakan assigned seat, amankan nomor kursi ke Redis lock
            $lockToken = 'LOCK-WL-' . strtoupper(Str::random(10)) . '-' . time();
            if ($seatNumber) {
                $lockResult = $seatLockService->lockSeatNumber($eventId, $seatNumber, $user->id, $checkoutTtl);
                if ($lockResult['success'] && isset($lockResult['data']['lock_token'])) {
                    $lockToken = $lockResult['data']['lock_token'];
                }
            }

            // Transisi state: OFFERED -> CLAIMED
            $entry->update([
                'status'     => EventWaitlist::STATUS_CLAIMED,
                'claimed_at' => Carbon::now(),
                'lock_token' => $lockToken,
            ]);

            Log::info("[WaitingListService] Offer diterima oleh user #{$user->id}", [
                'waitlist_id' => $entry->id,
                'lock_token'  => $lockToken,
            ]);

            return [
                'success'      => true,
                'status'       => 'CLAIMED',
                'message'      => 'Penawaran berhasil diklaim! Kuota diamankan selama 15 menit untuk checkout.',
                'data'         => [
                    'event_id'     => $eventId,
                    'ticket_id'    => $entry->event_ticket_id,
                    'seat_number'  => $seatNumber,
                    'lock_token'   => $lockToken,
                    'ttl_seconds'  => $checkoutTtl,
                    'checkout_url' => "/checkout/{$eventId}?ticketId={$entry->event_ticket_id}&lockToken={$lockToken}&ttl={$checkoutTtl}",
                ]
            ];
        });
    }

    /**
     * Menolak penawaran (Decline Offer) secara sukarela.
     */
    public function declineOffer(string $offerToken, User $user): array
    {
        return DB::transaction(function () use ($offerToken, $user) {
            $entry = EventWaitlist::where('offer_token', $offerToken)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$entry || $entry->status !== EventWaitlist::STATUS_OFFERED) {
                return [
                    'success' => false,
                    'message' => 'Penawaran tidak ditemukan atau sudah tidak aktif.',
                ];
            }

            $eventId = $entry->event_id;
            $seatNumber = $entry->seat_number;
            $ticketId = $entry->event_ticket_id;

            $entry->update(['status' => EventWaitlist::STATUS_CANCELLED]);

            // Segera berikan penawaran kepada peserta berikutnya
            $this->dispatchNextOffer($eventId, $ticketId, $seatNumber);

            return [
                'success' => true,
                'message' => 'Penawaran ditolak. Tiket dialihkan ke peserta berikutnya dalam antrean.',
            ];
        });
    }

    /**
     * Membersihkan seluruh offer yang kedaluwarsa secara otomatis dan memajukan antrean.
     */
    public function cleanupExpiredOffers(?int $eventId = null): int
    {
        $query = EventWaitlist::where('status', EventWaitlist::STATUS_OFFERED)
            ->where('expires_at', '<', Carbon::now());

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        $expiredOffers = $query->get();
        $count = 0;

        foreach ($expiredOffers as $entry) {
            $this->expireSingleOffer($entry);
            $count++;
        }

        return $count;
    }

    /**
     * Kadaluwarsa satu offer tertentu dan dispatch ke peserta berikutnya.
     */
    protected function expireSingleOffer(EventWaitlist $entry): void
    {
        DB::transaction(function () use ($entry) {
            $entry->update(['status' => EventWaitlist::STATUS_EXPIRED]);

            $user = $entry->user;
            $event = $entry->event;
            if ($user && $event) {
                $user->notify(new OperationalNotification(
                    "Penawaran Tiket Berakhir: {$event->title}",
                    "Batas waktu klaim 3 menit telah berakhir. Kesempatan dialihkan ke antrean berikutnya.",
                    "waitlist_expired",
                    ['event_id' => $event->id]
                ));
            }

            Log::info("[WaitingListService] Offer #{$entry->id} expired. Meneruskan ke antrean berikutnya.");

            // Lanjutkan penawaran ke antrean berikutnya
            $this->dispatchNextOffer($entry->event_id, $entry->event_ticket_id, $entry->seat_number);
        });
    }

    /**
     * Menghitung posisi relatif antrean (1-indexed).
     */
    public function calculatePosition(EventWaitlist $entry): int
    {
        if ($entry->status === EventWaitlist::STATUS_OFFERED) {
            return 0; // Posisi 0 menandakan giliran Anda (Offer Aktif)
        }

        return EventWaitlist::where('event_id', $entry->event_id)
            ->when($entry->event_ticket_id, fn($q) => $q->where('event_ticket_id', $entry->event_ticket_id))
            ->where('status', EventWaitlist::STATUS_WAITING)
            ->where('queue_number', '<', $entry->queue_number)
            ->count() + 1;
    }

    /**
     * TASK 4: Formula Estimasi Waktu Tunggu Dinamis (ETA).
     *
     * FORMULA:
     * Jika seluruh kapasitas event telah berstatus PAID (confirmed) dan tidak ada active holds/offers:
     *   ETA = null (Kapasitas Terisi Penuh — tidak ada prediksi pembatalan pasti).
     *
     * Jika terdapat active holds/offers:
     *   ETA(k) = T_earliest_remaining + (k - 1) * T_turnover_unit
     *
     * Di mana:
     * - k = posisi relatif peserta di dalam antrean (1, 2, 3...)
     * - T_earliest_remaining = sisa waktu terkecil dari active holds / active offers yang sedang berjalan.
     * - T_turnover_unit = rata-rata perputaran antrean (default 3 menit offer TTL).
     */
    public function calculateEstimatedWaitTime(int $eventId, int $queueNumber, ?int $ticketId = null): ?int
    {
        $holdCutoff = Carbon::now()->subMinutes(config('payment.hold_minutes', 15));

        // 1. Ambil order pending yang aktif
        $activePendingOrders = DB::table('orders')
            ->where('event_id', $eventId)
            ->where('status', PaymentStatus::PENDING)
            ->where('created_at', '>=', $holdCutoff)
            ->get();

        // 2. Ambil offer waitlist yang aktif
        $activeOffers = EventWaitlist::where('event_id', $eventId)
            ->where('status', EventWaitlist::STATUS_OFFERED)
            ->where('expires_at', '>', Carbon::now())
            ->get();

        $totalActiveReservations = $activePendingOrders->count() + $activeOffers->count();

        // Jika tidak ada satu pun hold aktif dan kapasitas penuh, ETA tidak dapat dipastikan
        if ($totalActiveReservations === 0) {
            return null;
        }

        // 3. Hitung posisi antrean peserta di antara kandidat WAITING
        $position = EventWaitlist::where('event_id', $eventId)
            ->when($ticketId, fn($q) => $q->where('event_ticket_id', $ticketId))
            ->where('status', EventWaitlist::STATUS_WAITING)
            ->where('queue_number', '<', $queueNumber)
            ->count() + 1;

        // 4. Cari sisa waktu terkecil dari active reservation saat ini
        $now = Carbon::now();
        $minRemainingSeconds = 900; // Default 15 menit

        foreach ($activePendingOrders as $order) {
            $createdAt = Carbon::parse($order->created_at);
            $expiresAt = $createdAt->copy()->addMinutes(config('payment.hold_minutes', 15));
            $rem = (int) max(10, $now->diffInSeconds($expiresAt, false));
            if ($rem < $minRemainingSeconds) {
                $minRemainingSeconds = $rem;
            }
        }

        foreach ($activeOffers as $offer) {
            $rem = (int) max(10, $now->diffInSeconds($offer->expires_at, false));
            if ($rem < $minRemainingSeconds) {
                $minRemainingSeconds = $rem;
            }
        }

        // Durasi turnover per antrean berikutnya (default offer TTL: 180 detik)
        $turnoverUnitSeconds = $this->getOfferTtl();

        $estimatedSeconds = (int) ($minRemainingSeconds + (($position - 1) * $turnoverUnitSeconds));

        return max(30, $estimatedSeconds);
    }

    /**
     * Format teks representatif untuk ETA.
     */
    public function formatEtaText(?int $seconds): string
    {
        if ($seconds === null) {
            return 'Estimasi belum tersedia (Kuota terkonfirmasi penuh)';
        }

        if ($seconds < 60) {
            return 'Kurang dari 1 menit';
        }

        $minutes = (int) ceil($seconds / 60);
        return "~{$minutes} menit";
    }
}
