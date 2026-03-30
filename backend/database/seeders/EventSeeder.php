<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        // 1. BUAT DUMMY ORGANIZER DI TABEL USERS
        $organizerId = DB::table('users')->insertGetId([
            'name' => 'KampusX Official Organizer',
            'email' => 'organizer@kampusx.com',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'organizer',
            'status' => 'active',
            'is_verified' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. BUAT DUMMY KATEGORI EVENT
        $categories = [
            ['name' => 'Technology'],
            ['name' => 'Design'],
            ['name' => 'Entertainment'],
        ];

        $categoryIds = [];
        foreach ($categories as $category) {
            $categoryIds[] = DB::table('categories')->insertGetId($category);
        }

        // 3. BUAT DUMMY EVENT UTAMA
        $events = [
            [
                'organizer_id' => $organizerId,
                'slug' => Str::slug('Tech Startup Conference 2026'),
                'title' => 'Tech Startup Conference 2026',
                'description' => 'Konferensi tahunan untuk para penggiat startup dan teknologi. Dapatkan insight langsung dari para praktisi industri ternama.',
                'location_type' => 'offline',
                'start_date' => Carbon::now()->addDays(10)->setTime(9, 0),
                'end_date' => Carbon::now()->addDays(10)->setTime(17, 0),
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'organizer_id' => $organizerId,
                'slug' => Str::slug('Workshop UI UX Design Figma'),
                'title' => 'Workshop UI/UX Design Figma',
                'description' => 'Belajar membuat desain UI/UX interaktif menggunakan Figma dari nol sampai mahir dalam 1 hari full.',
                'location_type' => 'online',
                'start_date' => Carbon::now()->addDays(3)->setTime(13, 0),
                'end_date' => Carbon::now()->addDays(3)->setTime(16, 0),
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $eventIds = [];
        foreach ($events as $event) {
            $eventIds[] = DB::table('events')->insertGetId($event);
        }

        // 4. HUBUNGKAN EVENT DENGAN KATEGORINYA (TABEL PIVOT)
        DB::table('event_categories')->insert([
            ['event_id' => $eventIds[0], 'tag_id' => $categoryIds[0]], // Tech Conference -> Technology
            ['event_id' => $eventIds[1], 'tag_id' => $categoryIds[1]], // UI/UX -> Design
        ]);

        // 5. BUAT SESSION UNTUK EVENT (Misal event pertama punya 2 sesi)
        $sessionId1 = DB::table('event_sessions')->insertGetId([
            'event_id' => $eventIds[0], // Tech Conference
            'title' => 'Opening & Future of AI',
            'description' => 'Membahas perkembangan AI dalam 5 tahun ke depan.',
            'date' => Carbon::now()->addDays(10)->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '12:00:00',
            'location' => 'Main Hall A',
            'quota' => 200,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sessionId2 = DB::table('event_sessions')->insertGetId([
            'event_id' => $eventIds[0], // Tech Conference
            'title' => 'Startup Funding 101',
            'description' => 'Cara mendapatkan pendanaan untuk startup Anda.',
            'date' => Carbon::now()->addDays(10)->toDateString(),
            'start_time' => '13:00:00',
            'end_time' => '17:00:00',
            'location' => 'Room B2',
            'quota' => 100,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 6. BUAT DUMMY SPEAKER
        $speakerId1 = DB::table('speakers')->insertGetId([
            'event_session_id' => $sessionId1,
            'name' => 'Budi Santoso',
            'role' => 'CEO TechIndo',
            'bio' => 'Penggiat AI dan founder startup unicorn.',
            'linkedin' => 'https://linkedin.com/in/budisantoso',
            'expertise' => 'Artificial Intelligence',
        ]);

        $speakerId2 = DB::table('speakers')->insertGetId([
            'event_session_id' => $sessionId2,
            'name' => 'Siti Aminah',
            'role' => 'Venture Capitalist',
            'bio' => 'Investor aktif di berbagai startup tahap awal.',
            'linkedin' => 'https://linkedin.com/in/sitiaminah',
            'expertise' => 'Investment & Funding',
        ]);

        // 7. HUBUNGKAN SPEAKER DENGAN SESSIONNYA (TABEL PIVOT)
        DB::table('event_session_speakers')->insert([
            ['session_id' => $sessionId1, 'speaker_id' => $speakerId1],
            ['session_id' => $sessionId2, 'speaker_id' => $speakerId2],
        ]);
    }
}
