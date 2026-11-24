<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\SoulboundToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RecruiterMatchingTest extends TestCase
{
    use DatabaseTransactions;

    protected User $recruiter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->recruiter = User::firstOrCreate(
            ['email' => 'test.recruiter@example.com'],
            ['name' => 'HR Testing', 'password' => bcrypt('password'), 'role' => 'recruiter']
        );
    }

    public function test_recruiter_dashboard_endpoint()
    {
        $response = $this->getJson('/api/recruiter/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'stats' => ['total_candidates', 'total_verified_credentials'],
                'recent_candidates',
            ]
        ]);
    }

    public function test_recruiter_candidates_list_and_filter()
    {
        $response = $this->getJson('/api/recruiter/candidates?tier=Platinum');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
            'meta' => ['total', 'current_page'],
        ]);
    }

    public function test_skill_match_using_cosine_similarity()
    {
        $payload = [
            'job_title'       => 'Fullstack Web Engineer',
            'required_skills' => ['Laravel', 'React', 'MySQL', 'Software Testing'],
        ];

        $response = $this->postJson('/api/recruiter/skill-match', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'mode',
            'data' => [
                'job_title',
                'required_skills',
                'total_evaluated',
                'candidates',
            ]
        ]);

        $this->assertEquals('SIMULATED MATCH RESULT (Vector Skill-Matrix & Cosine Similarity)', $response->json('mode'));
    }
}
