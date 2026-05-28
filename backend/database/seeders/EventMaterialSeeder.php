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

            // 1. Materi Video Pendek (Micro-learning)
            EventMaterial::create([
                'event_id' => $event->id,
                'title' => 'Micro-learning: Pengantar Strategi & Pitching Bisnis Terarah',
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'description' => 'Pelajari landasan fundamental strategi menyusun deck proposal bisnis dalam durasi 10 menit.',
                'require_attendance' => false
            ]);

            // 2. Modul Infografis Ringkasan (Buku Saku PDF)
            EventMaterial::create([
                'event_id' => $event->id,
                'title' => 'E-Booklet & Infografis Ringkasan Kelas (PDF)',
                'type' => 'document',
                'url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'description' => 'Unduh rangkuman presentasi pemateri lengkap dengan diagram infografis untuk belajar luring di perangkat Anda.',
                'require_attendance' => false
            ]);

            // 3. Eksklusif Link Rekaman Q&A (Terbuka khusus untuk peserta yang HADIR Check-in)
            EventMaterial::create([
                'event_id' => $event->id,
                'title' => 'Eksklusif: Video Rekaman Sesi Q&A & Tanya Jawab Panelis',
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'description' => 'Akses eksklusif rekaman diskusi tanya jawab interaktif panelis ahli di akhir sesi acara. Hanya dapat dibuka oleh peserta terverifikasi Hadir.',
                'require_attendance' => true
            ]);
        }
    }
}
