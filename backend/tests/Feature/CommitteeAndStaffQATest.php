<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\EventStation;

class CommitteeAndStaffQATest extends TestCase
{
    use RefreshDatabase;

    protected $organizer;
    protected $committee;
    protected $event;
    protected $station;
    protected $ticket;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->organizer = User::factory()->create(['role' => 'organizer']);
        $this->committee = User::factory()->create(['role' => 'committee']);

        $this->event = Event::factory()->create([
            'organizer_id' => $this->organizer->id,
            'pos_pin' => '123456',
            'status' => 'published',
            'start_date' => now()->subHours(1),
            'end_date' => now()->addDays(2),
            'is_attendance_open' => true
        ]);

        $this->station = EventStation::create([
            'event_id' => $this->event->id,
            'name' => 'Pintu Utama',
            'is_active' => true
        ]);

        $participant = User::factory()->create();

        $order = Order::create([
            'user_id' => $participant->id,
            'event_id' => $this->event->id,
            'status' => 'paid', // Must be paid
            'amount' => 0,
            'total_price' => 0,
            'order_id' => 'ORD-123'
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price' => 0,
        ]);

        $this->ticket = Ticket::create([
            'participant_id' => $participant->id,
            'order_item_id' => $orderItem->id,
            'status' => 'active',
            'ticket_code' => 'TCK-001',
            'qr_token' => 'TCK-001.hash',
            'attendee_name' => 'John Doe',
            'attendee_email' => 'john@doe.com'
        ]);
    }

    // ---------------------------------------------------------
    // F: STAFF FLOW (Unauthenticated Mobile Scanner usually)
    // ---------------------------------------------------------

    public function test_f1_staff_verify_pin()
    {
        // F1.1 Staff login dengan PIN (verify)
        $response = $this->postJson('/api/v1/staff/verify-pin', [
            'pin' => '123456'
        ]);
        $response->assertStatus(200);

        // F1.2 PIN salah
        $responseFail = $this->postJson('/api/v1/staff/verify-pin', [
            'pin' => 'wrong'
        ]);
        $responseFail->assertStatus(422);
    }

    public function test_f2_staff_scan_and_checkin()
    {
        // F2.2 Scan valid ticket
        $scanResp = $this->postJson('/api/v1/staff/scan', [
            'qr_string' => 'TCK-001', // controller does explode by '.'
            'post_id' => $this->station->id,
            'pos_pin' => '123456'
        ]);
        $scanResp->assertStatus(200);

        // F2.3 Scan duplicate ticket
        $scanDup = $this->postJson('/api/v1/staff/scan', [
            'qr_string' => 'TCK-001',
            'post_id' => $this->station->id,
            'pos_pin' => '123456'
        ]);
        $scanDup->assertStatus(409);

        // F2.4 Scan invalid ticket
        $scanInv = $this->postJson('/api/v1/staff/scan', [
            'qr_string' => 'INVALID-001',
            'post_id' => $this->station->id,
            'pos_pin' => '123456'
        ]);
        $scanInv->assertStatus(404);
    }

    public function test_f2_staff_manual_checkin()
    {
        // Create new ticket for manual checkin
        $participant2 = User::factory()->create();
        $order2 = Order::create([
            'user_id' => $participant2->id,
            'event_id' => $this->event->id,
            'status' => 'paid',
            'amount' => 0,
            'total_price' => 0,
            'order_id' => 'ORD-124'
        ]);
        $orderItem2 = OrderItem::create([
            'order_id' => $order2->id,
            'quantity' => 1,
            'price' => 0,
        ]);
        $ticket2 = Ticket::create([
            'participant_id' => $participant2->id,
            'order_item_id' => $orderItem2->id,
            'status' => 'active',
            'ticket_code' => 'TCK-002',
            'qr_token' => 'TCK-002.hash',
            'attendee_name' => 'Jane Doe',
            'attendee_email' => 'jane@doe.com'
        ]);

        // F2.5 Manual check-in search
        $searchResp = $this->getJson("/api/v1/staff/search-tickets?q=TCK-002&event_id={$this->event->id}&pos_pin=123456");
        $searchResp->assertStatus(200);

        // F2.5 Manual check-in
        $checkinResp = $this->postJson('/api/v1/staff/manual-checkin', [
            'ticket_id' => $ticket2->id,
            'post_id' => $this->station->id,
            'pos_pin' => '123456'
        ]);
        $checkinResp->assertStatus(200);
    }

    // ---------------------------------------------------------
    // E: COMMITTEE FLOW
    // ---------------------------------------------------------

    public function test_e1_committee_verify_pin()
    {
        $response = $this->actingAs($this->committee)->postJson('/api/committee/verify-pin', [
            'pin' => '123456'
        ]);
        $response->assertStatus(200);
    }

    public function test_e1_committee_scan_valid_ticket()
    {
        $scanResp = $this->actingAs($this->committee)->postJson('/api/committee/scan', [
            'qr_string' => 'TCK-001',
            'post_id' => $this->station->id,
            'pos_pin' => '123456'
        ]);
        $scanResp->assertStatus(200);
    }

    public function test_e1_committee_stats()
    {
        $statsResp = $this->actingAs($this->committee)->getJson("/api/committee/stats?event_id={$this->event->id}&post_id={$this->station->id}");
        $statsResp->assertStatus(200);
    }
}
