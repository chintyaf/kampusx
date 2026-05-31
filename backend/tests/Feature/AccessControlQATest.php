<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;

class AccessControlQATest extends TestCase
{
    use RefreshDatabase;

    protected $member;
    protected $organizer1;
    protected $organizer2;
    protected $admin;
    protected $eventOrg1;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->member = User::factory()->create(['role' => 'user']);
        $this->organizer1 = User::factory()->create(['role' => 'organizer']);
        $this->organizer2 = User::factory()->create(['role' => 'organizer']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $this->eventOrg1 = Event::factory()->create([
            'organizer_id' => $this->organizer1->id,
            'status' => 'published'
        ]);
    }

    public function test_g1_member_akses_organizer_route()
    {
        // Member mencoba akses endpoint list event organizer
        $response = $this->actingAs($this->member)->getJson('/api/organizer/events-list');
        $response->assertStatus(403);
    }

    public function test_g2_member_akses_admin_route()
    {
        // Member mencoba akses endpoint admin
        $response = $this->actingAs($this->member)->getJson('/api/admin/dashboard-overview');
        $response->assertStatus(403);
    }

    public function test_g3_organizer_akses_event_lain()
    {
        // Organizer 2 mencoba akses event dashboard milik organizer 1
        $response = $this->actingAs($this->organizer2)->getJson("/api/event-dashboard/{$this->eventOrg1->id}/overview");
        $response->assertStatus(403); // Middleware CheckEventOrganizer should block this
    }

    public function test_g6_guest_akses_organizer_route()
    {
        // Guest (belum login) akses organizer route
        $response = $this->getJson('/api/organizer/events-list');
        $response->assertStatus(401); // Unauthorized
    }

    public function test_g7_guest_akses_admin_route()
    {
        // Guest (belum login) akses admin route
        $response = $this->getJson('/api/admin/dashboard-overview');
        $response->assertStatus(401);
    }
}
