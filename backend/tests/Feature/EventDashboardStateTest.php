<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Event;
use App\Models\EventSession;
use App\Models\User;
use Carbon\Carbon;

class EventDashboardStateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup user and authentication if needed
    }

    public function test_event_state_transitions()
    {
        // 1. Setup Event
        $startDate = Carbon::today()->addDays(1)->setTime(9, 0); // Tomorrow 09:00
        $endDate = Carbon::today()->addDays(2)->setTime(17, 0);  // Day after tomorrow 17:00

        $event = Event::factory()->create([
            'status' => 'published',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'views' => 100,
        ]);

        // Day 1 Session: 09:00 - 15:00
        EventSession::create([
            'event_id' => $event->id,
            'day_number' => 1,
            'start_time' => '09:00:00',
            'end_time' => '15:00:00',
            'title' => 'Day 1 Session',
        ]);

        // Day 2 Session: 10:00 - 16:00
        EventSession::create([
            'event_id' => $event->id,
            'day_number' => 2,
            'start_time' => '10:00:00',
            'end_time' => '16:00:00',
            'title' => 'Day 2 Session',
        ]);

        // --- SCENARIO 1: PUBLISHED (Before event starts) ---
        Carbon::setTestNow($startDate->copy()->subHours(2)); // Day 1 07:00
        
        $response = $this->getJson("/api/events/{$event->id}/dashboard-overview");
        $response->assertStatus(200);
        // Wait, if it's protected by auth, we need to bypass or act as organizer.
        // Let's assume we can test the logic directly or through API.
    }
}
