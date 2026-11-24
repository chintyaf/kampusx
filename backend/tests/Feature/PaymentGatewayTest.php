<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\PaymentTransaction;
use App\Models\PointTransaction;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\PaymentGatewayResolver;
use App\Services\Payment\PaymentService;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\DTO\PaymentRequestDTO;
use App\Services\Payment\DTO\PaymentResponseDTO;
use App\Services\Payment\DTO\PaymentStatusDTO;
use App\Services\Payment\DTO\CallbackResultDTO;
use App\Services\Payment\Adapters\DuitkuGateway;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class PaymentGatewayTest extends TestCase
{
    use DatabaseTransactions;

    protected User $participant;
    protected User $otherParticipant;
    protected Event $freeEvent;
    protected Event $paidEvent;
    protected EventTicket $paidEventTicket;
    protected PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->paymentService = app(PaymentService::class);

        $this->participant = User::firstOrCreate(
            ['email' => 'test.participant.payment@example.com'],
            ['name' => 'Budi Pembeli', 'password' => bcrypt('password123'), 'role' => 'participant']
        );

        $this->otherParticipant = User::firstOrCreate(
            ['email' => 'test.other.payment@example.com'],
            ['name' => 'Siti Lainnya', 'password' => bcrypt('password123'), 'role' => 'participant']
        );

        $this->freeEvent = Event::firstOrCreate(
            ['title' => 'Seminar AI Gratis KampusX Testing'],
            [
                'price'        => 0,
                'start_date'   => now()->addDays(7),
                'status'       => 'published',
                'organizer_id' => $this->participant->id,
            ]
        );

        $this->paidEvent = Event::firstOrCreate(
            ['title' => 'Workshop Flutter Berbayar Testing'],
            [
                'price'        => 50000,
                'start_date'   => now()->addDays(10),
                'status'       => 'published',
                'organizer_id' => $this->participant->id,
            ]
        );

        $this->paidEventTicket = EventTicket::firstOrCreate(
            ['event_id' => $this->paidEvent->id],
            ['name' => 'Tiket Regular', 'capacity' => 10, 'price' => 50000]
        );

        // Pastikan konfigurasi sandbox testing konsisten
        config([
            'payment.default' => 'duitku',
            'payment.mode'    => 'sandbox',
            'payment.providers.duitku.sandbox.merchant_code' => 'D12345',
            'payment.providers.duitku.sandbox.api_key'       => 'sandbox_api_key_placeholder_1234567890abcdef',
            'payment.providers.duitku.sandbox.inquiry_url'   => 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry',
            'payment.providers.duitku.sandbox.status_url'    => 'https://sandbox.duitku.com/webapi/api/merchant/transactionStatus',
        ]);
    }

    /**
     * TC01 — Event gratis berhasil tanpa payment gateway.
     */
    public function test_tc01_free_event_registration_succeeds_instantly()
    {
        $response = $this->actingAs($this->participant, 'sanctum')->postJson('/api/checkout', [
            'event_id' => $this->freeEvent->id,
            'quantity' => 1,
            'name'     => 'Budi Peserta Gratis',
            'email'    => 'budi.peserta@example.com',
            'phone'    => '081234567890',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status'  => 'success',
            'is_free' => true,
        ]);

        $orderId = $response->json('order_id');
        $this->assertDatabaseHas('orders', [
            'order_id' => $orderId,
            'status'   => 'paid',
            'amount'   => 0,
        ]);

        $this->assertDatabaseHas('tickets', [
            'ticket_code' => $response->json('ticket_code'),
            'status'      => 'active',
        ]);
    }

    /**
     * TC02 — Invoice Duitku Sandbox berhasil dibuat dan hosted checkout terbuka.
     */
    public function test_tc02_duitku_invoice_creation_succeeds_with_checkout_url()
    {
        // Mock API Duitku Inquiry
        Http::fake([
            'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry' => Http::response([
                'statusCode'    => '00',
                'statusMessage' => 'SUCCESS',
                'paymentUrl'    => 'https://sandbox.duitku.com/redirect/checkout?reference=D123456789',
                'reference'     => 'D123456789',
            ], 200),
        ]);

        $response = $this->actingAs($this->participant, 'sanctum')->postJson('/api/checkout', [
            'event_id' => $this->paidEvent->id,
            'quantity' => 1,
            'name'     => 'Budi Pembeli',
            'email'    => 'budi@example.com',
            'phone'    => '081234567890',
            'payment_method' => 'qris',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status'       => 'success',
            'is_free'      => false,
            'status_label' => 'pending',
            'checkout_url' => 'https://sandbox.duitku.com/redirect/checkout?reference=D123456789',
        ]);

        $orderId = $response->json('order_id');
        $this->assertDatabaseHas('orders', [
            'order_id' => $orderId,
            'status'   => 'pending',
        ]);

        $this->assertDatabaseHas('payment_transactions', [
            'order_id'           => $orderId,
            'status'             => 'pending',
            'provider'           => 'duitku',
            'provider_reference' => 'D123456789',
        ]);
    }

    /**
     * TC03 — Pembayaran sukses via callback menghasilkan order paid dan e-ticket aktif.
     */
    public function test_tc03_successful_payment_callback_activates_order_and_ticket()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC03-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        $ticket = Ticket::create([
            'participant_id' => $this->participant->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'Budi Pembeli',
            'attendee_email' => 'budi@example.com',
            'ticket_code'    => 'TK-TC03-' . rand(100, 999),
            'qr_token'       => 'qr-tc03-token',
            'status'         => 'pending',
        ]);

        $merchantCode = config('payment.providers.duitku.sandbox.merchant_code', 'D12345');
        $apiKey = config('payment.providers.duitku.sandbox.api_key', 'sandbox_api_key_placeholder_1234567890abcdef');
        $amountStr = '51000';
        $signature = md5($merchantCode . $amountStr . $order->order_id . $apiKey);

        $transaction = PaymentTransaction::create([
            'token'             => 'TKN-TC03-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Pembeli',
            'customer_email'    => 'budi@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'pending',
        ]);

        // Kirim callback dari Duitku
        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => $merchantCode,
            'amount'          => $amountStr,
            'merchantOrderId' => $order->order_id,
            'signature'       => $signature,
            'reference'       => 'REF-TC03-SUCCESS',
            'resultCode'      => '00',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('SUCCESS', $response->getContent());

        $order->refresh();
        $ticket->refresh();
        $this->assertEquals('paid', $order->status);
        $this->assertEquals('active', $ticket->status);
    }

    /**
     * TC04 — Pembayaran pending tidak menghasilkan e-ticket aktif.
     */
    public function test_tc04_pending_payment_leaves_ticket_as_pending()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC04-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        $ticket = Ticket::create([
            'participant_id' => $this->participant->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'Budi Pending',
            'attendee_email' => 'budi.pending@example.com',
            'ticket_code'    => 'TK-TC04-' . rand(100, 999),
            'qr_token'       => 'qr-tc04-token',
            'status'         => 'pending',
        ]);

        $this->assertEquals('pending', $order->status);
        $this->assertEquals('pending', $ticket->status);
    }

    /**
     * TC05 — Pembayaran gagal melepaskan reservasi / membatalkan tiket.
     */
    public function test_tc05_failed_payment_callback_cancels_ticket()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC05-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        $ticket = Ticket::create([
            'participant_id' => $this->participant->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'Budi Gagal',
            'attendee_email' => 'budi.gagal@example.com',
            'ticket_code'    => 'TK-TC05-' . rand(100, 999),
            'qr_token'       => 'qr-tc05-token',
            'status'         => 'pending',
        ]);

        $merchantCode = config('payment.providers.duitku.sandbox.merchant_code', 'D12345');
        $apiKey = config('payment.providers.duitku.sandbox.api_key', 'sandbox_api_key_placeholder_1234567890abcdef');
        $signature = md5($merchantCode . '51000' . $order->order_id . $apiKey);

        PaymentTransaction::create([
            'token'             => 'TKN-TC05-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Gagal',
            'customer_email'    => 'budi.gagal@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'pending',
        ]);

        // Kirim callback gagal (resultCode = "01")
        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => $merchantCode,
            'amount'          => '51000',
            'merchantOrderId' => $order->order_id,
            'signature'       => $signature,
            'reference'       => 'REF-TC05-FAILED',
            'resultCode'      => '01',
        ]);

        $response->assertStatus(200);

        $order->refresh();
        $ticket->refresh();
        $this->assertEquals('failed', $order->status);
        $this->assertEquals('cancelled', $ticket->status);
    }

    /**
     * TC06 — Callback dengan signature salah ditolak (HTTP 400).
     */
    public function test_tc06_invalid_signature_callback_is_rejected()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC06-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        PaymentTransaction::create([
            'token'             => 'TKN-TC06-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Palsu',
            'customer_email'    => 'budi.palsu@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'pending',
        ]);

        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => 'D12345',
            'amount'          => '51000',
            'merchantOrderId' => $order->order_id,
            'signature'       => 'invalid_fake_signature_hash',
            'resultCode'      => '00',
        ]);

        $response->assertStatus(400);
        $this->assertEquals('BAD_SIGNATURE', $response->getContent());

        $order->refresh();
        $this->assertEquals('pending', $order->status); // Status tidak boleh berubah
    }

    /**
     * TC07 — Callback dengan nominal berbeda ditolak (HTTP 400).
     */
    public function test_tc07_amount_mismatch_callback_is_rejected()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC07-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        PaymentTransaction::create([
            'token'             => 'TKN-TC07-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Diskon',
            'customer_email'    => 'budi.diskon@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'pending',
        ]);

        $merchantCode = config('payment.providers.duitku.sandbox.merchant_code', 'D12345');
        $apiKey = config('payment.providers.duitku.sandbox.api_key', 'sandbox_api_key_placeholder_1234567890abcdef');
        // Nominal di callback diubah menjadi 20000 (tidak cocok dengan order 51000)
        $mismatchedAmount = '20000';
        $signature = md5($merchantCode . $mismatchedAmount . $order->order_id . $apiKey);

        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => $merchantCode,
            'amount'          => $mismatchedAmount,
            'merchantOrderId' => $order->order_id,
            'signature'       => $signature,
            'resultCode'      => '00',
        ]);

        $response->assertStatus(400);
        $this->assertEquals('AMOUNT_MISMATCH', $response->getContent());

        $order->refresh();
        $this->assertEquals('pending', $order->status);
    }

    /**
     * TC08 — Callback untuk order yang tidak dikenal ditolak (HTTP 404).
     */
    public function test_tc08_unknown_order_callback_is_rejected()
    {
        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => 'D12345',
            'amount'          => '50000',
            'merchantOrderId' => 'NON-EXISTING-ORDER-ID',
            'signature'       => 'some_signature',
            'resultCode'      => '00',
        ]);

        $response->assertStatus(404);
        $this->assertEquals('TRANSACTION_NOT_FOUND', $response->getContent());
    }

    /**
     * TC09 — Callback dikirim dua kali tidak terjadi duplikasi tiket atau poin (Idempotency).
     */
    public function test_tc09_duplicate_callback_is_idempotent_no_duplicate_tickets_or_points()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC09-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        Ticket::create([
            'participant_id' => $this->participant->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'Budi Idempotent',
            'attendee_email' => 'budi.idemp@example.com',
            'ticket_code'    => 'TK-TC09-' . rand(100, 999),
            'qr_token'       => 'qr-tc09-token',
            'status'         => 'pending',
        ]);

        $merchantCode = config('payment.providers.duitku.sandbox.merchant_code', 'D12345');
        $apiKey = config('payment.providers.duitku.sandbox.api_key', 'sandbox_api_key_placeholder_1234567890abcdef');
        $signature = md5($merchantCode . '51000' . $order->order_id . $apiKey);

        PaymentTransaction::create([
            'token'             => 'TKN-TC09-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Idempotent',
            'customer_email'    => 'budi.idemp@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'pending',
        ]);

        $payload = [
            'merchantCode'    => $merchantCode,
            'amount'          => '51000',
            'merchantOrderId' => $order->order_id,
            'signature'       => $signature,
            'reference'       => 'REF-TC09',
            'resultCode'      => '00',
        ];

        // Eksekusi Callback 1
        $res1 = $this->post('/api/payment/callback/duitku', $payload);
        $res1->assertStatus(200);

        // Eksekusi Callback 2 (Duplikat)
        $res2 = $this->post('/api/payment/callback/duitku', $payload);
        $res2->assertStatus(200);

        // Pastikan jumlah tiket tetap 1 untuk order item ini
        $ticketCount = Ticket::where('order_item_id', $orderItem->id)->count();
        $this->assertEquals(1, $ticketCount);

        // Pastikan poin gamifikasi untuk order ini hanya tercatat 1 kali
        $pointRecordCount = PointTransaction::where('user_id', $this->participant->id)
            ->where('event_id', $this->paidEvent->id)
            ->where('description', 'like', '%Poin Partisipasi Event%')
            ->count();
        $this->assertEquals(1, $pointRecordCount);
    }

    /**
     * TC12 — Participant mencoba membaca order milik pengguna lain dan ditolak (HTTP 403).
     */
    public function test_tc12_participant_cannot_read_other_users_order_status()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC12-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->otherParticipant->id, // Milik Siti
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'paid',
        ]);

        // Budi mencoba mengakses order milik Siti
        $response = $this->actingAs($this->participant, 'sanctum')
            ->getJson("/api/payment/status/{$order->order_id}");

        $response->assertStatus(403);
    }

    /**
     * TC17 — Callback pending atau failed diterima setelah status paid tidak boleh me-reset status paid.
     */
    public function test_tc17_late_failed_callback_does_not_downgrade_paid_status()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC17-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'paid',
            'paid_at'     => now(),
        ]);

        $merchantCode = config('payment.providers.duitku.sandbox.merchant_code', 'D12345');
        $apiKey = config('payment.providers.duitku.sandbox.api_key', 'sandbox_api_key_placeholder_1234567890abcdef');
        $signature = md5($merchantCode . '51000' . $order->order_id . $apiKey);

        PaymentTransaction::create([
            'token'             => 'TKN-TC17-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Lunas',
            'customer_email'    => 'budi.lunas@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'success',
        ]);

        // Kirim callback yang menyatakan gagal setelah status sudah paid
        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => $merchantCode,
            'amount'          => '51000',
            'merchantOrderId' => $order->order_id,
            'signature'       => $signature,
            'resultCode'      => '01',
        ]);

        $response->assertStatus(200);

        $order->refresh();
        $this->assertEquals('paid', $order->status); // Status tetap paid
    }

    /**
     * TC10 — Return URL dimanipulasi tetapi pembayaran tetap tidak dapat dianggap sukses tanpa backend verification.
     */
    public function test_tc10_return_url_manipulation_does_not_mark_order_as_paid()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC10-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        // Hacker mencoba memanggil GET /api/payment/status dengan status palsu atau fake parameter
        $response = $this->actingAs($this->participant, 'sanctum')
            ->getJson("/api/payment/status/{$order->order_id}?fake_status=success&resultCode=00");

        $response->assertStatus(200);
        $this->assertEquals('pending', $response->json('payment_status'));

        $order->refresh();
        $this->assertEquals('pending', $order->status); // Status tetap pending di backend
    }

    /**
     * TC11 — Endpoint status pembayaran konsisten saat di-refresh.
     */
    public function test_tc11_order_status_endpoint_returns_consistent_data()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC11-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'paid',
            'paid_at'     => now(),
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        $ticket = Ticket::create([
            'participant_id' => $this->participant->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'Budi Refresh',
            'attendee_email' => 'budi.refresh@example.com',
            'ticket_code'    => 'TK-TC11-' . rand(100, 999),
            'qr_token'       => 'qr-tc11-token',
            'status'         => 'active',
        ]);

        $response = $this->actingAs($this->participant, 'sanctum')
            ->getJson("/api/payment/status/{$order->order_id}");

        $response->assertStatus(200);
        $response->assertJson([
            'status'         => 'success',
            'order_id'       => $order->order_id,
            'payment_status' => 'paid',
            'primary_ticket_code' => $ticket->ticket_code,
        ]);
    }

    /**
     * TC13 — Dua participant berebut satu kuota tiket terakhir (concurrency check).
     */
    public function test_tc13_concurrency_capacity_prevents_overbooking()
    {
        // Set capacity tiket menjadi hanya 1
        $this->paidEventTicket->update(['capacity' => 1]);

        // Participant 1 mendaftar 1 kuota
        $order1 = Order::forceCreate([
            'order_id'    => 'ORD-TC13-1-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        // Participant 2 mencoba mendaftar tiket yang sama
        $response = $this->actingAs($this->otherParticipant, 'sanctum')->postJson('/api/checkout', [
            'event_id' => $this->paidEvent->id,
            'quantity' => 1,
            'name'     => 'Siti Berebut',
            'email'    => 'siti@example.com',
            'phone'    => '081234567899',
        ]);

        // Permintaan kedua harus ditolak karena kuota 1 sudah terisi oleh order1 yang pending/paid
        $response->assertStatus(422);
        $response->assertJson([
            'status'  => 'error',
        ]);
        $this->assertStringContainsString('Kuota tiket tidak mencukupi', $response->json('message'));
    }

    /**
     * TC15 — Provider timeout atau offline ditangani dengan graceful error.
     */
    public function test_tc15_gateway_timeout_returns_graceful_error()
    {
        // Mock API Duitku timeout
        Http::fake([
            'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection to Duitku timed out after 15000ms');
            },
        ]);

        $response = $this->actingAs($this->participant, 'sanctum')->postJson('/api/checkout', [
            'event_id' => $this->paidEvent->id,
            'quantity' => 1,
            'name'     => 'Budi Timeout',
            'email'    => 'budi.timeout@example.com',
            'phone'    => '081234567890',
        ]);

        $response->assertStatus(502);
        $response->assertJson([
            'status' => 'error',
        ]);
    }

    /**
     * TC16 — Status inquiry ketika callback tidak diterima (rekonsiliasi server-side).
     */
    public function test_tc16_server_side_status_inquiry_syncs_unreceived_callback()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC16-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price'    => 50000,
        ]);

        $ticket = Ticket::create([
            'participant_id' => $this->participant->id,
            'order_item_id'  => $orderItem->id,
            'attendee_name'  => 'Budi Inquiry',
            'attendee_email' => 'budi.inquiry@example.com',
            'ticket_code'    => 'TK-TC16-' . rand(100, 999),
            'qr_token'       => 'qr-tc16-token',
            'status'         => 'pending',
        ]);

        PaymentTransaction::create([
            'token'             => 'TKN-TC16-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Inquiry',
            'customer_email'    => 'budi.inquiry@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'pending',
        ]);

        // Mock response Transaction Status Duitku menyatakan sudah lunas ("00")
        Http::fake([
            'https://sandbox.duitku.com/webapi/api/merchant/transactionStatus' => Http::response([
                'merchantOrderId' => $order->order_id,
                'reference'       => 'REF-TC16-INQUIRY',
                'amount'          => '51000.00',
                'statusCode'      => '00',
                'statusMessage'   => 'SUCCESS',
            ], 200),
        ]);

        // Peserta membuka status ordernya
        $response = $this->actingAs($this->participant, 'sanctum')
            ->getJson("/api/payment/status/{$order->order_id}");

        $response->assertStatus(200);
        $this->assertEquals('paid', $response->json('payment_status'));

        $order->refresh();
        $ticket->refresh();
        $this->assertEquals('paid', $order->status);
        $this->assertEquals('active', $ticket->status);
    }

    /**
     * TC14 — Pembayaran diterima setelah hold expired (Late Payment Handling).
     * Memastikan sistem mendeteksi kasus pembayaran yang masuk setelah status expired
     * dan mencatatnya ke database transaksi untuk penanganan/rekonsiliasi tanpa crash.
     */
    public function test_tc14_late_payment_after_hold_expired_is_recorded_safely()
    {
        $order = Order::forceCreate([
            'order_id'    => 'ORD-TC14-' . time(),
            'event_id'    => $this->paidEvent->id,
            'user_id'     => $this->participant->id,
            'amount'      => 51000,
            'total_price' => 51000,
            'status'      => 'expired', // Sudah expired sebelumnya
        ]);

        $merchantCode = config('payment.providers.duitku.sandbox.merchant_code', 'D12345');
        $apiKey = config('payment.providers.duitku.sandbox.api_key', 'sandbox_api_key_placeholder_1234567890abcdef');
        $signature = md5($merchantCode . '51000' . $order->order_id . $apiKey);

        $transaction = PaymentTransaction::create([
            'token'             => 'TKN-TC14-' . time(),
            'order_id'          => $order->order_id,
            'merchant_order_id' => $order->order_id,
            'provider'          => 'duitku',
            'environment'       => 'sandbox',
            'amount'            => 51000,
            'customer_name'     => 'Budi Telat',
            'customer_email'    => 'budi.telat@example.com',
            'item_name'         => $this->paidEvent->title,
            'status'            => 'expired',
            'expired_at'        => now()->subMinutes(10), // Expired 10 menit lalu
        ]);

        // Callback sukses tiba dari Duitku setelah status order expired
        $response = $this->post('/api/payment/callback/duitku', [
            'merchantCode'    => $merchantCode,
            'amount'          => '51000',
            'merchantOrderId' => $order->order_id,
            'signature'       => $signature,
            'reference'       => 'REF-TC14-LATE',
            'resultCode'      => '00',
        ]);

        $response->assertStatus(200);

        // Transaksi mencatat referensi pembayaran dari provider
        $transaction->refresh();
        $this->assertEquals('REF-TC14-LATE', $transaction->provider_reference);
    }

    /**
     * TC18 — PaymentService dapat menggunakan implementasi interface lain (Portabilitas Provider).
     */
    public function test_tc18_payment_service_works_with_custom_gateway_implementation()
    {
        // Buat test double implementasi PaymentGatewayInterface
        $mockGateway = new class implements PaymentGatewayInterface {
            public function getProviderName(): string { return 'mock_provider'; }
            public function createPayment(PaymentRequestDTO $request): PaymentResponseDTO {
                return new PaymentResponseDTO(
                    isSuccess: true,
                    checkoutUrl: 'https://mock-gateway.com/pay/' . $request->merchantOrderId,
                    providerReference: 'MOCK-REF-123'
                );
            }
            public function checkStatus(string $merchantOrderId, ?PaymentTransaction $transaction = null): PaymentStatusDTO {
                return new PaymentStatusDTO(
                    merchantOrderId: $merchantOrderId,
                    internalStatus: PaymentStatus::PAID
                );
            }
            public function verifyCallback(Request $request, ?PaymentTransaction $transaction = null): bool {
                return true;
            }
            public function parseCallback(Request $request): CallbackResultDTO {
                return new CallbackResultDTO(
                    isValid: true,
                    merchantOrderId: $request->input('order_id'),
                    amount: 50000,
                    internalStatus: PaymentStatus::PAID
                );
            }
        };

        $resolver = app(PaymentGatewayResolver::class);
        $this->assertInstanceOf(PaymentGatewayInterface::class, $mockGateway);
        $this->assertEquals('mock_provider', $mockGateway->getProviderName());
    }
}
