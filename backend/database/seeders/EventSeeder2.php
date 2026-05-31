<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EventSeeder2 extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────
        // Ambil referensi ID dari tabel yang sudah ada
        // ─────────────────────────────────────────
        $organizerId  = DB::table('users')->where('role', 'organizer')->value('id');
        $institutions = DB::table('institutions')->pluck('id')->toArray();
        $categories   = DB::table('categories')->pluck('id', 'name');

        // Ambil data event_types untuk relasi pivot
        $eventTypes   = DB::table('event_types')->pluck('id', 'name');

        // Pastikan organizer, institusi & tipe event tersedia
        if (! $organizerId || empty($institutions) || $eventTypes->isEmpty()) {
            $this->command->warn('Jalankan UserSeeder, InstitutionSeeder, dan EventTypeSeeder terlebih dahulu!');
            return;
        }

        // ─────────────────────────────────────────
        // Definisi event yang akan dibuat
        // ─────────────────────────────────────────
        $eventsData = [

            // ── Event 1: Konferensi AI Multi-Hari (HYBRID) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Indonesia AI Summit 2025',
                    'description' => 'Konferensi kecerdasan buatan terbesar di Indonesia yang menghadirkan para ahli dan praktisi AI dari berbagai sektor.',
                    'type_name'   => 'Conference',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(30),
                    'end_date'    => Carbon::now()->addDays(31),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Teknik & Tech', 'Bisnis & Ekonomi', 'Ilmu Sosial'],
                'location'   => [
                    'type'          => 'hybrid',
                    'platform'      => 'Zoom Webinar',
                    'meeting_link'  => 'https://zoom.us/j/ai-summit-2025',
                    'location_name' => 'Jakarta Convention Center',
                    'location_detail'=> 'Hall A & B, Lantai 2',
                    'maps_url'      => 'https://maps.google.com/?q=Jakarta+Convention+Center',
                    'latitude'      => -6.2097,
                    'longitude'     => 106.8228,
                    'country'       => 'Indonesia',
                    'province'      => 'DKI Jakarta',
                    'city'          => 'Jakarta Pusat',
                    'district'      => 'Tanah Abang',
                    'address_detail'=> 'Jl. Gatot Subroto, Karet Tengsin',
                ],
                'sessions'   => [
                    [
                        'title'       => 'Opening Ceremony & Keynote: Masa Depan AI di Indonesia',
                        'description' => 'Pembukaan resmi summit dan keynote speech.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(30)->toDateString(),
                        'start_time'  => '08:30:00',
                        'end_time'    => '10:00:00',
                        'speakers'    => [
                            ['name' => 'Dr. Budi Santoso', 'role' => 'Keynote Speaker', 'bio' => 'Pakar AI dan Guru Besar.', 'expertise' => ['Machine Learning', 'NLP']],
                        ],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'General Admission - Online', 'type' => 'online',  'price' => 150000,  'capacity' => 1000, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(28)],
                    ['name' => 'General Admission - Offline', 'type' => 'offline', 'price' => 750000,  'capacity' => 300, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(25)],
                ],
                'collaborators'  => [
                    ['institution' => 1, 'role' => 'co_host'],
                    ['institution' => 2, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 2: Seminar Online Satu Hari (ONLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Webinar Nasional: Startup Funding & Pitching 101',
                    'description' => 'Webinar intensif sehari untuk para founder startup yang ingin memahami ekosistem pendanaan.',
                    'type_name'   => 'Webinar',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(14),
                    'end_date'    => Carbon::now()->addDays(14),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Bisnis & Ekonomi', 'Pendidikan'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Google Meet',
                    'meeting_link'       => 'https://meet.google.com/startup-funding-101',
                    'online_instruction' => 'Link akan dikirim ke email 1 jam sebelum acara.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Tiket Reguler', 'type' => 'online', 'price' => 50000, 'capacity' => 1000, 'sale_start' => Carbon::now()->subDays(5), 'sale_end' => Carbon::now()->addDays(13)],
                ],
                'collaborators' => [
                    ['institution' => 3, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 3: Kompetisi / Hackathon Offline (OFFLINE) ─────────────────────────
            [
                'meta' => [
                    'title'       => 'HackBandung 2025 — 36 Hours of Innovation',
                    'description' => 'Hackathon 36 jam non-stop di Kota Bandung! Tim mahasiswa dari seluruh Indonesia bersaing.',
                    'type_name'   => 'Competition',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(45),
                    'end_date'    => Carbon::now()->addDays(46),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Teknik & Tech', 'Pendidikan', 'Seni & Desain'],
                'location'   => [
                    'type'                => 'offline',
                    'location_name'       => 'Gedung CRCS ITB',
                    'location_detail'     => 'Jl. Ganesa No.10, Lb. Siliwangi',
                    'maps_url'            => 'https://maps.google.com/?q=ITB+Bandung',
                    'latitude'            => -6.8915,
                    'longitude'           => 107.6107,
                    'country'             => 'Indonesia',
                    'province'            => 'Jawa Barat',
                    'city'                => 'Kota Bandung',
                    'district'            => 'Coblong',
                    'address_detail'      => 'Jl. Ganesa No.10, Lebak Siliwangi',
                    'offline_instruction' => 'Peserta wajib membawa laptop, charger, dan sleeping bag.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Registrasi Tim (Maks. 4 orang)', 'type' => 'offline', 'price' => 200000, 'capacity' => 150, 'sale_start' => Carbon::now()->subDays(20), 'sale_end' => Carbon::now()->addDays(40)],
                ],
                'collaborators' => [
                    ['institution' => 1, 'role' => 'co_host'],
                ],
            ],

            // ── Event 4: Workshop Seni & Desain (ONLINE) ────────────────────────────────
            [
                'meta' => [
                    'title'       => 'UI/UX Bootcamp: Dari Wireframe ke Prototype',
                    'description' => 'Bootcamp intensif 3 sesi yang mengajarkan proses desain produk digital.',
                    'type_name'   => 'Bootcamp',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(7),
                    'end_date'    => Carbon::now()->addDays(7),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Seni & Desain', 'Teknik & Tech', 'Pendidikan'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/uiux-bootcamp-2025',
                    'online_instruction' => 'Install Figma (gratis) sebelum sesi dimulai.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Tiket Peserta', 'type' => 'online', 'price' => 195000, 'capacity' => 100, 'sale_start' => Carbon::now()->subDays(3), 'sale_end' => Carbon::now()->addDays(6)],
                ],
                'collaborators' => [
                    ['institution' => 4, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 5: Event Kesehatan & Musik (OFFLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'FestiFit 2025: Gerak Sehat, Jiwa Sehat',
                    'description' => 'Festival kesehatan dan wellness yang menggabungkan senam massal, talkshow kesehatan mental.',
                    'type_name'   => 'Networking Event',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(21),
                    'end_date'    => Carbon::now()->addDays(21),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Kesehatan', 'Musik & Hiburan', 'Ilmu Sosial'],
                'location'   => [
                    'type'                => 'offline',
                    'location_name'       => 'Lapangan Gasibu',
                    'location_detail'     => 'Depan Gedung Sate, Bandung',
                    'maps_url'            => 'https://maps.google.com/?q=Lapangan+Gasibu+Bandung',
                    'latitude'            => -6.9022,
                    'longitude'           => 107.6186,
                    'country'             => 'Indonesia',
                    'province'            => 'Jawa Barat',
                    'city'                => 'Kota Bandung',
                    'district'            => 'Sumur Bandung',
                    'address_detail'      => 'Jl. Diponegoro, Citarum',
                    'offline_instruction' => 'Kenakan pakaian olahraga yang nyaman. Bawa air minum sendiri.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Tiket Gratis (Registrasi Wajib)', 'type' => 'offline', 'price' => 0, 'capacity' => 5000, 'sale_start' => Carbon::now()->subDays(7), 'sale_end' => Carbon::now()->addDays(20)],
                ],
                'collaborators' => [
                    ['institution' => 5, 'role' => 'co_host'],
                ],
            ],

            // ── Event 6: Workshop Kuliner/Kopi (OFFLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Masterclass: Seni Roasting Kopi Nusantara',
                    'description' => 'Pelajari teknik roasting biji kopi dari berbagai daerah di Indonesia langsung dari ahlinya. Termasuk sesi cupping dan sertifikat.',
                    'type_name'   => 'Workshop',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(10),
                    'end_date'    => Carbon::now()->addDays(10),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Bisnis & Ekonomi', 'Seni & Desain'],
                'location'   => [
                    'type'                => 'offline',
                    'location_name'       => 'Kopi Kini Roastery',
                    'location_detail'     => 'Lantai 1, Ruang Workshop',
                    'maps_url'            => 'https://maps.google.com/?q=Senopati+Jakarta',
                    'latitude'            => -6.2345,
                    'longitude'           => 106.8123,
                    'country'             => 'Indonesia',
                    'province'            => 'DKI Jakarta',
                    'city'                => 'Jakarta Selatan',
                    'district'            => 'Kebayoran Baru',
                    'address_detail'      => 'Jl. Senopati No. 88',
                    'offline_instruction' => 'Peserta diharap hadir tepat waktu dan tidak menggunakan parfum berlebih agar tidak mengganggu sesi cupping.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Tiket Masterclass', 'type' => 'offline', 'price' => 350000, 'capacity' => 20, 'sale_start' => Carbon::now()->subDays(2), 'sale_end' => Carbon::now()->addDays(8)],
                ],
                'collaborators' => [],
            ],

            // ── Event 7: Kursus Bahasa & IT (ONLINE) ────────────────────────────────
            [
                'meta' => [
                    'title'       => 'Intensive Course: English for Software Engineers',
                    'description' => 'Tingkatkan kemampuan komunikasi bahasa Inggris untuk presentasi teknis, daily stand-up, dan menulis dokumentasi kode yang profesional.',
                    'type_name'   => 'Course',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(5),
                    'end_date'    => Carbon::now()->addDays(12),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Pendidikan', 'Teknik & Tech'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Microsoft Teams',
                    'meeting_link'       => 'https://teams.microsoft.com/l/meetup-join/course',
                    'online_instruction' => 'Siapkan microphone yang jelas dan nyalakan kamera selama sesi diskusi berlangsung.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Paket Kelas Intensif', 'type' => 'online', 'price' => 450000, 'capacity' => 50, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(4)],
                ],
                'collaborators' => [],
            ],

            // ── Event 8: Panel Diskusi Lingkungan (HYBRID) ─────────────────────────
            [
                'meta' => [
                    'title'       => 'Panel Diskusi: Transisi Energi Hijau di Indonesia',
                    'description' => 'Bahas peluang dan tantangan Indonesia dalam mencapai net-zero emissions bersama pembuat kebijakan dan pemimpin industri energi.',
                    'type_name'   => 'Panel Discussion',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(60),
                    'end_date'    => Carbon::now()->addDays(60),
                    'timezone'    => 'Asia/Makassar',
                    'institution' => 1,
                ],
                'categories' => ['Ilmu Sosial', 'Teknik & Tech'],
                'location'   => [
                    'type'                => 'hybrid',
                    'platform'            => 'YouTube Live',
                    'meeting_link'        => 'https://youtube.com/live/green-energy-2025',
                    'location_name'       => 'Bali Nusa Dua Convention Center',
                    'location_detail'     => 'Nusa Dua Hall',
                    'maps_url'            => 'https://maps.google.com/?q=BNDCC+Bali',
                    'latitude'            => -8.7997,
                    'longitude'           => 115.2285,
                    'country'             => 'Indonesia',
                    'province'            => 'Bali',
                    'city'                => 'Badung',
                    'district'            => 'Kuta Selatan',
                    'address_detail'      => 'Kawasan Pariwisata Nusa Dua Lot NW/1',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Akses Livestream', 'type' => 'online', 'price' => 0, 'capacity' => 2000, 'sale_start' => Carbon::now()->addDays(10), 'sale_end' => Carbon::now()->addDays(59)],
                    ['name' => 'Kursi Undangan Offline', 'type' => 'offline', 'price' => 150000, 'capacity' => 200, 'sale_start' => Carbon::now()->addDays(10), 'sale_end' => Carbon::now()->addDays(50)],
                ],
                'collaborators' => [
                    ['institution' => 2, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 9: Pelatihan Keselamatan (OFFLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Pelatihan Basic Life Support & First Aid',
                    'description' => 'Pelatihan pertolongan pertama pada kecelakaan (P3K) bersertifikat untuk masyarakat umum dan pekerja kantoran.',
                    'type_name'   => 'Training',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(18),
                    'end_date'    => Carbon::now()->addDays(19),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Kesehatan', 'Pendidikan'],
                'location'   => [
                    'type'                => 'offline',
                    'location_name'       => 'PMI Kota Surabaya',
                    'location_detail'     => 'Aula Utama',
                    'maps_url'            => 'https://maps.google.com/?q=PMI+Surabaya',
                    'latitude'            => -7.2654,
                    'longitude'           => 112.7512,
                    'country'             => 'Indonesia',
                    'province'            => 'Jawa Timur',
                    'city'                => 'Kota Surabaya',
                    'district'            => 'Gubeng',
                    'address_detail'      => 'Jl. Sumatera No. 71',
                    'offline_instruction' => 'Gunakan pakaian bebas rapi dan celana panjang untuk kemudahan sesi praktik RJP (CPR).',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Tiket Pelatihan Umum', 'type' => 'offline', 'price' => 250000, 'capacity' => 40, 'sale_start' => Carbon::now()->subDays(5), 'sale_end' => Carbon::now()->addDays(15)],
                ],
                'collaborators' => [],
            ],

            // ── Event 10: Talkshow Keuangan (ONLINE) ──────────────────────────────────
            [
                'meta' => [
                    'title'       => 'Talkshow Santai: Cerdas Investasi Saham untuk Pemula',
                    'description' => 'Bingung mulai investasi dari mana? Yuk ngobrol santai bareng para perencana keuangan tentang cara baca laporan keuangan dasar dan money management.',
                    'type_name'   => 'Talkshow',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(2),
                    'end_date'    => Carbon::now()->addDays(2),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Bisnis & Ekonomi'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/talkshow-investasi-2025',
                    'online_instruction' => 'Sesi tanya jawab akan menggunakan fitur Q&A di Zoom.',
                ],
                'sessions'   => [],
                'tickets'        => [
                    ['name' => 'Akses Webinar', 'type' => 'online', 'price' => 25000, 'capacity' => 500, 'sale_start' => Carbon::now()->subDays(15), 'sale_end' => Carbon::now()->addDays(1)],
                ],
                'collaborators' => [],
            ],
        ];

        // ─────────────────────────────────────────
        // Loop & Insert setiap event
        // ─────────────────────────────────────────
        $i = 1;
        foreach ($eventsData as $eventData) {
            $meta = $eventData['meta'];

            // -- 1. Insert ke tabel events (TANPA event_type_id) --
            $eventId = DB::table('events')->insertGetId([
                'organizer_id'   => $organizerId,
                'institution_id' => $institutions[$meta['institution']] ?? $institutions[0],
                'title'          => $meta['title'],
                'slug'           => Str::slug($meta['title']),
                'description'    => $meta['description'],
                'image_path'     => "event-banners/{$i}.jpg",
                'start_date'     => $meta['start_date'],
                'end_date'       => $meta['end_date'],
                'timezone'       => $meta['timezone'],
                'status'         => $meta['status'],
                'is_featured'    => $meta['is_featured'],
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // -- 1.5. Insert event_types_event (Pivot Table) --
            $eventTypeId = $eventTypes[$meta['type_name']] ?? null;
            if ($eventTypeId) {
                DB::table('event_types_event')->insertOrIgnore([
                    'event_id'       => $eventId,
                    'event_types_id' => $eventTypeId,
                ]);
            }

            $i++;

            // -- 2. Insert event_categories --
            foreach ($eventData['categories'] as $catName) {
                $catId = $categories[$catName] ?? null;
                if ($catId) {
                    DB::table('event_categories')->insertOrIgnore([
                        'event_id'    => $eventId,
                        'category_id' => $catId,
                    ]);
                }
            }

            // -- 3. Insert event_locations --
            $loc = $eventData['location'];
            DB::table('event_locations')->insert([
                'event_id'            => $eventId,
                'type'                => $loc['type'],
                'platform'            => $loc['platform'] ?? null,
                'meeting_link'        => $loc['meeting_link'] ?? null,
                'online_instruction'  => $loc['online_instruction'] ?? null,
                'location_name'       => $loc['location_name'] ?? null,
                'location_detail'     => $loc['location_detail'] ?? null,
                'maps_url'            => $loc['maps_url'] ?? null,
                'latitude'            => $loc['latitude'] ?? null,
                'longitude'           => $loc['longitude'] ?? null,
                'country'             => $loc['country'] ?? null,
                'province'            => $loc['province'] ?? null,
                'city'                => $loc['city'] ?? null,
                'district'            => $loc['district'] ?? null,
                'address_detail'      => $loc['address_detail'] ?? null,
                'offline_instruction' => $loc['offline_instruction'] ?? null,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            // -- 4. Insert sessions, speakers, dan pivot --
            if (isset($eventData['sessions'])) {
                foreach ($eventData['sessions'] as $sessionData) {
                    $sessionId = DB::table('event_sessions')->insertGetId([
                        'event_id'    => $eventId,
                        'title'       => $sessionData['title'],
                        'description' => $sessionData['description'],
                        'day_number'  => $sessionData['day_number'],
                        'date'        => $sessionData['date'],
                        'start_time'  => $sessionData['start_time'],
                        'end_time'    => $sessionData['end_time'],
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]);

                    if (isset($sessionData['speakers'])) {
                        foreach ($sessionData['speakers'] as $spkData) {
                            $speakerId = DB::table('speakers')
                                ->where('event_id', $eventId)
                                ->where('name', $spkData['name'])
                                ->value('id');

                            if (! $speakerId) {
                                $speakerId = DB::table('speakers')->insertGetId([
                                    'event_id'    => $eventId,
                                    'name'        => $spkData['name'],
                                    'role'        => $spkData['role'],
                                    'bio'         => $spkData['bio'],
                                    'social_link' => null,
                                    'expertise'   => json_encode($spkData['expertise']),
                                ]);
                            }

                            DB::table('event_session_speakers')->insertOrIgnore([
                                'session_id' => $sessionId,
                                'speaker_id' => $speakerId,
                            ]);
                        }
                    }
                }
            }

            // -- 5. Insert event_tickets --
            foreach ($eventData['tickets'] as $ticket) {
                DB::table('event_tickets')->insert([
                    'event_id'   => $eventId,
                    'name'       => $ticket['name'],
                    'type'       => $ticket['type'],
                    'price'      => $ticket['price'],
                    'capacity'   => $ticket['capacity'],
                    'sale_start' => $ticket['sale_start'],
                    'sale_end'   => $ticket['sale_end'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // -- 6. Insert event_collaborators --
            if (isset($eventData['collaborators'])) {
                foreach ($eventData['collaborators'] as $collab) {
                    $instId = $institutions[$collab['institution']] ?? null;
                    if ($instId) {
                        DB::table('event_collaborators')->insertOrIgnore([
                            'event_id'       => $eventId,
                            'institution_id' => $instId,
                            'role'           => $collab['role'],
                        ]);
                    }
                }
            }

            $this->command->info("✅ Event seeded: {$meta['title']}");
        }

        $this->command->info('🎉 EventSeeder selesai! ' . count($eventsData) . ' event berhasil dibuat.');
    }
}
