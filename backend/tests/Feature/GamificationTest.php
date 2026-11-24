<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\PointTransaction;
use App\Models\Reward;
use App\Models\RedemptionHistory;
use App\Models\StudentBadge;
use App\Models\User;
use App\Services\Gamification\GamificationService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test Suite: Multi-Tier Gamification & Reward Credits
 *
 * Verifikasi:
 * - Global Points tidak berkurang saat tukar reward (tier tidak turun)
 * - Reward Credits adalah saldo spendable terpisah
 * - Anti-duplikasi achievement
 * - Ekspirasi Reward Credits
 * - Concurrent redemption (tidak negatif)
 * - Dashboard konsisten setelah refresh
 */
class GamificationTest extends TestCase
{
    use DatabaseTransactions;

    private GamificationService $svc;

    protected function setUp(): void
    {
        parent::setUp();
        $this->svc = app(GamificationService::class);
        $this->seedBadges();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function makeParticipant(int $points = 0, int $credits = 0, string $tier = 'Silver'): User
    {
        return User::factory()->create([
            'role'           => 'participant',
            'points'         => $points,
            'tier'           => $tier,
            'reward_credits' => $credits,
        ]);
    }

    private function makeGlobalReward(int $cost, int $stock = 10): Reward
    {
        return Reward::factory()->create([
            'event_id'    => null,
            'type'        => 'global',
            'is_active'   => true,
            'points_cost' => $cost,
            'stock'       => $stock,
            'reward_type' => 'digital',
        ]);
    }

    private function seedBadges(): void
    {
        $badges = [
            ['code' => 'FIRST_STEP',       'name' => 'First Step',       'criteria' => 'Ikuti 1 event',  'is_active' => true, 'description' => '', 'icon' => '', 'category' => 'event'],
            ['code' => 'ACTIVE_STUDENT',   'name' => 'Active Student',   'criteria' => 'Ikuti 5 event',  'is_active' => true, 'description' => '', 'icon' => '', 'category' => 'event'],
            ['code' => 'KNOWLEDGE_SEEKER', 'name' => 'Knowledge Seeker', 'criteria' => '5 microlearning','is_active' => true, 'description' => '', 'icon' => '', 'category' => 'learning'],
            ['code' => 'PERFECT_SCORE',    'name' => 'Perfect Score',    'criteria' => 'Nilai 100',      'is_active' => true, 'description' => '', 'icon' => '', 'category' => 'learning'],
            ['code' => 'EVENT_ENTHUSIAST', 'name' => 'Event Enthusiast', 'criteria' => 'Ikuti 10 event', 'is_active' => true, 'description' => '', 'icon' => '', 'category' => 'event'],
        ];
        foreach ($badges as $b) {
            Badge::firstOrCreate(['code' => $b['code']], $b);
        }
    }

    // ─── TC-G01: 499 poin + 1 poin → naik ke Gold ─────────────────────────

    public function test_tc_g01_499_points_plus_1_upgrades_to_gold(): void
    {
        $user = $this->makeParticipant(499);

        $result = $this->svc->awardPoints($user, 1, 'Test aktivitas', 'general', 'TC_G01_REF');

        $this->assertTrue($result['success']);
        $this->assertEquals(500, $result['total_points']);
        $this->assertEquals('Gold', $result['current_tier']);
        $this->assertEquals('Silver', $result['previous_tier']);
        $this->assertTrue($result['tier_upgraded']);

        $user->refresh();
        $this->assertEquals('Gold', $user->tier);
        $this->assertEquals(500, $user->points);
    }

    // ─── TC-G02: 999 poin + 1 poin → naik ke Platinum ────────────────────

    public function test_tc_g02_999_points_plus_1_upgrades_to_platinum(): void
    {
        $user = $this->makeParticipant(999, 0, 'Gold');

        $result = $this->svc->awardPoints($user, 1, 'Test aktivitas', 'general', 'TC_G02_REF');

        $this->assertEquals(1000, $result['total_points']);
        $this->assertEquals('Platinum', $result['current_tier']);
        $this->assertTrue($result['tier_upgraded']);
    }

    // ─── TC-G03: Achievement sama dikirim 2x → anti-duplikasi ─────────────

    public function test_tc_g03_duplicate_achievement_rejected(): void
    {
        $user = $this->makeParticipant(100);

        $r1 = $this->svc->awardPoints($user, 50, 'Hadir Event', 'general', 'EVENT_ATTEND_42');
        $this->assertTrue($r1['success']);
        $this->assertEquals('awarded', $r1['status']);

        $r2 = $this->svc->awardPoints($user, 50, 'Hadir Event', 'general', 'EVENT_ATTEND_42');
        $this->assertFalse($r2['success']);
        $this->assertEquals('duplicate', $r2['status']);

        // Poin hanya bertambah sekali
        $user->refresh();
        $this->assertEquals(150, $user->points);
    }

    // ─── TC-G04: Tukar reward TIDAK mengurangi Global Points (tier tetap) ─

    public function test_tc_g04_reward_redemption_does_not_reduce_global_points(): void
    {
        $user   = $this->makeParticipant(500, 200, 'Gold');
        $reward = $this->makeGlobalReward(100);

        $beforeGlobalPoints = $user->points;

        $response = $this->actingAs($user)->postJson('/api/global-rewards/redeem', [
            'reward_id' => $reward->id,
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $user->refresh();

        // Global Points TIDAK berkurang → tier TIDAK turun
        $this->assertEquals($beforeGlobalPoints, $user->points, 'Global Points harus tetap sama setelah redeem');
        $this->assertEquals('Gold', $user->tier, 'Tier tidak boleh turun setelah redeem');

        // Reward Credits berkurang sebesar cost
        $this->assertEquals(100, $user->reward_credits, 'Reward Credits harus berkurang 100');

        // redemption_history tercatat
        $this->assertDatabaseHas('redemption_history', [
            'user_id'   => $user->id,
            'reward_id' => $reward->id,
            'status'    => 'pending',
        ]);
    }

    // ─── TC-G05: Reward Credits expired tidak bisa digunakan ──────────────

    public function test_tc_g05_expired_credits_cannot_be_used(): void
    {
        $user = $this->makeParticipant(0, 0);

        // Simulasi kredit yang sudah expired
        PointTransaction::create([
            'user_id'     => $user->id,
            'amount'      => 200,
            'type'        => 'credit',
            'description' => 'Test kredit expired [REF:EXPIRED_REF]',
            'expires_at'  => now()->subDay(),
            'is_expired'  => false,
        ]);
        $user->reward_credits = 200;
        $user->save();

        // Jalankan expiry
        $expired = $this->svc->expireCredits();
        $this->assertEquals(200, $expired);

        $user->refresh();
        $this->assertEquals(0, $user->reward_credits, 'Saldo harus 0 setelah expired');

        // Coba redeem → harus gagal karena saldo 0
        $reward = $this->makeGlobalReward(100);
        $response = $this->actingAs($user)->postJson('/api/global-rewards/redeem', [
            'reward_id' => $reward->id,
        ]);
        $response->assertStatus(400)->assertJsonFragment(['success' => false]);
    }

    // ─── TC-G06: Saldo Reward Credits tidak boleh negatif ─────────────────

    public function test_tc_g06_reward_credits_cannot_go_negative(): void
    {
        $user   = $this->makeParticipant(500, 50, 'Gold'); // hanya 50 credits
        $reward = $this->makeGlobalReward(100);             // butuh 100 credits

        $response = $this->actingAs($user)->postJson('/api/global-rewards/redeem', [
            'reward_id' => $reward->id,
        ]);

        $response->assertStatus(400)->assertJsonFragment(['success' => false]);

        $user->refresh();
        $this->assertEquals(50, $user->reward_credits, 'Saldo tidak boleh berubah');
        $this->assertEquals(500, $user->points, 'Global Points tidak boleh berubah');
    }

    // ─── TC-G07: Concurrent redemption tidak menyebabkan saldo negatif ────

    public function test_tc_g07_concurrent_redemption_safe(): void
    {
        $user   = $this->makeParticipant(500, 100, 'Gold');
        $reward = $this->makeGlobalReward(100, 1); // stok hanya 1

        $results = [];
        for ($i = 0; $i < 2; $i++) {
            try {
                DB::transaction(function () use ($user, $reward, &$results) {
                    $lockedUser   = User::lockForUpdate()->find($user->id);
                    $lockedReward = Reward::lockForUpdate()->find($reward->id);

                    if ($lockedUser->reward_credits < $lockedReward->points_cost) {
                        $results[] = 'insufficient';
                        return;
                    }
                    if ($lockedReward->stock !== null && $lockedReward->stock <= 0) {
                        $results[] = 'out_of_stock';
                        return;
                    }

                    $lockedUser->spendRewardCredits($lockedReward->points_cost, 'Concurrent test');
                    $lockedReward->decrement('stock');
                    $results[] = 'success';
                });
            } catch (\Exception $e) {
                $results[] = 'error';
            }
        }

        $user->refresh();
        $this->assertGreaterThanOrEqual(0, $user->reward_credits, 'Saldo tidak boleh negatif');
        $this->assertLessThanOrEqual(1, count(array_filter($results, fn($r) => $r === 'success')), 'Maksimal 1 sukses');
    }

    // ─── TC-G08: Dashboard konsisten setelah refresh ──────────────────────

    public function test_tc_g08_dashboard_consistent_after_refresh(): void
    {
        $user = $this->makeParticipant(650, 150, 'Gold');

        $summary1 = $this->svc->getDashboardSummary($user);
        $summary2 = $this->svc->getDashboardSummary($user);

        $this->assertEquals($summary1['student']['points'],         $summary2['student']['points']);
        $this->assertEquals($summary1['student']['reward_credits'], $summary2['student']['reward_credits']);
        $this->assertEquals($summary1['student']['tier'],           $summary2['student']['tier']);
        $this->assertEquals('Gold', $summary1['tier_progress']['current_tier']);
        $this->assertEquals(350, $summary1['tier_progress']['points_needed']); // 1000 - 650
    }

    // ─── TC-G09: addRewardCredits idempoten (sama referenceKey 2x) ─────────

    public function test_tc_g09_add_reward_credits_idempotent(): void
    {
        $user = $this->makeParticipant(0, 0);

        $r1 = $user->addRewardCredits(50, 'Test aktivitas', 'REF_IDEM_01');
        $this->assertTrue($r1['success']);
        $this->assertEquals(50, $r1['new_balance']);

        $r2 = $user->addRewardCredits(50, 'Test aktivitas', 'REF_IDEM_01');
        $this->assertFalse($r2['success']);
        $this->assertTrue($r2['duplicate']);

        $user->refresh();
        $this->assertEquals(50, $user->reward_credits, 'Hanya 1x diberikan');
    }

    // ─── TC-G10: Global Rewards list menampilkan credit_balance & can_afford ─

    public function test_tc_g10_global_rewards_list_shows_credit_balance(): void
    {
        $user = $this->makeParticipant(500, 80, 'Gold');
        $this->makeGlobalReward(50);
        $this->makeGlobalReward(100);

        $response = $this->actingAs($user)->getJson('/api/global-rewards');

        $response->assertStatus(200)
            ->assertJsonFragment(['credit_balance' => 80])
            ->assertJsonStructure(['success', 'credit_balance', 'data']);

        foreach ($response->json('data') as $item) {
            $expected = $item['points_cost'] <= 80;
            $this->assertEquals($expected, $item['can_afford'],
                "can_afford salah untuk reward cost={$item['points_cost']}");
        }
    }

    // ─── TC-G11: Gamification Dashboard API returns real metrics ───────────

    public function test_tc_g11_dashboard_api_returns_real_metrics(): void
    {
        $user = $this->makeParticipant(750, 120, 'Gold');

        $response = $this->actingAs($user)->getJson('/api/gamification/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.student.points', 750)
            ->assertJsonPath('data.student.reward_credits', 120)
            ->assertJsonPath('data.student.tier', 'Gold')
            ->assertJsonPath('data.tier_progress.current_tier', 'Gold')
            ->assertJsonPath('data.tier_progress.next_tier', 'Platinum')
            ->assertJsonPath('data.tier_progress.points_needed', 250);
    }

    // ─── TC-G12: Tier Progress API returns consistent calculations ─────────

    public function test_tc_g12_tier_progress_api(): void
    {
        $user = $this->makeParticipant(300, 50, 'Silver');

        $response = $this->actingAs($user)->getJson('/api/gamification/tier-progress');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.current_tier', 'Silver')
            ->assertJsonPath('data.current_points', 300)
            ->assertJsonPath('data.next_tier', 'Gold')
            ->assertJsonPath('data.points_needed', 200)
            ->assertJsonPath('data.progress_percent', 60);
    }

    // ─── TC-G13: Leaderboard API returns sorted participant ranks ──────────

    public function test_tc_g13_leaderboard_api_returns_sorted_ranks(): void
    {
        $userA = $this->makeParticipant(1200, 0, 'Platinum');
        $userB = $this->makeParticipant(800, 0, 'Gold');
        $userC = $this->makeParticipant(200, 0, 'Silver');

        $response = $this->getJson('/api/leaderboard?timeframe=bulanan');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $topThree = $response->json('data.topThree');
        $this->assertNotEmpty($topThree);
        if (count($topThree) >= 2) {
            $this->assertGreaterThanOrEqual($topThree[1]['points'] ?? 0, $topThree[0]['points'] ?? 0);
        }
    }
}

