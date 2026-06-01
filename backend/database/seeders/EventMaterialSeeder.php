<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventMaterial;

class EventMaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = Event::all();

        foreach ($events as $event) {
            // Cegah duplikasi jika materi event ini sudah di-seed sebelumnya
            if (EventMaterial::where('event_id', $event->id)->exists()) {
                continue;
            }

            // 1. Materi Booklet PDF (document)
            EventMaterial::create([
                'event_id' => $event->id,
                'session_name' => 'Day 1 - Sesi Pagi',
                'speaker_name' => 'Dr. Budi Santoso',
                'title' => 'E-Booklet & Infografis Ringkasan Kelas (PDF)',
                'type' => 'document',
                'content_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'description' => 'Unduh rangkuman presentasi pemateri lengkap dengan diagram infografis untuk belajar luring di perangkat Anda.',
                'status' => 'published'
            ]);

            // 2. Kode Repository GitHub (code_repo)
            EventMaterial::create([
                'event_id' => $event->id,
                'session_name' => 'Day 1 - Sesi Siang',
                'speaker_name' => 'Jane Doe, M.Cs.',
                'title' => 'Repository Source Code Starter Pack',
                'type' => 'code_repo',
                'content_url' => 'https://github.com/example/starter-pack',
                'description' => 'Akses repositori kode sumber latihan untuk memulai sesi praktik lab secara langsung.',
                'status' => 'published'
            ]);

            // 3. Desain Interaktif Figma (design_interactive)
            EventMaterial::create([
                'event_id' => $event->id,
                'session_name' => 'Day 2 - Sesi Pagi',
                'speaker_name' => 'Rian Wijaya, UI/UX Designer',
                'title' => 'Figma Prototype Link & Design Assets',
                'type' => 'design_interactive',
                'content_url' => 'https://figma.com/file/example-design',
                'description' => 'Akses berkas desain interaktif Figma dan aset UI untuk materi kolaborasi desain.',
                'status' => 'published'
            ]);
        }
    }
}
