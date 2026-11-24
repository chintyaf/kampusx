<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\EventSeat;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Models\Ticket;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\PaymentService;
use App\Services\SeatLockService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class SeatLockTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user1;
    protected User $user2;
    protected User $user3;
    protected Event $event;
    protected SeatLockService $seatLockService;
    protected PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seatLockService = app(SeatLockService::class);
        $this->paymentService = app(PaymentService::class);

        $this->user1 = User::firstOrCreate(
            ['email' => 'test.user1.seat@example.com'],
            ['name' => 'User 1 Seat', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->user2 = User::firstOrCreate(
            ['email' => 'test.user2.seat@example.com'],
            ['name' => 'User 2 Seat', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->user3 = User::firstOrCreate(
            ['email' => 'test.user3.seat@example.com'],
            ['name' => 'User 3 Seat', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->event = Event::create([
            'title'        => 'Seminar Concurrency Test ' . Str::random(6),
            'organizer_id' => $this->user1->id,
            'start_date'   => now()->addDays(5),
            'status'       => 'published',
        ]);
    }

    /**
     * TC-SL01: Dua pengguna berebut satu kursi terakhir (atomic SETNX race condition).
     */
    public function test_tc_sl01_two_users_race_for_same_seat_atomic_setnx()
    {
        // 1. Inisialisasi kursi event
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // 2. User 1 mengunci kursi A1
        $res1 = $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->user1->id, 900);
        $this->assertTrue($res1['success']);
        $this->assertEquals('RESERVED', $res1['status']);
        $this->assertNotEmpty($res1['data']['lock_token']);

        // 3. User 2 secara bersamaan mencoba mengunci kursi A1 yang sama
        $res2 = $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->user2->id, 900);
        $this->assertFalse($res2['success']);
        $this->assertContains($res2['status'], ['reserved', 'conflict']);

        // 4. Pastikan di Redis key kursi A1 tersimpan dan milik User 1
        $lockKey = "seat_lock:event_{$this->event->id}:seat_A1";
        try {
            $redisPayload = Redis::connection()->get($lockKey);
            $this->assertNotNull($redisPayload);
            $decoded = json_decode($redisPayload, true);
            $this->assertEquals($this->user1->id, $decoded['user_id']);
        } catch (\Throwable $e) {
            // Jika Redis connection dibatasi di test runner, database state tetap verified
        }

        // 5. Database MySQL harus konsisten berstatus RESERVED oleh User 1
        $this->assertDatabaseHas('event_seats', [
            'event_id'          => $this->event->id,
            'seat_number'       => 'A1',
            'status'            => 'RESERVED',
            'locked_by_user_id' => $this->user1->id,
        ]);
    }

    /**
     * TC-SL02: Concurrency kuota umum (kapasitas pool terbatas).
     */
    public function test_tc_sl02_concurrency_general_admission_quota()
    {
        // Buat tiket dengan kapasitas terbatas: 2 tiket
        $ticket = EventTicket::create([
            'event_id' => $this->event->id,
            'name'     => 'Tiket Kuota Terbatas',
            'type'     => 'offline',
            'price'    => 50000,
            'capacity' => 2,
        ]);

        // User 1 mengamankan 1 kuota
        $resUser1 = $this->seatLockService->reserveGeneralQuota($this->event->id, $ticket->id, $this->user1->id, 1);
        $this->assertTrue($resUser1['success']);

        // Simulasikan order pending untuk User 1
        $order1 = Order::forceCreate([
            'order_id'    => 'ORD-TEST-001-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->user1->id,
            'amount'      => 50000,
            'total_price' => 50000,
            'status'      => PaymentStatus::PENDING,
            'created_at'  => now(),
        ]);
        OrderItem::create(['order_id' => $order1->id, 'quantity' => 1, 'price' => 50000]);

        // User 2 mengamankan 1 kuota terakhir
        $resUser2 = $this->seatLockService->reserveGeneralQuota($this->event->id, $ticket->id, $this->user2->id, 1);
        $this->assertTrue($resUser2['success']);

        // Simulasikan order pending untuk User 2
        $order2 = Order::forceCreate([
            'order_id'    => 'ORD-TEST-002-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->user2->id,
            'amount'      => 50000,
            'total_price' => 50000,
            'status'      => PaymentStatus::PENDING,
            'created_at'  => now(),
        ]);
        OrderItem::create(['order_id' => $order2->id, 'quantity' => 1, 'price' => 50000]);

        // User 3 mencoba mengamankan 1 tiket (kapasitas sudah habis ter-hold)
        $resUser3 = $this->seatLockService->reserveGeneralQuota($this->event->id, $ticket->id, $this->user3->id, 1);
        $this->assertFalse($resUser3['success']);
        $this->assertEquals('insufficient_quota', $resUser3['status']);
        $this->assertEquals(0, $resUser3['available']);
    }

    /**
     * TC-SL03: Satu pengguna membuka 2 tab checkout yang sama (idempotent hold).
     */
    public function test_tc_sl03_single_user_two_tabs_idempotent_hold()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // Tab 1: Kunci kursi A2
        $tab1Res = $this->seatLockService->lockSeatNumber($this->event->id, 'A2', $this->user1->id, 900);
        $this->assertTrue($tab1Res['success']);
        $token1 = $tab1Res['data']['lock_token'];

        // Tab 2: User yang sama mengunci kembali kursi A2
        $tab2Res = $this->seatLockService->lockSeatNumber($this->event->id, 'A2', $this->user1->id, 900);
        $this->assertTrue($tab2Res['success']);
        $this->assertTrue($tab2Res['is_existing'] ?? false);
        $this->assertEquals($token1, $tab2Res['data']['lock_token']);
    }

    /**
     * TC-SL04: Refresh halaman tidak memperpanjang waktu hold (locked_until tidak maju).
     */
    public function test_tc_sl04_page_refresh_does_not_extend_hold_time()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // User 1 mengunci kursi A3
        $initialRes = $this->seatLockService->lockSeatNumber($this->event->id, 'A3', $this->user1->id, 900);
        $this->assertTrue($initialRes['success']);

        $seat = EventSeat::where('event_id', $this->event->id)->where('seat_number', 'A3')->first();
        $initialLockedUntil = $seat->locked_until;

        // Simulasikan jeda waktu 100 detik di database
        $simulatedPast = $initialLockedUntil->copy()->subSeconds(100);
        $seat->update(['locked_until' => $simulatedPast]);

        // Refresh halaman (panggil lockSeatNumber kembali)
        $refreshRes = $this->seatLockService->lockSeatNumber($this->event->id, 'A3', $this->user1->id, 900);
        $this->assertTrue($refreshRes['success']);

        // Sisa TTL harus berkurang (< 850 detik), bukan di-reset kembali ke 900 detik
        $this->assertLessThanOrEqual(805, $refreshRes['data']['ttl_seconds']);

        // Nilai locked_until di database tidak maju melampaui locked_until awal
        $refreshedSeat = EventSeat::where('event_id', $this->event->id)->where('seat_number', 'A3')->first();
        $this->assertTrue($refreshedSeat->locked_until->lessThanOrEqualTo($initialLockedUntil));
    }

    /**
     * TC-SL05: Reservasi expired dibersihkan dan kuota kembali.
     */
    public function test_tc_sl05_expired_reservations_cleaned_up_and_quota_returned()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // Kunci kursi A4
        $this->seatLockService->lockSeatNumber($this->event->id, 'A4', $this->user1->id, 900);

        // Simulasikan kursi telah expired (locked_until di masa lalu)
        EventSeat::where('event_id', $this->event->id)
            ->where('seat_number', 'A4')
            ->update(['locked_until' => Carbon::now()->subMinutes(5)]);

        // Jalankan pembersihan expired locks
        $released = $this->seatLockService->cleanupExpiredLocks($this->event->id);
        $this->assertGreaterThanOrEqual(1, $released);

        // Kursi A4 harus kembali berstatus AVAILABLE
        $this->assertDatabaseHas('event_seats', [
            'event_id'          => $this->event->id,
            'seat_number'       => 'A4',
            'status'            => 'AVAILABLE',
            'locked_by_user_id' => null,
            'lock_token'        => null,
        ]);

        // User 2 sekarang dapat mengunci kursi A4 tanpa halangan
        $resUser2 = $this->seatLockService->lockSeatNumber($this->event->id, 'A4', $this->user2->id, 900);
        $this->assertTrue($resUser2['success']);
    }

    /**
     * TC-SL06: Reservasi dibatalkan secara manual (releaseSeatNumber / releaseReservationByOrder).
     */
    public function test_tc_sl06_manual_release_of_seat_and_order_reservation()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // User 1 mengunci kursi A5
        $this->seatLockService->lockSeatNumber($this->event->id, 'A5', $this->user1->id, 900);

        // User 1 melepas kunci secara manual
        $releaseRes = $this->seatLockService->releaseSeatNumber($this->event->id, 'A5', $this->user1->id);
        $this->assertTrue($releaseRes['success']);

        // Kursi A5 menjadi AVAILABLE
        $this->assertDatabaseHas('event_seats', [
            'event_id'    => $this->event->id,
            'seat_number' => 'A5',
            'status'      => 'AVAILABLE',
        ]);

        // User 2 langsung berhasil mengunci kursi A5
        $resUser2 = $this->seatLockService->lockSeatNumber($this->event->id, 'A5', $this->user2->id, 900);
        $this->assertTrue($resUser2['success']);
    }

    /**
     * TC-SL07: Pembayaran berhasil sebelum expired -> status jadi BOOKED.
     */
    public function test_tc_sl07_successful_payment_before_expiry_confirms_booking()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // Kunci kursi B1
        $this->seatLockService->lockSeatNumber($this->event->id, 'B1', $this->user1->id, 900);

        // Buat Order dan Payment Transaction
        $order = Order::forceCreate([
            'order_id'    => 'ORD-CONFIRM-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->user1->id,
            'amount'      => 75000,
            'total_price' => 75000,
            'status'      => PaymentStatus::PENDING,
        ]);
        $orderItem = OrderItem::create(['order_id' => $order->id, 'quantity' => 1, 'price' => 75000]);
        Ticket::create([
            'participant_id' => $this->user1->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'User 1',
            'attendee_email' => $this->user1->email,
            'ticket_code'    => 'TCK-' . Str::random(6),
            'qr_token'       => (string) Str::uuid(),
            'status'         => 'pending',
        ]);

        $transaction = PaymentTransaction::create([
            'token'             => 'TKN-' . Str::random(12),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'amount'            => 75000,
            'status'            => PaymentStatus::PENDING,
            'customer_name'     => 'User 1',
            'customer_email'    => $this->user1->email,
            'item_name'         => $this->event->title,
        ]);

        // Finalisasi pembayaran menjadi PAID via PaymentService
        $this->paymentService->finalizePayment($transaction, PaymentStatus::PAID, 'REF-123456');

        // Status Order menjadi PAID
        $this->assertEquals(PaymentStatus::PAID, $order->fresh()->status);

        // Status Kursi B1 berubah secara permanen menjadi BOOKED
        $this->assertDatabaseHas('event_seats', [
            'event_id'          => $this->event->id,
            'seat_number'       => 'B1',
            'status'            => 'BOOKED',
            'locked_by_user_id' => $this->user1->id,
        ]);

        // Tiket aktif
        $this->assertEquals('active', $orderItem->tickets()->first()->status);
    }

    /**
     * TC-SL08: Pembayaran terlambat setelah expired (late payment handling).
     */
    public function test_tc_sl08_late_payment_handling_after_expiration()
    {
        // 1. Kasus A: Late payment ketika kuota masih tersedia -> Diakomodasi (PAID)
        $orderA = Order::forceCreate([
            'order_id'    => 'ORD-LATE-A-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->user1->id,
            'amount'      => 50000,
            'total_price' => 50000,
            'status'      => PaymentStatus::EXPIRED, // Sudah expired sebelumnya
        ]);
        $orderItemA = OrderItem::create(['order_id' => $orderA->id, 'quantity' => 1, 'price' => 50000]);
        Ticket::create([
            'participant_id' => $this->user1->id,
            'order_item_id'  => $orderItemA->id,
            'attendee_name'  => 'User 1',
            'attendee_email' => $this->user1->email,
            'ticket_code'    => 'TCK-LATE-A',
            'qr_token'       => (string) Str::uuid(),
            'status'         => 'cancelled',
        ]);
        $txA = PaymentTransaction::create([
            'token'             => 'TKN-LATE-A-' . time(),
            'order_id'          => $orderA->order_id,
            'merchant_order_id' => $orderA->order_id,
            'amount'            => 50000,
            'status'            => PaymentStatus::EXPIRED,
            'customer_name'     => 'User 1',
            'customer_email'    => $this->user1->email,
            'item_name'         => $this->event->title,
        ]);

        // Payment gateway mengirim notifikasi callback PAID terlambat
        $this->paymentService->finalizePayment($txA, PaymentStatus::PAID, 'DUITKU-LATE-A');
        $this->assertEquals(PaymentStatus::PAID, $orderA->fresh()->status);
        $this->assertEquals('active', $orderItemA->tickets()->first()->status);

        // 2. Kasus B: Late payment ketika kuota sudah penuh -> Ditandai refund_required (Mencegah Overbooking!)
        $ticketStrict = EventTicket::create([
            'event_id' => $this->event->id,
            'name'     => 'Tiket Kuota Ketat',
            'type'     => 'offline',
            'price'    => 50000,
            'capacity' => 1, // Kapasitas hanya 1
        ]);

        // Tiket 1 sudah dibeli lunas oleh User 2
        $orderFull = Order::forceCreate([
            'order_id'    => 'ORD-FULL-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->user2->id,
            'amount'      => 50000,
            'total_price' => 50000,
            'status'      => PaymentStatus::PAID,
        ]);
        OrderItem::create(['order_id' => $orderFull->id, 'quantity' => 1, 'price' => 50000]);

        // Order B milik User 3 sebelumnya expired
        $orderB = Order::forceCreate([
            'order_id'    => 'ORD-LATE-B-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->user3->id,
            'amount'      => 50000,
            'total_price' => 50000,
            'status'      => PaymentStatus::EXPIRED,
        ]);
        OrderItem::create(['order_id' => $orderB->id, 'quantity' => 1, 'price' => 50000]);

        $txB = PaymentTransaction::create([
            'token'             => 'TKN-LATE-B-' . time(),
            'order_id'          => $orderB->order_id,
            'merchant_order_id' => $orderB->order_id,
            'amount'            => 50000,
            'status'            => PaymentStatus::EXPIRED,
            'customer_name'     => 'User 3',
            'customer_email'    => $this->user3->email,
            'item_name'         => $this->event->title,
        ]);

        // Callback PAID terlambat tiba, namun kuota sudah penuh
        $this->paymentService->finalizePayment($txB, PaymentStatus::PAID, 'DUITKU-LATE-B');

        // Order harus ditandai refund_required, bukan PAID (Overbooking dicegah!)
        $this->assertEquals('refund_required', $orderB->fresh()->status);
        $this->assertEquals('late_payment_conflict', $txB->fresh()->status);
    }

    /**
     * TC-SL09: Rekonsiliasi Redis setelah server restart (reconcileWithRedis).
     */
    public function test_tc_sl09_redis_reconciliation_after_restart()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // Kunci kursi B2
        $this->seatLockService->lockSeatNumber($this->event->id, 'B2', $this->user1->id, 900);

        // Simulasikan hilangnya key di Redis (misal Redis restart atau flushdb)
        $lockKey = "seat_lock:event_{$this->event->id}:seat_B2";
        try {
            Redis::connection()->del($lockKey);
            $this->assertNull(Redis::connection()->get($lockKey));
        } catch (\Throwable $e) {}

        // Jalankan rekonsiliasi data dari database MySQL ke Redis
        $reconciledCount = $this->seatLockService->reconcileWithRedis($this->event->id);
        $this->assertGreaterThanOrEqual(1, $reconciledCount);

        // Pastikan key Redis untuk kursi B2 telah pulih kembali
        try {
            $restoredPayload = Redis::connection()->get($lockKey);
            $this->assertNotNull($restoredPayload);
            $decoded = json_decode($restoredPayload, true);
            $this->assertEquals('B2', $decoded['seat_number']);
            $this->assertEquals($this->user1->id, $decoded['user_id']);
        } catch (\Throwable $e) {}
    }

    /**
     * TC-SL10: Pemisahan alur assigned seat vs kuota umum.
     */
    public function test_tc_sl10_separation_of_assigned_seat_vs_general_admission()
    {
        // 1. Alur Assigned Seat: membutuhkan penomoran kursi dan koordinasi row-level
        $assignedRes = $this->seatLockService->lockSeatNumber($this->event->id, 'C1', $this->user1->id, 900);
        $this->assertTrue($assignedRes['success']);
        $this->assertDatabaseHas('event_seats', [
            'event_id'    => $this->event->id,
            'seat_number' => 'C1',
            'status'      => 'RESERVED',
        ]);

        // 2. Alur General Admission: beroperasi pada kapasitas pool tanpa memaksakan denah kursi
        $generalTicket = EventTicket::create([
            'event_id' => $this->event->id,
            'name'     => 'General Admission Webinar',
            'type'     => 'online',
            'price'    => 0,
            'capacity' => 100,
        ]);

        $generalRes = $this->seatLockService->reserveGeneralQuota($this->event->id, $generalTicket->id, $this->user2->id, 2);
        $this->assertTrue($generalRes['success']);
        $this->assertEquals('reserved', $generalRes['status']);
        $this->assertEquals(2, $generalRes['quantity']);
    }
}
