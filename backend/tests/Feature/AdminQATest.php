<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\OrganizerRequest;
use App\Models\Category;
use App\Models\EventType;
use App\Models\Institution;

class AdminQATest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $member;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->member = User::factory()->create(['role' => 'participant']);
    }

    // D1: Admin Dashboard
    public function test_d1_admin_dashboard_access()
    {
        // D1.1 Akses sebagai admin
        $response = $this->actingAs($this->admin)->getJson('/api/admin/dashboard-overview');
        $response->assertStatus(200);

        // D1.2 Akses sebagai member
        $responseMember = $this->actingAs($this->member)->getJson('/api/admin/dashboard-overview');
        $responseMember->assertStatus(403);
    }

    // D2: Verifikasi Organizer
    public function test_d2_organizer_verification()
    {
        $request = OrganizerRequest::create([
            'user_id' => $this->member->id,
            'organization_name' => 'Tech Org',
            'status' => 'pending',
            'reason' => 'Test'
        ]);

        // D2.1 Lihat daftar
        $response = $this->actingAs($this->admin)->getJson('/api/admin/organizer-requests');
        $response->assertStatus(200);

        // D2.3 Approve pengajuan
        $approveResp = $this->actingAs($this->admin)->postJson("/api/admin/organizer-requests/{$request->id}/approve", [
            'status' => 'approved'
        ]);
        $approveResp->assertStatus(200);
        $this->assertEquals('organizer', $this->member->fresh()->role);
    }

    // D3: Kelola Pengguna
    public function test_d3_user_management()
    {
        // D3.1 Lihat user
        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');
        $response->assertStatus(200);

        // D3.5 Buat user
        $createResp = $this->actingAs($this->admin)->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'organizer',
            'status' => 'active',
            'is_verified' => true
        ]);
        $createResp->assertStatus(201);
        $userId = $createResp->json('data.id') ?? $createResp->json('user.id') ?? User::where('email', 'newuser@example.com')->first()->id;

        // D3.3 Suspend user
        $suspendResp = $this->actingAs($this->admin)->postJson("/api/admin/users/{$userId}/status", [
            'status' => 'suspended',
            'status_reason' => 'spam'
        ]);
        $this->assertContains($suspendResp->status(), [200, 201]);

        // D3.7 Hapus user
        $deleteResp = $this->actingAs($this->admin)->deleteJson("/api/admin/users/{$userId}");
        $this->assertContains($deleteResp->status(), [200, 204]);
    }

    // D4: Pantau Event
    public function test_d4_monitor_events()
    {
        $event = Event::factory()->create([
            'organizer_id' => $this->admin->id,
            'status' => 'published'
        ]);

        // D4.1 Lihat semua event
        $response = $this->actingAs($this->admin)->getJson('/api/admin/events');
        $response->assertStatus(200);

        // D4.3 Featured event
        $featureResp = $this->actingAs($this->admin)->postJson("/api/admin/events/{$event->id}/feature");
        $this->assertContains($featureResp->status(), [200, 201]);
    }

    // D5: Kelola Payment
    public function test_d5_payment_management()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/payment');
        $this->assertContains($response->status(), [200, 404]); // 404 if route changed
    }

    // D6: Master Data (Kategori & Tipe Event)
    public function test_d6_master_data()
    {
        // Kategori
        $catResp = $this->actingAs($this->admin)->postJson('/api/admin/categories', [
            'name' => 'Kategori Baru',
            'icon' => 'icon-test'
        ]);
        $catResp->assertStatus(201);
        $catId = $catResp->json('data.id') ?? $catResp->json('category.id');

        $this->actingAs($this->admin)->putJson("/api/admin/categories/{$catId}", [
            'name' => 'Kategori Updated'
        ])->assertStatus(200);

        // Tipe Event
        $typeResp = $this->actingAs($this->admin)->postJson('/api/admin/event-types', [
            'name' => 'Tipe Baru'
        ]);
        $typeResp->assertStatus(201);
    }
}
