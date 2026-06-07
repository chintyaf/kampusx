<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Reward;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;

class GamifikasiEventRedeemTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $reward;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup user
        $this->user = User::factory()->create(['role' => 'participant']);

        // Setup global reward
        $this->reward = Reward::create([
            'event_id' => null,
            'title' => 'Official Hoodie',
            'description' => 'Cool Platform Hoodie.',
            'points_cost' => 100,
            'stock' => 5,
            'limit_per_user' => 2,
            'reward_type' => 'physical',
            'type' => 'global',
            'is_active' => true
        ]);
    }

    /**
     * Helper to award global points to the test user.
     */
    protected function awardGlobalPoints(int $amount)
    {
        PointTransaction::create([
            'user_id' => $this->user->id,
            'event_id' => null,
            'activity_id' => null,
            'amount' => $amount,
            'type' => 'global',
            'description' => 'Award global points'
        ]);
    }

    // 1. Success redemption
    public function test_success_redemption()
    {
        // Award 150 points (price of reward is 100)
        $this->awardGlobalPoints(150);

        $response = $this->actingAs($this->user)->postJson('/api/global-rewards/redeem', [
            'reward_id' => $this->reward->id,
            'notes' => 'Size L, Red color'
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.new_balance', 50);

        // Assert reward stock was decremented from 5 to 4
        $this->assertEquals(4, $this->reward->fresh()->stock);

        // Assert point transaction was recorded with negative amount
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $this->user->id,
            'amount' => -100,
            'type' => 'global',
        ]);

        // Assert redemption history was logged with status pending
        $this->assertDatabaseHas('redemption_history', [
            'user_id' => $this->user->id,
            'reward_id' => $this->reward->id,
            'points_spent' => 100,
            'status' => 'pending',
            'notes' => 'Size L, Red color'
        ]);
    }

    // 2. Fail when balance is insufficient
    public function test_insufficient_balance_fails()
    {
        // Award only 50 points (price of reward is 100)
        $this->awardGlobalPoints(50);

        $response = $this->actingAs($this->user)->postJson('/api/global-rewards/redeem', [
            'reward_id' => $this->reward->id,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Saldo poin global Anda tidak mencukupi.');

        // Stock should remain unchanged
        $this->assertEquals(5, $this->reward->fresh()->stock);
    }

    // 3. Fail when stock is out (0)
    public function test_out_of_stock_fails()
    {
        // Award 200 points
        $this->awardGlobalPoints(200);

        // Make reward out of stock
        $this->reward->update(['stock' => 0]);

        $response = $this->actingAs($this->user)->postJson('/api/global-rewards/redeem', [
            'reward_id' => $this->reward->id,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Stok reward sudah habis.');
    }

    // 4. Access controls (Guest access fails)
    public function test_guest_access_fails()
    {
        $response = $this->postJson('/api/global-rewards/redeem', [
            'reward_id' => $this->reward->id,
        ]);

        $response->assertStatus(401);
    }

    // 5. Test ledger endpoint
    public function test_ledger_endpoint()
    {
        $this->awardGlobalPoints(150);
        $this->awardGlobalPoints(-50);

        $response = $this->actingAs($this->user)->getJson('/api/profile/ledger');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.global_balance', 100);
        $response->assertJsonCount(2, 'data.transactions');
    }

    // 6. Test global rewards list endpoint
    public function test_global_rewards_list_endpoint()
    {
        $response = $this->actingAs($this->user)->getJson('/api/global-rewards');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'data');
    }
}
