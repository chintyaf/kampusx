<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use App\Models\EventType;
use App\Models\Institution;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrganizerQATest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $organizer;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'role' => 'participant'
        ]);

        $this->organizer = User::factory()->create([
            'role' => 'organizer'
        ]);
        
        Category::create(['name' => 'Technology']);
        EventType::create(['name' => 'Workshop']);
        Institution::create([
            'name' => 'KampusX University',
            'type' => 'university'
        ]);
    }

    public function test_c1_apply_organizer()
    {
        $response = $this->actingAs($this->user)->postJson('/api/organizer-requests/apply', [
            'organization_name' => 'Tech Comm',
            'reason' => 'Ingin buat event tech',
            'portfolio_link' => 'http://example.com',
            'proof' => UploadedFile::fake()->image('proof.jpg')
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('organizer_requests', [
            'user_id' => $this->user->id,
            'status' => 'pending'
        ]);
    }

    public function test_c2_organizer_dashboard_access()
    {
        $response = $this->actingAs($this->user)->getJson('/api/organizer/events-list');
        $response->assertStatus(403);

        $response = $this->actingAs($this->organizer)->getJson('/api/organizer/events-list');
        $response->assertStatus(200);
    }

    public function test_c3_create_new_event()
    {
        $response = $this->actingAs($this->organizer)->postJson('/api/events', [
            'title' => 'Webinar Laravel',
            'category_id' => 1,
            'type_id' => 1,
            'description' => 'Belajar Laravel'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('events', [
            'title' => 'Webinar Laravel',
            'organizer_id' => $this->organizer->id,
            'status' => 'draft'
        ]);
    }

    protected function createDraftEvent(): Event
    {
        return Event::factory()->create([
            'organizer_id' => $this->organizer->id,
            'status' => 'draft'
        ]);
    }

    public function test_c4_update_event_general_info()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->postJson("/api/event-dashboard/{$event->id}/info-utama/update", [
            'title' => 'Webinar Laravel Updated',
            'description' => 'Updated desc',
            'timezone' => 'Asia/Jakarta'
        ]);
        
        $response->assertStatus(200);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Webinar Laravel Updated'
        ]);
    }

    public function test_c5_update_event_location_schedule()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->postJson("/api/event-dashboard/{$event->id}/info-utama/location", [
            'type' => 'online',
            'meeting_link' => 'https://zoom.us/j/123456789'
        ]);
        
        $response->assertStatus(200);
        $this->assertDatabaseHas('event_locations', [
            'event_id' => $event->id,
            'type' => 'online'
        ]);
    }

    public function test_c6_manage_event_session()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->postJson("/api/event-dashboard/{$event->id}/info-utama/session", [
            'startDate' => now()->format('Y-m-d'),
            'sessions' => [
                [
                    'id' => 'new-1', // fake UUID for new session
                    'title' => 'Opening',
                    'day' => 1,
                    'startTime' => '09:00',
                    'endTime' => '10:00',
                    'description' => 'Pembukaan'
                ]
            ]
        ]);
        
        $response->assertStatus(200);
        $this->assertDatabaseHas('event_sessions', [
            'event_id' => $event->id,
            'title' => 'Opening'
        ]);
    }

    public function test_c7_manage_event_tickets()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->postJson("/api/event-dashboard/{$event->id}/info-utama/tickets", [
            'tickets' => [
                [
                    'name' => 'Regular',
                    'type' => 'online',
                    'is_free' => true,
                    'capacity' => 100,
                    'sale_start' => now()->format('Y-m-d H:i:s'),
                    'sale_end' => now()->addDays(4)->format('Y-m-d H:i:s')
                ]
            ]
        ]);
        
        $response->assertStatus(200);
        $this->assertDatabaseHas('event_tickets', [
            'event_id' => $event->id,
            'name' => 'Regular',
            'type' => 'online'
        ]);
    }

    public function test_c8_publish_event()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->postJson("/api/events/{$event->id}/publish");
        $this->assertContains($response->status(), [200, 422]);
    }

    public function test_c9_event_participants_and_announcements()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->getJson("/api/event-dashboard/{$event->id}/daftar-peserta");
        $response->assertStatus(200);

        $response2 = $this->actingAs($this->organizer)->postJson("/api/organizer/events/{$event->id}/announcements", [
            'title' => 'Info Penting',
            'content' => 'Jangan lupa bawa laptop'
        ]);
        $response2->assertStatus(201);
    }

    public function test_c10_venue_qr_access()
    {
        $event = $this->createDraftEvent();
        $response = $this->actingAs($this->organizer)->getJson("/api/event-dashboard/{$event->id}/venue-qr");
        $response->assertStatus(200);
    }

    public function test_c11_post_event_materials()
    {
        $event = $this->createDraftEvent();
        $session = \App\Models\EventSession::create([
            'event_id' => $event->id,
            'title' => 'Sesi 1',
            'start_time' => '09:00',
            'end_time' => '10:00'
        ]);

        $response = $this->actingAs($this->organizer)->postJson("/api/event-dashboard/{$event->id}/post-event/sessions/{$session->id}/materials", [
            'type' => 'url',
            'name' => 'Video Youtube',
            'url' => 'http://youtube.com/watch?v=123'
        ]);
        
        $response->assertStatus(201);
    }
}
