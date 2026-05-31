<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Support\Str;

class MemberPesertaQATest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $organizer;
    protected $event;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create(['role' => 'user']);
        $this->organizer = User::factory()->create(['role' => 'organizer']);
        
        $this->event = Event::factory()->create([
            'organizer_id' => $this->organizer->id,
            'title' => 'Member Test Event',
            'status' => 'published',
        ]);
        
        // Add event ticket capacity so checkout works after our fix
        \App\Models\EventTicket::create([
            'event_id' => $this->event->id,
            'name' => 'Free Ticket',
            'type' => 'offline',
            'is_free' => true,
            'price' => 0,
            'capacity' => 100,
        ]);
    }

    // B2: Explore Events
    public function test_b2_explore_events()
    {
        $response = $this->getJson('/api/events/explore');
        $response->assertStatus(200);
        $this->assertArrayHasKey('data', $response->json());
    }

    public function test_b2_search_events()
    {
        $response = $this->getJson('/api/events/explore?search=Member');
        $response->assertStatus(200);
    }

    // B3: Event Detail
    public function test_b3_event_detail()
    {
        $response = $this->getJson("/api/events/{$this->event->id}");
        $response->assertStatus(200);
    }

    // B4: Checkout Gratis
    public function test_b4_checkout_gratis()
    {
        $response = $this->actingAs($this->user)->postJson('/api/checkout', [
            'event_id' => $this->event->id,
            'quantity' => 1,
            'name' => 'Budi',
            'email' => 'budi@test.com',
            'phone' => '08123456789'
        ]);
        
        $response->assertStatus(201);
        $this->assertEquals('success', $response->json('status'));
        $this->assertDatabaseHas('orders', ['user_id' => $this->user->id, 'event_id' => $this->event->id]);
    }

    // B5: My Tickets
    public function test_b5_my_tickets()
    {
        // Give user a ticket
        $order = Order::create([
            'order_id' => 'ORD-TEST-1234',
            'user_id' => $this->user->id,
            'event_id' => $this->event->id,
            'amount' => 0,
            'total_price' => 0,
            'status' => 'paid',
        ]);
        $item = OrderItem::create(['order_id' => $order->id, 'quantity' => 1, 'price' => 0]);
        Ticket::create([
            'participant_id' => $this->user->id,
            'order_item_id' => $item->id,
            'attendee_name' => 'Budi',
            'attendee_email' => 'budi@test.com',
            'ticket_code' => 'TCK-1234',
            'qr_token' => Str::uuid()->toString(),
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/my-tickets');
        $response->assertStatus(200);
        // Ensure the ticket is in the response
        $data = $response->json();
        $this->assertTrue(count($data) > 0 || (isset($data['data']) && count($data['data']) > 0));
    }

    // B8: Materials & Announcements in Event Space
    public function test_b8_event_space_materials()
    {
        // Beri user tiket agar bisa akses materials
        $order = Order::create([
            'order_id' => 'ORD-TEST-MAT',
            'user_id' => $this->user->id,
            'event_id' => $this->event->id,
            'amount' => 0,
            'total_price' => 0,
            'status' => 'paid',
        ]);
        $item = OrderItem::create(['order_id' => $order->id, 'quantity' => 1, 'price' => 0]);
        Ticket::create([
            'participant_id' => $this->user->id,
            'order_item_id' => $item->id,
            'attendee_name' => 'Budi',
            'attendee_email' => 'budi@test.com',
            'ticket_code' => 'TCK-MAT',
            'qr_token' => \Illuminate\Support\Str::uuid()->toString(),
        ]);

        $response = $this->actingAs($this->user)->getJson("/api/events/{$this->event->id}/materials");
        $response->assertStatus(200);
    }

    // B9: Bookmarks
    public function test_b9_toggle_bookmark()
    {
        $response = $this->actingAs($this->user)->postJson("/api/v1/events/{$this->event->id}/bookmark");
        $response->assertStatus(200);
        $this->assertEquals('Event berhasil disimpan ke bookmark.', $response->json('message'));
        
        $responseList = $this->actingAs($this->user)->getJson('/api/v1/bookmarks');
        $responseList->assertStatus(200);
    }

    // B9: Notifications
    public function test_b9_notifications()
    {
        $response = $this->actingAs($this->user)->getJson('/api/notifications');
        $response->assertStatus(200);
    }
}
