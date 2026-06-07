<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;
use App\Models\Setting;
use App\Services\ProcessGlobalPointConversion;

class GamifikasiEventGlobalFeaturesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test point balance endpoint with JsonResource wrapping.
     */
    public function test_get_balance_endpoint()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $organizer = User::factory()->create(['role' => 'organizer']);
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);

        // Award local points
        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'amount' => 300,
            'type' => 'local'
        ]);
        LocalMemberPoint::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'points_balance' => 300
        ]);

        // Award global points
        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => null,
            'amount' => 150,
            'type' => 'global'
        ]);

        $response = $this->actingAs($user)->getJson('/api/member/points/balance');

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'current_local_points' => 300,
                'current_global_points' => 150,
                'event_id' => $event->id
            ]
        ]);
    }

    /**
     * Test global conversion service execution logic.
     */
    public function test_conversion_service_execution()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $organizer = User::factory()->create(['role' => 'organizer']);
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);

        // Seed settings ratio
        Setting::updateOrCreate(['key' => 'local_to_global_ratio'], ['value' => '10']);

        // Award local points
        LocalMemberPoint::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'points_balance' => 500
        ]);

        $service = new ProcessGlobalPointConversion();
        $globalAdded = $service->execute($user, $event->id, 500);

        $this->assertEquals(50, $globalAdded);

        // Verify local balance is 0
        $this->assertEquals(0, LocalMemberPoint::where('user_id', $user->id)->where('event_id', $event->id)->value('points_balance'));

        // Verify point transactions has global transaction entry
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $user->id,
            'event_id' => null,
            'amount' => 50,
            'type' => 'global'
        ]);

        // Verify point transactions has local deduction entry
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'amount' => -500,
            'type' => 'local'
        ]);
    }

    /**
     * Test history endpoint filtering by local and global types.
     */
    public function test_get_history_endpoint()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $organizer = User::factory()->create(['role' => 'organizer']);
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);

        // Award local points
        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'amount' => 300,
            'type' => 'local',
            'description' => 'Aktivitas Event Lokal'
        ]);

        // Award global points
        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => null,
            'amount' => 150,
            'type' => 'global',
            'description' => 'Aktivitas Event Global'
        ]);

        // Fetch history filtered by local
        $responseLocal = $this->actingAs($user)->getJson('/api/member/points/history?type=local');
        $responseLocal->assertStatus(200);
        $responseLocal->assertJsonCount(1, 'data');
        $responseLocal->assertJsonPath('data.0.amount', 300);
        $responseLocal->assertJsonPath('data.0.description', 'Aktivitas Event Lokal');

        // Fetch history filtered by global
        $responseGlobal = $this->actingAs($user)->getJson('/api/member/points/history?type=global');
        $responseGlobal->assertStatus(200);
        $responseGlobal->assertJsonCount(1, 'data');
        $responseGlobal->assertJsonPath('data.0.amount', 150);
        $responseGlobal->assertJsonPath('data.0.description', 'Aktivitas Event Global');
    }
}
