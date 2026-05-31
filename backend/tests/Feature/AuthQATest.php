<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;

class AuthQATest extends TestCase
{
    use RefreshDatabase;

    // ==========================================
    // A1. REGISTER
    // ==========================================
    public function test_a1_register_empty_fields()
    {
        $response = $this->postJson('/api/register', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_a1_register_invalid_email()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'password' => 'password123'
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_a1_register_short_password()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@test.com',
            'password' => 'short'
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_a1_register_email_already_exists()
    {
        User::factory()->create(['email' => 'existing@test.com']);
        $response = $this->postJson('/api/register', [
            'name' => 'Jane Doe',
            'email' => 'existing@test.com',
            'password' => 'password123'
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_a1_register_success()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'password123'
        ]);
        $response->assertStatus(201);
        $this->assertArrayHasKey('access_token', $response->json());
    }

    // ==========================================
    // A2. PERSONALIZATION
    // ==========================================
    public function test_a2_save_personalization()
    {
        $user = User::factory()->create();
        $category1 = Category::create(['name' => 'Tech', 'slug' => 'tech', 'icon' => 'icon']);
        $category2 = Category::create(['name' => 'Business', 'slug' => 'business', 'icon' => 'icon']);
        $category3 = Category::create(['name' => 'Art', 'slug' => 'art', 'icon' => 'icon']);

        $response = $this->actingAs($user)->postJson('/api/user/personalization', [
            'category_ids' => [$category1->id, $category2->id, $category3->id]
        ]);
        
        $response->assertStatus(200);
        $this->assertCount(3, $user->categories);
    }

    // ==========================================
    // A3. LOGIN
    // ==========================================
    public function test_a3_login_success()
    {
        $user = User::factory()->create([
            'email' => 'valid@test.com',
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'valid@test.com',
            'password' => 'password123'
        ]);
        
        $response->assertStatus(200);
        $this->assertArrayHasKey('access_token', $response->json());
    }

    public function test_a3_login_wrong_password()
    {
        $user = User::factory()->create([
            'email' => 'valid@test.com',
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'valid@test.com',
            'password' => 'wrongpass'
        ]);
        
        $response->assertStatus(422);
    }

    public function test_a3_login_unregistered_email()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'notfound@test.com',
            'password' => 'password123'
        ]);
        
        $response->assertStatus(422);
    }

    // ==========================================
    // A4. FORGOT PASSWORD
    // ==========================================
    public function test_a4_forgot_password_send_otp()
    {
        User::factory()->create(['email' => 'forgot@test.com']);
        $response = $this->postJson('/api/forgot-password', [
            'identifier' => 'forgot@test.com'
        ]);
        $response->assertStatus(200);
    }

    public function test_a4_verify_otp_invalid()
    {
        User::factory()->create(['email' => 'forgot@test.com']);
        $response = $this->postJson('/api/verify-otp', [
            'email' => 'forgot@test.com',
            'otp' => '000000'
        ]);
        // Expecting an error for wrong OTP
        $response->assertStatus(400); 
    }

    // ==========================================
    // A5. LOGOUT
    // ==========================================
    public function test_a5_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');
        
        $response->assertStatus(200);
    }
}
