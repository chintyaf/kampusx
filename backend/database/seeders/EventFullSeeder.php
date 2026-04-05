<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EventFullSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ambil ID Organizer (admin@kampusx.com atau org@kampusx.com)
        $organizer = DB::table('users')->where('email', 'org@kampusx.com')->first();

        if (!$organizer) {
            $this->command->error("User Organizer tidak ditemukan!");
            return;
        }

        // 2. Buat Institusi (Lengkap dengan Slug)
        $instName = 'KampusX Technology Center';
        $instId = DB::table('institutions')->insertGetId([
            'name' => $instName,
            'slug' => Str::slug($instName),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Buat Event Utama
        $title = 'Workshop Laravel Modern 2026';
        $eventId = DB::table('events')->insertGetId([
            'organizer_id' => $organizer->id,
            'institution_id' => $instId,
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::random(5),
            'description' => 'Pelajari cara membangun aplikasi skala enterprise.',
            'image_path' => 'events/posters/laravel-workshop.png',
            'start_date' => Carbon::parse('2026-05-20 09:00:00'),
            'end_date' => Carbon::parse('2026-05-20 17:00:00'),
            'timezone' => 'Asia/Jakarta',
            'status' => 'published',
            'is_featured' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // --- TAMBAHAN: SEED EVENT TYPES ---
        // 4. Buat Master Tipe Event (Jika belum ada)
        $typeSeminarId = DB::table('event_types')->insertGetId([
            'name' => 'Seminar',
        ]);
        $typeWorkshopId = DB::table('event_types')->insertGetId([
            'name' => 'Workshop',
        ]);

        // Hubungkan Event ke Tipe (Pivot table: event_types_event)
        DB::table('event_types_event')->insert([
            'event_id' => $eventId,
            'event_types_id' => $typeWorkshopId,
        ]);

        // 5. Tambah Lokasi (Tipe Hybrid)
        DB::table('event_locations')->insert([
            'event_id' => $eventId,
            'type' => 'hybrid',
            'platform' => 'Zoom Meeting',
            'meeting_link' => 'https://zoom.us/j/123456',
            'online_instruction' => 'Link dikirim via email.',
            'online_quota' => 500,
            'location_name' => 'Gedung Rektorat KampusX',
            'location_detail' => 'Aula Utama Lantai 2',
            'maps_url' => 'https://maps.google.com/?q=KampusX',
            'latitude' => -6.914744,
            'longitude' => 107.609811,
            'country' => 'Indonesia',
            'province' => 'Jawa Barat',
            'city' => 'Kota Bandung',
            'district' => 'Coblong',
            'address_detail' => 'Jl. Dipati Ukur No. 102',
            'offline_instruction' => 'Bawa kartu identitas.',
            'offline_quota' => 50,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 6. Kategori
        $catId = DB::table('categories')->insertGetId(['name' => 'Web Development']);
        DB::table('event_categories')->insert([
            'event_id' => $eventId,
            'category_id' => $catId
        ]);

        // 7. Pembicara (Speaker)
        $speakerId = DB::table('speakers')->insertGetId([
            'event_id' => $eventId,
            'name' => 'Taylor Otwell Jr.',
            'role' => 'Senior Backend Engineer',
            'expertise' => json_encode(['Laravel', 'Architecture'])
        ]);

        // 8. Sesi Event
        $sessionId = DB::table('event_sessions')->insertGetId([
            'event_id' => $eventId,
            'title' => 'Sesi 1: Arsitektur Database',
            'day_number' => 1,
            'date' => '2026-05-20',
            'start_time' => '09:00:00',
            'end_time' => '12:00:00',
            'created_at' => now(),
        ]);

        // 9. Hubungkan Speaker ke Sesi
        DB::table('event_session_speakers')->insert([
            'session_id' => $sessionId,
            'speaker_id' => $speakerId
        ]);

        $this->command->info("Event lengkap dengan Tipe 'Workshop' berhasil dibuat.");
    }
}
