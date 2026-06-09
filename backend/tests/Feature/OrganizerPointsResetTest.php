<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Setting;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;

class OrganizerPointsResetTest extends TestCase
{
    use RefreshDatabase;

    protected $organizer;
    protected $participant1;
    protected $participant2;
    protected $event;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat user organizer
        $this->organizer = User::factory()->create(['role' => 'organizer']);

        // Buat event yang dimiliki oleh organizer tersebut
        $this->event = Event::factory()->create([
            'organizer_id' => $this->organizer->id,
            'title' => 'Test PHP Gathering',
            'status' => 'completed', // Status default selesai agar validasi lolos
        ]);

        // Buat user peserta
        $this->participant1 = User::factory()->create(['role' => 'participant']);
        $this->participant2 = User::factory()->create(['role' => 'participant']);

        // Set rasio konversi poin di settings
        Setting::create([
            'key' => 'local_to_global_ratio',
            'value' => '10' // 10 local = 1 global
        ]);
    }

    /**
     * Test restriksi role (hanya organizer dari event yang bisa melakukan reset).
     */
    public function test_non_organizer_cannot_reset_points()
    {
        $nonOrganizer = User::factory()->create(['role' => 'participant']);

        $response = $this->actingAs($nonOrganizer)
            ->postJson("/api/event-dashboard/{$this->event->id}/points/reset");

        $response->assertStatus(403);
    }

    /**
     * Test validasi status event (tidak boleh draft atau cancelled).
     */
    public function test_cannot_reset_points_if_event_draft_or_cancelled()
    {
        // 1. Cek status draft
        $this->event->update(['status' => 'draft']);

        $response = $this->actingAs($this->organizer)
            ->postJson("/api/event-dashboard/{$this->event->id}/points/reset");

        $response->assertStatus(422);
        $response->assertJson([
            'status' => 'error',
            'message' => 'Validasi gagal: Event tidak dapat dikonversi karena masih berupa draft atau telah dibatalkan.'
        ]);

        // 2. Cek status cancelled
        $this->event->update(['status' => 'cancelled']);

        $response2 = $this->actingAs($this->organizer)
            ->postJson("/api/event-dashboard/{$this->event->id}/points/reset");

        $response2->assertStatus(422);
        $response2->assertJson([
            'status' => 'error',
            'message' => 'Validasi gagal: Event tidak dapat dikonversi karena masih berupa draft atau telah dibatalkan.'
        ]);
    }

    /**
     * Test sukses reset poin lokal ke 0 dan konversi ke global point.
     */
    public function test_reset_and_conversion_success()
    {
        // Berikan saldo local point ke peserta 1 (120 poin)
        LocalMemberPoint::create([
            'user_id' => $this->participant1->id,
            'event_id' => $this->event->id,
            'points_balance' => 120,
        ]);

        // Berikan saldo local point ke peserta 2 (85 poin)
        LocalMemberPoint::create([
            'user_id' => $this->participant2->id,
            'event_id' => $this->event->id,
            'points_balance' => 85,
        ]);

        // Kirim request reset
        $response = $this->actingAs($this->organizer)
            ->postJson("/api/event-dashboard/{$this->event->id}/points/reset");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'event_id',
                'event_title',
                'conversion_ratio',
                'resets' => [
                    '*' => [
                        'user_id',
                        'name',
                        'email',
                        'local_points_before',
                        'global_points_added',
                    ]
                ]
            ]
        ]);

        // Cek bahwa points_balance di local_member_points telah direset ke 0
        $this->assertEquals(0, LocalMemberPoint::where('user_id', $this->participant1->id)->where('event_id', $this->event->id)->first()->points_balance);
        $this->assertEquals(0, LocalMemberPoint::where('user_id', $this->participant2->id)->where('event_id', $this->event->id)->first()->points_balance);

        // Cek log audit transaksi negatif untuk local points
        $this->assertDatabaseHas('point_transactions', [
            'type' => 'local',
            'user_id' => $this->participant1->id,
            'event_id' => $this->event->id,
            'amount' => -120,
        ]);
        $this->assertDatabaseHas('point_transactions', [
            'type' => 'local',
            'user_id' => $this->participant2->id,
            'event_id' => $this->event->id,
            'amount' => -85,
        ]);

        // Cek log transaksi positif untuk global points (120 / 10 = 12, 85 / 10 = 8)
        $this->assertDatabaseHas('point_transactions', [
            'type' => 'global',
            'user_id' => $this->participant1->id,
            'event_id' => null,
            'amount' => 12,
        ]);
        $this->assertDatabaseHas('point_transactions', [
            'type' => 'global',
            'user_id' => $this->participant2->id,
            'event_id' => null,
            'amount' => 8,
        ]);
    }
}
