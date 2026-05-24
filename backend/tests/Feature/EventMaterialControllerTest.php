<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventMaterial;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EventMaterialControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $organizer;
    private $otherOrganizer;
    private $participant;
    private $admin;
    private $committee;
    private $event;
    private $material;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat user dengan berbagai role
        $this->organizer = User::factory()->create(['role' => 'organizer']);
        $this->otherOrganizer = User::factory()->create(['role' => 'organizer']);
        $this->participant = User::factory()->create(['role' => 'participant']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->committee = User::factory()->create(['role' => 'committee']);

        // Buat event (default dipublikasikan, sudah selesai)
        $this->event = Event::create([
            'organizer_id' => $this->organizer->id,
            'title' => 'Test PHP Security Event',
            'slug' => 'test-php-security-event',
            'description' => 'Event description',
            'image_path' => 'events/banners/test.png',
            'start_date' => now()->subDays(2),
            'end_date' => now()->subDay(),
            'status' => 'published',
        ]);

        // Buat materi event
        $this->material = EventMaterial::create([
            'event_id' => $this->event->id,
            'title' => 'Important Presentation Slide',
            'type' => 'document',
            'url' => 'https://example.com/slide.pdf',
            'description' => 'Important slide deck',
            'require_attendance' => false,
        ]);
    }

    /**
     * Bantuan untuk membuat tiket aktif bagi user di event tertentu
     */
    private function createTicketForUser($user, $event)
    {
        $orderId = DB::table('orders')->insertGetId([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'total_price' => 0,
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderItemId = DB::table('order_items')->insertGetId([
            'order_id' => $orderId,
            'price' => 0,
            'quantity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('tickets')->insertGetId([
            'order_item_id' => $orderItemId,
            'participant_id' => $user->id,
            'attendee_name' => $user->name ?? 'John Doe',
            'attendee_email' => $user->email ?? 'johndoe@example.com',
            'qr_token' => uniqid('qr_'),
            'ticket_code' => 'TKT-' . uniqid(),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Bantuan untuk membuat log kehadiran peserta
     */
    private function recordAttendanceForTicket($ticketId, $eventId)
    {
        DB::table('attendance_logs')->insert([
            'ticket_id' => $ticketId,
            'event_id' => $eventId,
            'scan_time' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * 1. Peserta tanpa tiket ditolak aksesnya
     */
    public function test_participant_without_ticket_is_forbidden()
    {
        $response = $this->actingAs($this->participant)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Akses ditolak. Anda tidak memiliki tiket aktif untuk acara ini.');
    }

    /**
     * 2. Peserta dengan tiket tetapi event masih draf ditolak
     */
    public function test_participant_with_ticket_cannot_access_draft_event_materials()
    {
        // Ubah event ke draf
        $this->event->update(['status' => 'draft']);

        $this->createTicketForUser($this->participant, $this->event);

        $response = $this->actingAs($this->participant)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Akses ditolak. Event belum dipublikasikan atau sedang dalam draf.');
    }

    /**
     * 3. Peserta dengan tiket tetapi event belum selesai ditolak
     */
    public function test_participant_cannot_access_materials_before_event_ends()
    {
        // Ubah end_date ke masa depan
        $this->event->update(['end_date' => now()->addDays(2)]);

        $this->createTicketForUser($this->participant, $this->event);

        $response = $this->actingAs($this->participant)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Akses ditolak. Materi pasca-event belum tersedia karena acara belum selesai.');
    }

    /**
     * 4. Peserta dengan tiket dapat mengakses materi jika event sudah selesai dan dipublikasikan
     */
    public function test_participant_with_ticket_can_access_materials_after_event_ends()
    {
        $this->createTicketForUser($this->participant, $this->event);

        $response = $this->actingAs($this->participant)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'attended'])
            ->assertJsonPath('data.0.id', $this->material->id);
    }

    /**
     * 5. Filter kehadiran untuk materi yang membutuhkannya berfungsi dengan baik
     */
    public function test_attendance_required_materials_are_filtered_out_for_absent_participants()
    {
        // Set materi butuh kehadiran
        $this->material->update(['require_attendance' => true]);

        $ticketId = $this->createTicketForUser($this->participant, $this->event);

        // Kasus A: Belum absen/hadir (filtered out)
        $response1 = $this->actingAs($this->participant)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response1->assertStatus(200)
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('attended', false);

        // Kasus B: Sudah absen/hadir (accessible)
        $this->recordAttendanceForTicket($ticketId, $this->event->id);

        $response2 = $this->actingAs($this->participant)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response2->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->material->id)
            ->assertJsonPath('attended', true);
    }

    /**
     * 6. Pemilik event (Organizer asli) dapat mem-bypass filter status draf dan waktu
     */
    public function test_event_owner_organizer_bypasses_status_and_time_filters()
    {
        // Ubah event ke draf dan end_date di masa depan
        $this->event->update([
            'status' => 'draft',
            'end_date' => now()->addDays(5)
        ]);

        $response = $this->actingAs($this->organizer)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $this->material->id);
    }

    /**
     * 7. Admin global dapat mem-bypass filter status draf dan waktu
     */
    public function test_admin_bypasses_status_and_time_filters()
    {
        $this->event->update([
            'status' => 'draft',
            'end_date' => now()->addDays(5)
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $this->material->id);
    }

    /**
     * 8. Panitia (Committee) resmi/global dapat mem-bypass filter status draf dan waktu
     */
    public function test_committee_bypasses_status_and_time_filters()
    {
        $this->event->update([
            'status' => 'draft',
            'end_date' => now()->addDays(5)
        ]);

        $response = $this->actingAs($this->committee)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $this->material->id);
    }

    /**
     * 9. Organizer lain yang BUKAN pemilik event diperlakukan sebagai peserta biasa (tidak dapat bypass)
     */
    public function test_non_owner_organizer_cannot_bypass_filters()
    {
        $this->event->update([
            'status' => 'draft',
            'end_date' => now()->addDays(5)
        ]);

        // Coba akses tanpa tiket
        $response1 = $this->actingAs($this->otherOrganizer)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response1->assertStatus(403) // Ditolak karena draf & tidak punya bypass
            ->assertJsonPath('message', 'Akses ditolak. Event belum dipublikasikan atau sedang dalam draf.');

        // Coba akses dengan tiket tapi masih draf
        $this->createTicketForUser($this->otherOrganizer, $this->event);
        
        $response2 = $this->actingAs($this->otherOrganizer)
            ->getJson("/api/events/{$this->event->id}/materials");

        $response2->assertStatus(403)
            ->assertJsonPath('message', 'Akses ditolak. Event belum dipublikasikan atau sedang dalam draf.');
    }

    /**
     * 10. Defense-in-depth: Hanya pemilik event / admin yang bisa menambah materi (store)
     */
    public function test_only_event_owner_or_admin_can_store_material()
    {
        // Kasus A: Organizer lain mencoba menambah materi -> Ditolak (403)
        $response1 = $this->actingAs($this->otherOrganizer)
            ->postJson("/api/organizer/events/{$this->event->id}/materials", [
                'title' => 'Leaked Slide',
                'type' => 'document',
                'url' => 'https://example.com/leak.pdf',
                'description' => 'Unpermitted upload',
                'require_attendance' => false,
            ]);

        $response1->assertStatus(403);

        // Kasus B: Pemilik asli menambah materi -> Sukses (201)
        $response2 = $this->actingAs($this->organizer)
            ->postJson("/api/organizer/events/{$this->event->id}/materials", [
                'title' => 'Allowed Slide',
                'type' => 'document',
                'url' => 'https://example.com/allowed.pdf',
                'description' => 'Permitted upload',
                'require_attendance' => false,
            ]);

        $response2->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    /**
     * 11. Defense-in-depth: Hanya pemilik event / admin yang bisa menghapus materi (destroy)
     */
    public function test_only_event_owner_or_admin_can_destroy_material()
    {
        // Kasus A: Organizer lain mencoba menghapus materi -> Ditolak (403)
        $response1 = $this->actingAs($this->otherOrganizer)
            ->deleteJson("/api/organizer/events/{$this->event->id}/materials/{$this->material->id}");

        $response1->assertStatus(403);

        // Kasus B: Pemilik asli menghapus materi -> Sukses (200)
        $response2 = $this->actingAs($this->organizer)
            ->deleteJson("/api/organizer/events/{$this->event->id}/materials/{$this->material->id}");

        $response2->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
