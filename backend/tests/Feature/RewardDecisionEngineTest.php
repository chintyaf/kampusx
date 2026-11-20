<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\RewardCatalog;
use App\Models\RewardDecisionLog;
use App\Models\RewardFeedback;
use App\Services\Bandit\RewardDecisionEngine;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RewardDecisionEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected User $student;
    protected RewardDecisionEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = app(RewardDecisionEngine::class);

        $this->student = User::firstOrCreate(
            ['email' => 'test.student.bandit@example.com'],
            [
                'name'     => 'Test Student Bandit',
                'password' => bcrypt('password'),
                'role'     => 'participant',
                'points'   => 800,
                'tier'     => 'Gold',
            ]
        );
    }

    public function test_recommend_reward_with_thompson_sampling_and_disco_constraints()
    {
        $decision = $this->engine->selectOptimalReward($this->student, null, 50000.0);

        $this->assertNotNull($decision);
        $this->assertArrayHasKey('selected_arm', $decision);
        $this->assertArrayHasKey('sampling_score', $decision);
        $this->assertArrayHasKey('decision_reason', $decision);
        $this->assertArrayHasKey('decision_log_id', $decision);
        $this->assertEquals('allocated', $decision['allocation_status']);

        // Pastikan tersimpan di reward_decision_logs
        $this->assertDatabaseHas('reward_decision_logs', [
            'id'           => $decision['decision_log_id'],
            'user_id'      => $this->student->id,
            'selected_arm' => $decision['selected_arm'],
        ]);
    }

    public function test_record_feedback_updates_database_and_prevents_duplicate_feedback()
    {
        $decision = $this->engine->selectOptimalReward($this->student, null, 50000.0);
        $logId = $decision['decision_log_id'];

        // Rekam feedback pertama: claimed
        $res1 = $this->engine->recordFeedback($logId, $this->student, 'claimed');
        $this->assertTrue($res1['success']);
        $this->assertEquals('recorded', $res1['status']);

        $this->assertDatabaseHas('reward_feedbacks', [
            'decision_log_id' => $logId,
            'action'          => 'claimed',
            'is_converted'    => true,
        ]);

        // Rekam feedback kedua dengan aksi yang sama harus ditolak (anti duplicate update)
        $res2 = $this->engine->recordFeedback($logId, $this->student, 'claimed');
        $this->assertFalse($res2['success']);
        $this->assertEquals('duplicate', $res2['status']);
    }

    public function test_rewards_api_endpoints()
    {
        // 1. Catalog list
        $catalogRes = $this->getJson('/api/rewards');
        $catalogRes->assertStatus(200);
        $catalogRes->assertJsonStructure(['success', 'data']);

        // 2. Recommend POST
        $recommendRes = $this->actingAs($this->student)->postJson('/api/rewards/recommend', [
            'base_price' => 50000,
        ]);
        $recommendRes->assertStatus(200);
        $recommendRes->assertJsonStructure([
            'success',
            'data' => [
                'decision_log_id',
                'selected_arm',
                'reward',
                'decision_reason',
                'sampling_score',
            ]
        ]);

        // 3. Decision logs GET
        $logsRes = $this->actingAs($this->student)->getJson('/api/rewards/decision-logs');
        $logsRes->assertStatus(200);
        $logsRes->assertJsonStructure(['success', 'data']);
    }
}
