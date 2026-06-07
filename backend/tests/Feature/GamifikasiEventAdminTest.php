<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Activity;
use App\Models\Reward;
use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class GamifikasiEventAdminTest extends TestCase
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

    // 1. Test Activity CRUD
    public function test_activity_crud()
    {
        // CREATE
        $response = $this->actingAs($this->admin)->postJson('/api/admin/activities', [
            'name' => 'Menghadiri Seminar',
            'slug' => 'attend_seminar',
            'points_rewarded' => 15,
            'type' => 'local',
            'description' => 'Mendapatkan poin jika menghadiri seminar.',
            'is_active' => true
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.slug', 'attend_seminar');
        $activityId = $response->json('data.id');

        // READ ALL
        $response = $this->actingAs($this->admin)->getJson('/api/admin/activities');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        // READ SINGLE
        $response = $this->actingAs($this->admin)->getJson("/api/admin/activities/{$activityId}");
        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Menghadiri Seminar');

        // UPDATE
        $response = $this->actingAs($this->admin)->putJson("/api/admin/activities/{$activityId}", [
            'name' => 'Menghadiri Seminar (Updated)',
            'slug' => 'attend_seminar',
            'points_rewarded' => 20,
            'type' => 'global',
            'description' => 'Mendapatkan poin global jika menghadiri seminar.',
            'is_active' => true
        ]);
        $response->assertStatus(200);
        $response->assertJsonPath('data.points_rewarded', 20);

        // DELETE
        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/activities/{$activityId}");
        $response->assertStatus(200);

        // Verify deleted
        $response = $this->actingAs($this->admin)->getJson("/api/admin/activities/{$activityId}");
        $response->assertStatus(404);
    }

    // 2. Test Global Reward CRUD and Forcing Rule
    public function test_global_reward_crud_forces_null_event_id_and_global_type()
    {
        Storage::fake('public');

        // Create a fake event to try to associate it (which should be rejected/overridden)
        $event = \App\Models\Event::factory()->create([
            'organizer_id' => $this->admin->id
        ]);

        $image = UploadedFile::fake()->create('reward.png', 100, 'image/png');

        // CREATE
        $response = $this->actingAs($this->admin)->postJson('/api/admin/global-rewards', [
            'title' => 'Kaos Keren KampusX',
            'description' => 'Merchandise eksklusif.',
            'points_cost' => 100,
            'stock' => 50,
            'limit_per_user' => 1,
            'image' => $image,
            'reward_type' => 'physical',
            'is_active' => true,
            'event_id' => $event->id, // Should be forced to null
            'type' => 'local'          // Should be forced to 'global'
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.event_id', null);
        $response->assertJsonPath('data.type', 'global');
        $rewardId = $response->json('data.id');
        $imagePath = $response->json('data.image_path');
        
        $this->assertNotNull($imagePath);
        Storage::disk('public')->assertExists($imagePath);

        // READ ALL
        $response = $this->actingAs($this->admin)->getJson('/api/admin/global-rewards');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        // UPDATE (with new image to test deletion of old one)
        $newImage = UploadedFile::fake()->create('new_reward.png', 100, 'image/png');
        $response = $this->actingAs($this->admin)->putJson("/api/admin/global-rewards/{$rewardId}", [
            'title' => 'Kaos Keren KampusX (Updated)',
            'description' => 'Merchandise eksklusif premium.',
            'points_cost' => 120,
            'stock' => 40,
            'limit_per_user' => 2,
            'image' => $newImage,
            'reward_type' => 'physical',
            'is_active' => true,
            'event_id' => $event->id, // Should be forced to null
            'type' => 'local'          // Should be forced to 'global'
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.event_id', null);
        $response->assertJsonPath('data.type', 'global');
        $response->assertJsonPath('data.points_cost', 120);
        
        $newImagePath = $response->json('data.image_path');
        Storage::disk('public')->assertExists($newImagePath);
        Storage::disk('public')->assertMissing($imagePath); // Old image should be deleted

        // DELETE
        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/global-rewards/{$rewardId}");
        $response->assertStatus(200);
        Storage::disk('public')->assertMissing($newImagePath); // Image should be deleted
    }

    // 3. Test Conversion Rule API
    public function test_conversion_rule_api()
    {
        // GET DEFAULT (should be 10 if not set)
        $response = $this->actingAs($this->admin)->getJson('/api/admin/conversion-rules');
        $response->assertStatus(200);
        $response->assertJsonPath('data.value', 10);

        // SET/UPDATE
        $response = $this->actingAs($this->admin)->postJson('/api/admin/conversion-rules', [
            'ratio' => 5
        ]);
        $response->assertStatus(200);
        $response->assertJsonPath('data.value', 5);

        // GET UPDATED
        $response = $this->actingAs($this->admin)->getJson('/api/admin/conversion-rules');
        $response->assertStatus(200);
        $response->assertJsonPath('data.value', 5);
        
        $this->assertEquals('5', Setting::where('key', 'local_to_global_ratio')->first()->value);
    }

    // 4. Test Access Controls
    public function test_access_controls()
    {
        // Accessing without login (Guest)
        $this->getJson('/api/admin/activities')->assertStatus(401);
        $this->postJson('/api/admin/activities', [])->assertStatus(401);
        $this->getJson('/api/admin/global-rewards')->assertStatus(401);
        $this->getJson('/api/admin/conversion-rules')->assertStatus(401);

        // Accessing as a participant (Member)
        $this->actingAs($this->member)->getJson('/api/admin/activities')->assertStatus(403);
        $this->actingAs($this->member)->postJson('/api/admin/activities', [])->assertStatus(403);
        $this->actingAs($this->member)->getJson('/api/admin/global-rewards')->assertStatus(403);
        $this->actingAs($this->member)->getJson('/api/admin/conversion-rules')->assertStatus(403);
    }
}
