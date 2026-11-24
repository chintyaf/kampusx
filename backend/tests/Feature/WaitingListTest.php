<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\EventSeat;
use App\Models\EventTicket;
use App\Models\EventWaitlist;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Models\Ticket;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\PaymentService;
use App\Services\SeatLockService;
use App\Services\WaitingListService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;

class WaitingListTest extends TestCase
{
    use DatabaseTransactions;

    protected User $organizer;
    protected User $userA;
    protected User $userB;
    protected User $userC;
    protected User $userD;
    protected Event $event;
    protected EventTicket $ticket;
    protected WaitingListService $waitingListService;
    protected SeatLockService $seatLockService;
    protected PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->waitingListService = app(WaitingListService::class);
        $this->seatLockService = app(SeatLockService::class);
        $this->paymentService = app(PaymentService::class);

        $this->organizer = User::firstOrCreate(
            ['email' => 'test.organizer.wl@example.com'],
            ['name' => 'Organizer WL', 'password' => bcrypt('password'), 'role' => 'organizer']
        );

        $this->userA = User::firstOrCreate(
            ['email' => 'test.userA.wl@example.com'],
            ['name' => 'User A', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->userB = User::firstOrCreate(
            ['email' => 'test.userB.wl@example.com'],
            ['name' => 'User B', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->userC = User::firstOrCreate(
            ['email' => 'test.userC.wl@example.com'],
            ['name' => 'User C', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->userD = User::firstOrCreate(
            ['email' => 'test.userD.wl@example.com'],
            ['name' => 'User D', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        // Buat Event dengan kapasitas terbatas 1 tiket
        $this->event = Event::create([
            'title'        => 'Seminar Eksklusif Kuota Terbatas ' . Str::random(6),
            'organizer_id' => $this->organizer->id,
            'start_date'   => now()->addDays(5),
            'end_date'     => now()->addDays(6),
            'status'       => 'published',
        ]);

        $this->ticket = EventTicket::create([
            'event_id' => $this->event->id,
            'name'     => 'Tiket VIP Kuota 1',
            'type'     => 'offline',
            'price'    => 100000,
            'capacity' => 1, // Kapasitas hanya 1 kursi/tiket
        ]);
    }

    /**
     * E2E SCENARIO UTAMA (Revisi Sidang):
     * 1. A mengunci kursi terakhir.
     * 2. B masuk waiting list posisi #1.
     * 3. C masuk waiting list posisi #2.
     * 4. A expired dan kuota dilepas.
     * 5. B menerima exclusive offer.
     * 6. C tetap menunggu.
     * 7. B tidak mengklaim offer -> Offer B expired.
     * 8. C menerima offer.
     * 9. C mengklaim offer, melakukan checkout dan pembayaran.
     * 10. E-ticket C aktif diterbitkan.
     */
    public function test_e2e_fifo_queue_offer_dispatch_and_ticket_fulfillment()
    {
        // STEP 1: A mengunci kursi/kuota terakhir
        $lockA = $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userA->id, 900);
        $this->assertTrue($lockA['success']);

        // STEP 2: B mencoba masuk waiting list (karena kuota penuh) -> Masuk posisi 1
        $joinB = $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);
        $this->assertTrue($joinB['success']);
        $this->assertEquals(1, $joinB['data']['position']);
        $this->assertEquals('WAITING', $joinB['data']['status']);

        // STEP 3: C masuk waiting list -> Masuk posisi 2
        $joinC = $this->waitingListService->join($this->userC, $this->event->id, $this->ticket->id);
        $this->assertTrue($joinC['success']);
        $this->assertEquals(2, $joinC['data']['position']);
        $this->assertEquals('WAITING', $joinC['data']['status']);

        // STEP 4: Kunci A expired (simulasikan locked_until di masa lalu lalu jalankan cleanup)
        EventSeat::where('event_id', $this->event->id)->where('seat_number', 'A1')
            ->update(['locked_until' => Carbon::now()->subMinutes(1)]);

        $released = $this->seatLockService->cleanupExpiredLocks($this->event->id);
        $this->assertGreaterThanOrEqual(1, $released);

        // STEP 5: B otomatis menerima exclusive offer (status OFFERED)
        $statusB = $this->waitingListService->getMyStatus($this->userB, $this->event->id);
        $this->assertEquals('OFFERED', $statusB['status']);
        $this->assertNotNull($statusB['offer_token']);
        $this->assertTrue($statusB['can_claim']);

        // STEP 6: C tetap menunggu di posisi #1 (status WAITING)
        $statusC = $this->waitingListService->getMyStatus($this->userC, $this->event->id);
        $this->assertEquals('WAITING', $statusC['status']);
        $this->assertEquals(1, $statusC['position']);

        // STEP 7: B mengabaikan offer -> simulasikan expires_at B telah lewat (3 menit)
        EventWaitlist::where('offer_token', $statusB['offer_token'])
            ->update(['expires_at' => Carbon::now()->subMinute()]);

        // STEP 8: Jalankan cleanup expired offers
        $expiredCount = $this->waitingListService->cleanupExpiredOffers($this->event->id);
        $this->assertEquals(1, $expiredCount);

        // Offer B menjadi EXPIRED
        $this->assertDatabaseHas('event_waitlists', [
            'id'     => $statusB['waitlist_id'],
            'status' => 'EXPIRED',
        ]);

        // C sekarang menerima exclusive offer!
        $statusC_After = $this->waitingListService->getMyStatus($this->userC, $this->event->id);
        $this->assertEquals('OFFERED', $statusC_After['status']);
        $this->assertNotNull($statusC_After['offer_token']);

        // STEP 9: C menerima dan mengklaim offer
        $acceptC = $this->waitingListService->acceptOffer($statusC_After['offer_token'], $this->userC, $this->seatLockService);
        $this->assertTrue($acceptC['success']);
        $this->assertEquals('CLAIMED', $acceptC['status']);
        $this->assertNotNull($acceptC['data']['lock_token']);

        // STEP 10: C melakukan checkout dan pembayaran sukses
        $orderC = Order::forceCreate([
            'order_id'    => 'ORD-WL-TEST-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->userC->id,
            'amount'      => 100000,
            'total_price' => 100000,
            'status'      => PaymentStatus::PENDING,
        ]);
        $orderItemC = OrderItem::create(['order_id' => $orderC->id, 'quantity' => 1, 'price' => 100000]);
        $ticketC = Ticket::create([
            'participant_id' => $this->userC->id,
            'order_item_id'  => $orderItemC->id,
            'attendee_name'  => $this->userC->name,
            'attendee_email' => $this->userC->email,
            'ticket_code'    => 'TCK-WL-' . Str::random(6),
            'qr_token'       => (string) Str::uuid(),
            'status'         => 'pending',
        ]);

        $txC = PaymentTransaction::create([
            'token'             => 'TKN-WL-' . Str::random(10),
            'order_id'          => $orderC->order_id,
            'merchant_order_id' => $orderC->order_id,
            'amount'            => 100000,
            'status'            => PaymentStatus::PENDING,
            'customer_name'     => $this->userC->name,
            'customer_email'    => $this->userC->email,
            'item_name'         => $this->event->title,
        ]);

        $this->paymentService->finalizePayment($txC, PaymentStatus::PAID, 'DUITKU-WL-SUCCESS');

        // STEP 11: E-Ticket C resmi aktif
        $this->assertEquals(PaymentStatus::PAID, $orderC->fresh()->status);
        $this->assertEquals('active', $ticketC->fresh()->status);
    }

    /**
     * TEST: Pencegahan Duplikat Antrean (Duplicate Active Entry).
     */
    public function test_prevents_duplicate_active_waitlist_entry()
    {
        // Buat kapasitas penuh
        $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userA->id, 900);

        // User B join pertama kali -> Berhasil
        $res1 = $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);
        $this->assertTrue($res1['success']);

        // User B mencoba join lagi untuk event yang sama -> Ditolak (409 Conflict)
        $res2 = $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);
        $this->assertFalse($res2['success']);
        $this->assertEquals('already_queued', $res2['status']);
    }

    /**
     * TEST: Tolak Waiting List jika kapasitas tiket masih tersedia.
     */
    public function test_rejects_waitlist_when_capacity_is_available()
    {
        // Kapasitas tiket = 1, belum ada yang mengunci atau membeli
        $res = $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);

        $this->assertFalse($res['success']);
        $this->assertEquals('capacity_available', $res['status']);
    }

    /**
     * TEST: Pembatalan Antrean (Cancel Waiting List).
     */
    public function test_user_can_cancel_waitlist_and_position_shifts()
    {
        $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userA->id, 900);

        $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id); // Posisi 1
        $this->waitingListService->join($this->userC, $this->event->id, $this->ticket->id); // Posisi 2

        // User B membatalkan antrean
        $cancelB = $this->waitingListService->cancel($this->userB, $this->event->id);
        $this->assertTrue($cancelB['success']);

        // Posisi User C sekarang maju menjadi posisi 1
        $statusC = $this->waitingListService->getMyStatus($this->userC, $this->event->id);
        $this->assertEquals(1, $statusC['position']);
    }

    /**
     * TEST: Pencegahan Queue Bypass (Pengguna baru tidak boleh mengambil kursi yang dicadangkan antrean).
     */
    public function test_prevents_queue_bypass_from_unregistered_users()
    {
        // A mengunci kursi A1
        $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userA->id, 900);

        // B antre di waiting list
        $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);

        // Lock A dilepas (misal expired / release)
        $this->seatLockService->releaseSeatNumber($this->event->id, 'A1', $this->userA->id);

        // Offer diberikan secara otomatis ke B
        $statusB = $this->waitingListService->getMyStatus($this->userB, $this->event->id);
        $this->assertEquals('OFFERED', $statusB['status']);

        // User D (orang luar yang tidak antre) mencoba mencuri kursi A1 langsung
        $stealAttempt = $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userD->id, 900);

        // Percobaan User D HARUS ditolak demi fairness!
        $this->assertFalse($stealAttempt['success']);
        $this->assertEquals('queue_reserved', $stealAttempt['status']);
    }

    /**
     * TEST: Tolak Klaim Offer yang sudah Expired.
     */
    public function test_cannot_claim_expired_offer()
    {
        $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userA->id, 900);
        $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);

        // Lepas lock A -> B terima offer
        $this->seatLockService->releaseSeatNumber($this->event->id, 'A1', $this->userA->id);
        $statusB = $this->waitingListService->getMyStatus($this->userB, $this->event->id);
        $offerToken = $statusB['offer_token'];

        // Waktu offer habis (subMinute)
        EventWaitlist::where('offer_token', $offerToken)->update(['expires_at' => Carbon::now()->subSeconds(10)]);

        // User B mencoba menerima offer yang sudah basi
        $claim = $this->waitingListService->acceptOffer($offerToken, $this->userB, $this->seatLockService);

        $this->assertFalse($claim['success']);
        $this->assertEquals('expired', $claim['status']);
    }

    /**
     * TEST: Estimasi Waktu Tunggu (ETA) saat Kuota Penuh Permanen (Sold Out Tanpa Active Hold).
     */
    public function test_eta_returns_null_when_all_seats_confirmed_paid()
    {
        // Event terisi lunas 100% oleh User A
        $orderPaid = Order::forceCreate([
            'order_id'    => 'ORD-FULL-PAID-' . time(),
            'event_id'    => $this->event->id,
            'user_id'     => $this->userA->id,
            'amount'      => 100000,
            'total_price' => 100000,
            'status'      => PaymentStatus::PAID, // Lunas, tidak ada pending
        ]);
        OrderItem::create(['order_id' => $orderPaid->id, 'quantity' => 1, 'price' => 100000]);

        // Cek ETA: harus null (tidak menjanjikan waktu palsu saat kuota lunas dan nol active hold)
        $eta = $this->waitingListService->calculateEstimatedWaitTime($this->event->id, 1, $this->ticket->id);
        $this->assertNull($eta);

        $etaText = $this->waitingListService->formatEtaText($eta);
        $this->assertStringContainsString('Kuota terkonfirmasi penuh', $etaText);
    }

    /**
     * TEST: Tolak Antrean saat Event Telah Berakhir atau Dibatalkan.
     */
    public function test_rejects_waitlist_when_event_is_closed_or_cancelled()
    {
        $this->event->update(['status' => 'cancelled']);

        $res = $this->waitingListService->join($this->userB, $this->event->id, $this->ticket->id);
        $this->assertFalse($res['success']);
        $this->assertEquals('event_closed', $res['status']);
    }

    /**
     * TEST: API Endpoints (Join, My-Status, Accept, Admin View).
     */
    public function test_waitlist_api_endpoints()
    {
        // 1. A mengunci kursi
        $this->seatLockService->lockSeatNumber($this->event->id, 'A1', $this->userA->id, 900);

        // 2. B memanggil API POST /events/{id}/waitlist/join
        $joinResponse = $this->actingAs($this->userB, 'sanctum')->postJson("/api/events/{$this->event->id}/waitlist/join", [
            'ticket_id' => $this->ticket->id,
        ]);
        $joinResponse->assertStatus(201);
        $joinResponse->assertJson(['success' => true, 'status' => 'WAITING']);

        // 3. B memanggil API GET /events/{id}/waitlist/my-status
        $statusResponse = $this->actingAs($this->userB, 'sanctum')->getJson("/api/events/{$this->event->id}/waitlist/my-status");
        $statusResponse->assertStatus(200);
        $statusResponse->assertJson([
            'success' => true,
            'data'    => [
                'in_queue' => true,
                'status'   => 'WAITING',
                'position' => 1,
            ]
        ]);

        // 4. Organizer memanggil API GET /admin/events/{id}/waitlist
        $adminResponse = $this->actingAs($this->organizer, 'sanctum')->getJson("/api/admin/events/{$this->event->id}/waitlist");
        $adminResponse->assertStatus(200);
        $adminResponse->assertJson([
            'success' => true,
            'data'    => [
                'event_id' => $this->event->id,
                'metrics'  => [
                    'total_waiting' => 1,
                ]
            ]
        ]);

        // 5. User B (bukan organizer event) mencoba mengakses admin waitlist -> Ditolak (403 Forbidden)
        $forbiddenResponse = $this->actingAs($this->userB, 'sanctum')->getJson("/api/admin/events/{$this->event->id}/waitlist");
        $forbiddenResponse->assertStatus(403);
    }
}
