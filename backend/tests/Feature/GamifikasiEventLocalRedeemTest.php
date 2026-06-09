<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Reward;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;

class GamifikasiEventLocalRedeemTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $event;
    protected $reward;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'participant']);
        $this->event = Event::factory()->create(['organizer_id' => $this->user->id]);

        // Setup local reward
        $this->reward = Reward::create([
            'event_id' => $this->event->id,
            'title' => 'Event Sticker Pack',
            'description' => 'Cool local event stickers.',
            'points_cost' => 50,
            'stock' => 10,
            'limit_per_user' => 3,
            'reward_type' => 'physical',
            'type' => 'local',
            'is_active' => true
        ]);
    }

    /**
     * Helper to award local points to the test user for the specific event.
     */
    protected function awardLocalPoints(int $amount)
    {
        PointTransaction::create([
            'user_id' => $this->user->id,
            'event_id' => $this->event->id,
            'activity_id' => null,
            'amount' => $amount,
            'type' => 'local',
            'description' => 'Award local points'
        ]);
    }

    // 1. Test getLocalRewards
    public function test_get_local_rewards()
    {
        $this->awardLocalPoints(80);

        $response = $this->actingAs($this->user)->getJson("/api/events/{$this->event->id}/local-rewards");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.local_balance', 80);
        $response->assertJsonCount(1, 'data.rewards');
    }

    // 2. Success redemption
    public function test_success_local_redemption()
    {
        $this->awardLocalPoints(100);

        $response = $this->actingAs($this->user)->postJson("/api/events/{$this->event->id}/local-rewards/redeem", [
            'reward_id' => $this->reward->id,
            'notes' => 'Size M'
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.new_balance', 50);

        // Assert stock decremented
        $this->assertEquals(9, $this->reward->fresh()->stock);

        // Assert database point transaction has negative entry
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $this->user->id,
            'event_id' => $this->event->id,
            'amount' => -50,
            'type' => 'local'
        ]);

        // Assert database redemption history has pending entry
        $this->assertDatabaseHas('redemption_history', [
            'user_id' => $this->user->id,
            'reward_id' => $this->reward->id,
            'points_spent' => 50,
            'status' => 'pending'
        ]);
    }

    // 3. Fail on insufficient balance
    public function test_insufficient_local_balance_fails()
    {
        $this->awardLocalPoints(20);

        $response = $this->actingAs($this->user)->postJson("/api/events/{$this->event->id}/local-rewards/redeem", [
            'reward_id' => $this->reward->id,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Saldo poin lokal Anda tidak mencukupi untuk event ini.');
    }

    // 4. Fail on out of stock
    public function test_out_of_stock_local_fails()
    {
        $this->awardLocalPoints(100);
        $this->reward->update(['stock' => 0]);

        $response = $this->actingAs($this->user)->postJson("/api/events/{$this->event->id}/local-rewards/redeem", [
            'reward_id' => $this->reward->id,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', 'Stok reward sudah habis.');
    }

    // 5. Access control
    public function test_guest_local_access_fails()
    {
        $response = $this->postJson("/api/events/{$this->event->id}/local-rewards/redeem", [
            'reward_id' => $this->reward->id,
        ]);

        $response->assertStatus(401);
    }
}
