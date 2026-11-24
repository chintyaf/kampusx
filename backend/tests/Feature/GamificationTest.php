<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Badge;
use App\Models\StudentBadge;
use App\Models\PointTransaction;
use App\Services\Gamification\GamificationService;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GamificationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $student;
    protected GamificationService $gamificationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gamificationService = app(GamificationService::class);

        $this->student = User::firstOrCreate(
            ['email' => 'test.student.gamification@example.com'],
            [
                'name'     => 'Test Student Gamification',
                'password' => bcrypt('password'),
                'role'     => 'participant',
                'points'   => 450,
                'tier'     => 'Silver',
            ]
        );
    }

    public function test_points_awarded_and_tier_upgraded_from_silver_to_gold()
    {
        // Poin awal: 450 (Silver: 0-499)
        $this->assertEquals('Silver', $this->student->calculateTier());

        // Berikan +100 poin (Total jadi 550, harus naik ke Gold: 500-999)
        $result = $this->gamificationService->awardPoints(
            $this->student,
            100,
            'Mengikuti Workshop AI',
            'event',
            'TEST-EVENT-001'
        );

        $this->assertTrue($result['success']);
        $this->assertEquals(550, $result['total_points']);
        $this->assertEquals('Gold', $result['current_tier']);
        $this->assertTrue($result['tier_upgraded']);

        // Pastikan tersimpan di MySQL
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $this->student->id,
            'amount'  => 100,
        ]);
    }

    public function test_anti_duplication_prevents_duplicate_points_for_same_activity()
    {
        // Pemberian pertama
        $res1 = $this->gamificationService->awardPoints(
            $this->student,
            50,
            'Kuis Fundamental React',
            'quiz',
            'QUIZ-REACT-01'
        );
        $this->assertTrue($res1['success']);

        // Pemberian kedua dengan reference key yang sama harus ditolak
        $res2 = $this->gamificationService->awardPoints(
            $this->student,
            50,
            'Kuis Fundamental React',
            'quiz',
            'QUIZ-REACT-01'
        );

        $this->assertFalse($res2['success']);
        $this->assertEquals('duplicate', $res2['status']);
    }

    public function test_gamification_dashboard_endpoint()
    {
        $response = $this->actingAs($this->student)->getJson('/api/gamification/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'student' => ['id', 'name', 'points', 'tier', 'rank'],
                'tier_progress' => ['current_tier', 'next_tier', 'points_needed', 'progress_percent'],
                'badges' => ['unlocked_count', 'total_count', 'list'],
                'recent_history',
            ]
        ]);
    }

    public function test_leaderboard_endpoint()
    {
        $response = $this->getJson('/api/gamification/leaderboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'leaderboard',
                'top_three',
            ]
        ]);
    }
}
