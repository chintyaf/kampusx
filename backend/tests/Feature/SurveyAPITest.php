<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\Survey;
use App\Models\SurveyResponse;

class SurveyAPITest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that event organizer can retrieve survey details without having a ticket.
     */
    public function test_organizer_can_retrieve_survey_details_without_ticket(): void
    {
        // 1. Create event organizer
        $organizer = User::factory()->create([
            'role' => 'organizer',
        ]);

        // 2. Create event owned by this organizer
        $event = Event::factory()->create([
            'organizer_id' => $organizer->id,
        ]);

        // 3. Create a survey for this event
        $survey = Survey::create([
            'event_id' => $event->id,
            'title' => 'Test Event Survey',
            'description' => 'This is a test description.',
            'is_active' => true,
        ]);

        // 4. Send API request as organizer
        $response = $this->actingAs($organizer)
            ->getJson("/api/events/{$event->id}/survey");

        // 5. Verify successful response and is_preview_only flag
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'has_ticket' => false,
                'is_preview_only' => true,
                'ticket_code' => 'TKT-PREVIEW',
            ]
        ]);
    }

    /**
     * Test that non-organizer and non-participant users are blocked from retrieving survey details.
     */
    public function test_stranger_cannot_retrieve_survey_details(): void
    {
        // 1. Create event organizer
        $organizer = User::factory()->create(['role' => 'organizer']);

        // 2. Create event
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);

        // 3. Create another random user (not participant, not organizer)
        $stranger = User::factory()->create(['role' => 'participant']);

        // 4. Send API request as stranger
        $response = $this->actingAs($stranger)
            ->getJson("/api/events/{$event->id}/survey");

        // 5. Verify they are blocked
        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'status' => 'error',
            'message' => 'Anda tidak terdaftar sebagai peserta pada event ini.',
        ]);
    }

    /**
     * Test that event organizer is blocked from submitting a survey response.
     */
    public function test_organizer_cannot_submit_survey(): void
    {
        // 1. Create organizer
        $organizer = User::factory()->create(['role' => 'organizer']);

        // 2. Create event
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);

        // 3. Create a survey for the event
        $survey = Survey::create([
            'event_id' => $event->id,
            'title' => 'Test Custom Survey',
            'is_active' => true,
        ]);

        // 4. Send submission request as organizer
        $response = $this->actingAs($organizer)
            ->postJson("/api/events/{$event->id}/survey", [
                'survey_id' => $survey->id,
                'answers' => [],
            ]);

        // 5. Verify they are blocked
        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'status' => 'error',
            'message' => 'Penyelenggara acara tidak dapat mengirimkan jawaban survei.',
        ]);
    }
}
