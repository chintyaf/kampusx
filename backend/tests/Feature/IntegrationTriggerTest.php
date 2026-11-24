<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\ExternalAchievement;
use App\Models\IntegrationLog;
use App\Models\SoulboundToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class IntegrationTriggerTest extends TestCase
{
    use DatabaseTransactions;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::firstOrCreate(
            ['email' => 'test.student.srl@example.com'],
            [
                'name'     => 'Test Student SRL',
                'password' => bcrypt('password'),
                'role'     => 'participant',
                'points'   => 450,
                'tier'     => 'Silver',
            ]
        );
    }

    public function test_receive_achievement_awards_points_and_creates_pending_credential()
    {
        $uniqueRef = 'TEST-SRL-' . uniqid();

        $payload = [
            'external_reference' => $uniqueRef,
            'student_id'         => $this->student->id,
            'achievement_type'   => 'MICROLEARNING_COMPLETION',
            'achievement_name'   => 'Fullstack Microservices & Cloud Engineering',
            'description'        => 'Successfully completed the learning program',
            'score'              => 95,
            'completed_at'       => '2026-11-11T10:00:00',
        ];

        $response = $this->postJson('/api/integrations/achievements', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status'  => 'processed',
        ]);

        // Cek external_achievements tersimpan
        $this->assertDatabaseHas('external_achievements', [
            'external_reference' => $uniqueRef,
            'user_id'            => $this->student->id,
        ]);

        // Cek integration_logs tersimpan
        $this->assertDatabaseHas('integration_logs', [
            'external_reference' => $uniqueRef,
            'status'             => 'SUCCESS',
        ]);

        // Cek Soulbound Token berstatus PENDING dibuat
        $this->assertDatabaseHas('soulbound_tokens', [
            'user_id'         => $this->student->id,
            'credential_code' => $uniqueRef,
            'minting_status'  => 'PENDING',
        ]);
    }

    public function test_prevents_duplicate_achievement_with_same_external_reference()
    {
        $uniqueRef = 'TEST-SRL-DUP-' . uniqid();

        $payload = [
            'external_reference' => $uniqueRef,
            'student_id'         => $this->student->id,
            'achievement_type'   => 'MICROLEARNING_COMPLETION',
            'achievement_name'   => 'Advanced Cloud Architecture',
            'score'              => 90,
        ];

        // First call: Success
        $res1 = $this->postJson('/api/integrations/achievements', $payload);
        $res1->assertStatus(200);

        // Second call with same reference: Must be rejected with 409 Conflict
        $res2 = $this->postJson('/api/integrations/achievements', $payload);
        $res2->assertStatus(409);
        $res2->assertJson([
            'success' => false,
            'status'  => 'duplicate',
        ]);
    }

    public function test_demo_trigger_simulation_endpoint()
    {
        $response = $this->postJson('/api/integrations/demo-trigger');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status'  => 'processed',
        ]);
    }
}
