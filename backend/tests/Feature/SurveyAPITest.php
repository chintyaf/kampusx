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

        $survey->questions()->create([
            'type' => 'text',
            'label' => 'Sample Question',
            'is_required' => true,
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
        $event = Event::factory()->create([
            'organizer_id' => $organizer->id,
            'status' => 'published',
        ]);

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

    /**
     * Test custom survey creation with session, select type question, participant retrieval, submission and analytics check.
     */
    public function test_custom_survey_flow(): void
    {
        // 1. Create organizer and event
        $organizer = User::factory()->create(['role' => 'organizer']);
        $event = Event::factory()->create([
            'organizer_id' => $organizer->id,
            'status' => 'completed',
        ]);

        // 2. Create custom survey via SurveyFormController API
        $response = $this->actingAs($organizer)
            ->postJson("/api/event-dashboard/{$event->id}/survey-form", [
                'title' => 'Session Feedback Survey',
                'description' => 'Give us your honest opinion.',
                'session' => 'Sesi 1 - Intro to Programming',
                'is_active' => true,
            ]);

        $response->assertStatus(201);
        $surveyId = $response->json('data.id');

        $this->assertEquals('Sesi 1 - Intro to Programming', $response->json('data.session'));

        // 3. Sync questions including 'select' type and 'rating' type
        $syncResponse = $this->actingAs($organizer)
            ->putJson("/api/event-dashboard/{$event->id}/survey-form/{$surveyId}/questions", [
                'questions' => [
                    [
                        'type' => 'select',
                        'label' => 'What is your background?',
                        'options' => ['IT', 'Business', 'Design'],
                        'is_required' => true,
                    ],
                    [
                        'type' => 'rating',
                        'label' => 'Rate this event',
                        'is_required' => true,
                    ],
                    [
                        'type' => 'rating',
                        'label' => 'Rate the speaker',
                        'is_required' => false,
                    ],
                ]
            ]);

        $syncResponse->assertStatus(200);

        // Fetch questions from DB
        $survey = Survey::with('questions')->find($surveyId);
        $this->assertCount(3, $survey->questions);
        $this->assertEquals('select', $survey->questions[0]->type);
        $this->assertEquals('rating', $survey->questions[1]->type);

        // 4. Create participant with ticket
        $participant = User::factory()->create(['role' => 'participant']);
        $order = \App\Models\Order::create([
            'order_id' => 'ORD-12345',
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'amount' => 0,
            'total_price' => 0,
            'status' => 'completed',
        ]);
        $orderItem = \App\Models\OrderItem::create([
            'order_id' => $order->id,
            'price' => 0,
            'quantity' => 1,
        ]);
        $ticket = Ticket::create([
            'order_item_id' => $orderItem->id,
            'participant_id' => $participant->id,
            'ticket_code' => 'TKT-123456',
            'attendee_name' => $participant->name,
            'attendee_email' => $participant->email,
            'qr_token' => 'qr_token_placeholder',
            'status' => 'used',
        ]);

        \App\Models\CertificateTemplate::create([
            'event_id' => $event->id,
            'background_path' => 'templates/bg.jpg',
            'title' => 'Sertifikat Kehadiran',
        ]);

        // 5. Participant fetches survey details
        $detailsResponse = $this->actingAs($participant)
            ->getJson("/api/events/{$event->id}/survey");

        $detailsResponse->assertStatus(200);
        $this->assertEquals('Session Feedback Survey', $detailsResponse->json('data.custom_survey.title'));
        $this->assertEquals('Sesi 1 - Intro to Programming', $detailsResponse->json('data.custom_survey.session'));

        // 6. Participant submits responses
        $submitResponse = $this->actingAs($participant)
            ->postJson("/api/events/{$event->id}/survey", [
                'survey_id' => $surveyId,
                'answers' => [
                    [
                        'question_id' => $survey->questions[0]->id,
                        'value' => 'IT',
                    ],
                    [
                        'question_id' => $survey->questions[1]->id,
                        'value' => '5',
                    ],
                    [
                        'question_id' => $survey->questions[2]->id,
                        'value' => '4',
                    ]
                ]
            ]);

        $submitResponse->assertStatus(200);

        // Verify points were awarded to the participant
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'amount' => 30, // Default fallback
            'type' => 'local',
        ]);

        $this->assertDatabaseHas('local_member_points', [
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'points_balance' => 30,
        ]);

        // 7. Organizer fetches analytics and checks dynamic rating averages
        $analyticsResponse = $this->actingAs($organizer)
            ->getJson("/api/event-dashboard/{$event->id}/survey-analytics");

        $analyticsResponse->assertStatus(200);
        $analyticsResponse->assertJsonPath('data.total_responses', 1);
        $analyticsResponse->assertJsonPath('data.avg_rating', 5);
        $analyticsResponse->assertJsonPath('data.avg_speaker_rating', 4);
        $analyticsResponse->assertJsonPath('data.avg_material_rating', 0);
        $analyticsResponse->assertJsonPath('data.satisfaction_rate', 100);
    }
}
