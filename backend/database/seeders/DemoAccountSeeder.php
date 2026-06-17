<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoAccountSeeder extends Seeder
{
    /**
     * Seed 5 Member + 5 Organizer accounts.
     *
     * - Setiap Organizer memiliki minimal 1 event berstatus "completed".
     * - Setiap Member sudah terdaftar (punya tiket aktif + attendance log)
     *   di minimal 1 event yang sudah selesai.
     */
    public function run(): void
    {
        // ─────────────────────────────────────────────
        // Ambil referensi master data yang sudah di-seed
        // ─────────────────────────────────────────────
        $institutions = DB::table('institutions')->pluck('id')->toArray();
        $categories   = DB::table('categories')->pluck('id', 'name');
        $eventTypes   = DB::table('event_types')->pluck('id', 'name');

        if (empty($institutions) || $categories->isEmpty() || $eventTypes->isEmpty()) {
            $this->command->warn('⚠️  Jalankan CategorySeeder, EventTypeSeeder, dan InstitutionSeeder terlebih dahulu!');
            return;
        }

        // ─────────────────────────────────────────────
        // 1. Buat 5 Akun Member (Participant)
        // ─────────────────────────────────────────────
        $memberData = [
            ['name' => 'Peserta 1', 'email' => 'peserta1@kampusx.com'],
            ['name' => 'Peserta 2', 'email' => 'peserta2@kampusx.com'],
            ['name' => 'Peserta 3', 'email' => 'peserta3@kampusx.com'],
            ['name' => 'Peserta 4', 'email' => 'peserta4@kampusx.com'],
            ['name' => 'Peserta 5', 'email' => 'peserta5@kampusx.com'],
        ];

        $memberIds = [];
        foreach ($memberData as $m) {
            $memberIds[] = DB::table('users')->insertGetId([
                'name'              => $m['name'],
                'email'             => $m['email'],
                'phone'             => '08' . rand(1000000000, 9999999999),
                'password'          => Hash::make('kampusx123'),
                'role'              => 'participant',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
        $this->command->info('✅ 5 akun Member berhasil dibuat.');

        // ─────────────────────────────────────────────
        // 2. Buat 5 Akun Organizer
        // ─────────────────────────────────────────────
        $organizerData = [
            ['name' => 'Organizer 1', 'email' => 'org1@kampusx.com'],
            ['name' => 'Organizer 2', 'email' => 'org2@kampusx.com'],
            ['name' => 'Organizer 3', 'email' => 'org3@kampusx.com'],
            ['name' => 'Organizer 4', 'email' => 'org4@kampusx.com'],
            ['name' => 'Organizer 5', 'email' => 'org5@kampusx.com'],
        ];

        $organizerIds = [];
        foreach ($organizerData as $o) {
            $organizerIds[] = DB::table('users')->insertGetId([
                'name'              => $o['name'],
                'email'             => $o['email'],
                'phone'             => '08' . rand(1000000000, 9999999999),
                'password'          => Hash::make('kampusx123'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
        $this->command->info('✅ 5 akun Organizer berhasil dibuat.');

        // ─────────────────────────────────────────────
        // 3. Buat 5 Event COMPLETED (1 per Organizer)
        // ─────────────────────────────────────────────
        $completedEvents = [
            [
                'title'       => 'Workshop Data Science & Python untuk Pemula',
                'description' => 'Workshop intensif 2 hari membahas fundamental Data Science menggunakan Python, Pandas, dan Matplotlib. Peserta akan belajar mengolah dataset nyata dan membuat visualisasi data yang informatif.',
                'type_name'   => 'Workshop',
                'categories'  => ['Teknik & Tech', 'Pendidikan'],
                'start_date'  => Carbon::now()->subDays(30),
                'end_date'    => Carbon::now()->subDays(29),
                'location'    => [
                    'type'           => 'offline',
                    'location_name'  => 'Gedung Informatika ITB',
                    'location_detail'=> 'Lab Komputer Lt. 3',
                    'maps_url'       => 'https://maps.google.com/?q=ITB+Bandung',
                    'latitude'       => -6.8915,
                    'longitude'      => 107.6107,
                    'country'        => 'Indonesia',
                    'province'       => 'Jawa Barat',
                    'city'           => 'Kota Bandung',
                    'district'       => 'Coblong',
                    'address_detail' => 'Jl. Ganesha No. 10, Bandung',
                ],
                'sessions' => [
                    ['title' => 'Python Fundamentals & Pandas', 'day' => 1, 'start' => '09:00', 'end' => '16:00',
                     'speaker_name' => 'Dr. Irfan Hakim', 'speaker_role' => 'Instructor', 'speaker_bio' => 'Data Scientist senior di Tokopedia.'],
                    ['title' => 'Visualisasi Data & Mini Project', 'day' => 2, 'start' => '09:00', 'end' => '15:00',
                     'speaker_name' => null, 'speaker_role' => null, 'speaker_bio' => null],
                ],
                'ticket_name'  => 'Tiket Workshop',
                'ticket_price' => 150000,
                'ticket_cap'   => 40,
            ],
            [
                'title'       => 'Seminar Nasional Kewirausahaan Digital 2026',
                'description' => 'Seminar yang menghadirkan founder startup unicorn Indonesia untuk berbagi pengalaman membangun bisnis digital dari nol. Dilengkapi sesi networking eksklusif.',
                'type_name'   => 'Conference',
                'categories'  => ['Bisnis & Ekonomi'],
                'start_date'  => Carbon::now()->subDays(21),
                'end_date'    => Carbon::now()->subDays(21),
                'location'    => [
                    'type'               => 'online',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/seminar-kewirausahaan',
                    'online_instruction' => 'Link Zoom akan dikirimkan via email H-1.',
                ],
                'sessions' => [
                    ['title' => 'Keynote: Membangun Startup di Era AI', 'day' => 1, 'start' => '09:00', 'end' => '12:00',
                     'speaker_name' => 'Nadiem Hakim', 'speaker_role' => 'Keynote Speaker', 'speaker_bio' => 'CEO TechVenture Indonesia.'],
                ],
                'ticket_name'  => 'Tiket Online (Gratis)',
                'ticket_price' => 0,
                'ticket_cap'   => 500,
            ],
            [
                'title'       => 'Bootcamp UI/UX Design: Dari Riset ke Prototype',
                'description' => 'Pelatihan menyeluruh selama 3 hari yang membahas proses desain dari user research, wireframing, hingga high-fidelity prototype menggunakan Figma. Sertifikat resmi diberikan bagi peserta yang menyelesaikan tugas akhir.',
                'type_name'   => 'Bootcamp',
                'categories'  => ['Seni & Desain', 'Teknik & Tech'],
                'start_date'  => Carbon::now()->subDays(14),
                'end_date'    => Carbon::now()->subDays(12),
                'location'    => [
                    'type'           => 'hybrid',
                    'platform'       => 'Google Meet',
                    'meeting_link'   => 'https://meet.google.com/uiux-bootcamp',
                    'location_name'  => 'Co-Working Space Kolega',
                    'location_detail'=> 'Lantai 5, Ruang Workshop',
                    'maps_url'       => 'https://maps.google.com/?q=Kolega+Coworking+Jakarta',
                    'latitude'       => -6.2250,
                    'longitude'      => 106.8490,
                    'country'        => 'Indonesia',
                    'province'       => 'DKI Jakarta',
                    'city'           => 'Jakarta Selatan',
                    'district'       => 'Kuningan',
                    'address_detail' => 'Jl. Rasuna Said Kav. B-32',
                ],
                'sessions' => [
                    ['title' => 'User Research & Persona Building', 'day' => 1, 'start' => '09:00', 'end' => '17:00',
                     'speaker_name' => 'Sarah Andini', 'speaker_role' => 'Lead Designer', 'speaker_bio' => 'UX Lead di Gojek.'],
                    ['title' => 'Wireframing & Interaction Design', 'day' => 2, 'start' => '09:00', 'end' => '17:00',
                     'speaker_name' => null, 'speaker_role' => null, 'speaker_bio' => null],
                    ['title' => 'High-Fidelity Prototype & Presentasi', 'day' => 3, 'start' => '09:00', 'end' => '16:00',
                     'speaker_name' => null, 'speaker_role' => null, 'speaker_bio' => null],
                ],
                'ticket_name'  => 'Tiket Bootcamp',
                'ticket_price' => 350000,
                'ticket_cap'   => 30,
            ],
            [
                'title'       => 'Talkshow: Peran Gen Z dalam Pembangunan Berkelanjutan',
                'description' => 'Bincang santai bersama aktivis lingkungan, akademisi, dan content creator tentang kontribusi nyata generasi muda terhadap Sustainable Development Goals (SDGs) di Indonesia.',
                'type_name'   => 'Talkshow',
                'categories'  => ['Ilmu Sosial', 'Pendidikan'],
                'start_date'  => Carbon::now()->subDays(10),
                'end_date'    => Carbon::now()->subDays(10),
                'location'    => [
                    'type'               => 'online',
                    'platform'           => 'YouTube Live',
                    'meeting_link'       => 'https://youtube.com/live/genz-sdgs',
                    'online_instruction' => 'Tonton langsung di channel YouTube resmi.',
                ],
                'sessions' => [
                    ['title' => 'Panel Discussion: SDGs & Anak Muda', 'day' => 1, 'start' => '19:00', 'end' => '21:00',
                     'speaker_name' => 'Livi Zheng', 'speaker_role' => 'Moderator', 'speaker_bio' => 'Sutradara & aktivis sosial.'],
                ],
                'ticket_name'  => 'Tiket Gratis',
                'ticket_price' => 0,
                'ticket_cap'   => 2000,
            ],
            [
                'title'       => 'Hackathon: Smart Campus Solutions',
                'description' => 'Kompetisi hackathon 24 jam untuk merancang solusi teknologi yang memecahkan masalah nyata di lingkungan kampus Indonesia. Total hadiah Rp 25 juta dan kesempatan inkubasi di kampus terbaik.',
                'type_name'   => 'Competition',
                'categories'  => ['Teknik & Tech'],
                'start_date'  => Carbon::now()->subDays(7),
                'end_date'    => Carbon::now()->subDays(6),
                'location'    => [
                    'type'           => 'offline',
                    'location_name'  => 'Innovation Hub Universitas Indonesia',
                    'location_detail'=> 'Makara Art Center',
                    'maps_url'       => 'https://maps.google.com/?q=UI+Depok',
                    'latitude'       => -6.3625,
                    'longitude'      => 106.8275,
                    'country'        => 'Indonesia',
                    'province'       => 'Jawa Barat',
                    'city'           => 'Kota Depok',
                    'district'       => 'Beji',
                    'address_detail' => 'Kampus UI, Depok 16424',
                ],
                'sessions' => [
                    ['title' => 'Briefing & Hacking Begins', 'day' => 1, 'start' => '08:00', 'end' => '23:59',
                     'speaker_name' => 'Prof. Eko Budiman', 'speaker_role' => 'Juri Utama', 'speaker_bio' => 'Profesor Ilmu Komputer UI.'],
                    ['title' => 'Presentasi & Penilaian Akhir', 'day' => 2, 'start' => '08:00', 'end' => '14:00',
                     'speaker_name' => null, 'speaker_role' => null, 'speaker_bio' => null],
                ],
                'ticket_name'  => 'Tiket Peserta (Per Tim)',
                'ticket_price' => 50000,
                'ticket_cap'   => 100,
            ],
        ];

        $createdEventIds = [];

        foreach ($completedEvents as $idx => $eventData) {
            $organizerId   = $organizerIds[$idx];
            $institutionId = $institutions[$idx % count($institutions)];

            // ── Insert Event ──
            $eventId = DB::table('events')->insertGetId([
                'organizer_id'   => $organizerId,
                'institution_id' => $institutionId,
                'title'          => $eventData['title'],
                'slug'           => Str::slug($eventData['title']),
                'description'    => $eventData['description'],
                'image_path'     => null,
                'start_date'     => $eventData['start_date'],
                'end_date'       => $eventData['end_date'],
                'timezone'       => 'Asia/Jakarta',
                'status'         => 'completed',
                'is_featured'    => false,
                'created_at'     => $eventData['start_date']->copy()->subDays(30),
                'updated_at'     => now(),
            ]);
            $createdEventIds[] = $eventId;

            // ── Event Type pivot ──
            $eventTypeId = $eventTypes[$eventData['type_name']] ?? null;
            if ($eventTypeId) {
                DB::table('event_types_event')->insertOrIgnore([
                    'event_id'       => $eventId,
                    'event_types_id' => $eventTypeId,
                ]);
            }

            // ── Categories ──
            foreach ($eventData['categories'] as $catName) {
                $catId = $categories[$catName] ?? null;
                if ($catId) {
                    DB::table('event_categories')->insertOrIgnore([
                        'event_id'    => $eventId,
                        'category_id' => $catId,
                    ]);
                }
            }

            // ── Location ──
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
                'offline_instruction' => null,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            // ── Sessions & Speakers ──
            $sessionIds = [];
            foreach ($eventData['sessions'] as $sess) {
                $sessionDate = $eventData['start_date']->copy()->addDays($sess['day'] - 1);
                $sessionId = DB::table('event_sessions')->insertGetId([
                    'event_id'    => $eventId,
                    'title'       => $sess['title'],
                    'description' => $sess['title'],
                    'day_number'  => $sess['day'],
                    'date'        => $sessionDate->toDateString(),
                    'start_time'  => $sess['start'] . ':00',
                    'end_time'    => $sess['end'] . ':00',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
                $sessionIds[] = $sessionId;

                // Speaker (jika ada)
                if (!empty($sess['speaker_name'])) {
                    $speakerId = DB::table('speakers')->insertGetId([
                        'event_id'  => $eventId,
                        'name'      => $sess['speaker_name'],
                        'role'      => $sess['speaker_role'],
                        'bio'       => $sess['speaker_bio'],
                        'expertise' => json_encode([]),
                    ]);

                    DB::table('event_session_speakers')->insertOrIgnore([
                        'session_id' => $sessionId,
                        'speaker_id' => $speakerId,
                    ]);
                }
            }

            // ── Ticket Type ──
            $eventTicketId = DB::table('event_tickets')->insertGetId([
                'event_id'   => $eventId,
                'name'       => $eventData['ticket_name'],
                'type'       => ($loc['type'] === 'online') ? 'online' : 'offline',
                'price'      => $eventData['ticket_price'],
                'capacity'   => $eventData['ticket_cap'],
                'sale_start' => $eventData['start_date']->copy()->subDays(20),
                'sale_end'   => $eventData['start_date']->copy()->subDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info("✅ Event completed: {$eventData['title']} (Organizer: {$organizerData[$idx]['name']})");
        }

        // ─────────────────────────────────────────────
        // 4. Daftarkan setiap Member ke minimal 1 Event
        //    (Buat Order → OrderItem → Ticket → AttendanceLog)
        // ─────────────────────────────────────────────
        //    Distribusi: Member 0 → Event 0, Member 1 → Event 1, dst.
        //    Lalu Member 0 & 1 juga ikut Event 4 (supaya ada event dgn >1 peserta)
        // ─────────────────────────────────────────────

        foreach ($memberIds as $mIdx => $memberId) {
            $eventId    = $createdEventIds[$mIdx % count($createdEventIds)];
            $eventInfo  = DB::table('events')->where('id', $eventId)->first();
            $memberInfo = $memberData[$mIdx];

            $this->registerMemberToEvent($memberId, $memberInfo, $eventId, $eventInfo);
        }

        // Tambahan: Member 0 dan 1 juga ikut ke event lain supaya punya >1 tiket
        $this->registerMemberToEvent($memberIds[0], $memberData[0], $createdEventIds[3], DB::table('events')->find($createdEventIds[3]));
        $this->registerMemberToEvent($memberIds[1], $memberData[1], $createdEventIds[4], DB::table('events')->find($createdEventIds[4]));

        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════');
        $this->command->info('🎉 DemoAccountSeeder selesai!');
        $this->command->info('═══════════════════════════════════════════');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            array_merge(
                array_map(fn($m) => ['Member', $m['email'], 'kampusx123'], $memberData),
                array_map(fn($o) => ['Organizer', $o['email'], 'kampusx123'], $organizerData),
            )
        );
    }

    /**
     * Helper: Daftarkan member ke sebuah event (Order + Ticket + Attendance).
     */
    private function registerMemberToEvent(int $memberId, array $memberInfo, int $eventId, object $eventInfo): void
    {
        // Cek duplikat
        $exists = DB::table('orders')
            ->where('event_id', $eventId)
            ->where('user_id', $memberId)
            ->exists();

        if ($exists) {
            return;
        }

        $ticketPrice = DB::table('event_tickets')->where('event_id', $eventId)->value('price') ?? 0;

        // ── Order ──
        $orderId = DB::table('orders')->insertGetId([
            'order_id'    => 'ORD-DEMO-' . strtoupper(Str::random(8)),
            'event_id'    => $eventId,
            'user_id'     => $memberId,
            'amount'      => $ticketPrice,
            'total_price' => $ticketPrice,
            'status'      => 'paid',
            'paid_at'     => $eventInfo->start_date,
            'created_at'  => Carbon::parse($eventInfo->start_date)->subDays(5),
            'updated_at'  => Carbon::parse($eventInfo->start_date)->subDays(5),
        ]);

        // ── Order Item ──
        $orderItemId = DB::table('order_items')->insertGetId([
            'order_id'   => $orderId,
            'quantity'   => 1,
            'price'      => $ticketPrice,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── Ticket ──
        $ticketCode = 'DEMO' . strtoupper(Str::random(6));
        $ticketId = DB::table('tickets')->insertGetId([
            'participant_id' => $memberId,
            'order_item_id'  => $orderItemId,
            'attendee_name'  => $memberInfo['name'],
            'attendee_email' => $memberInfo['email'],
            'ticket_code'    => $ticketCode,
            'qr_token'       => Str::uuid()->toString(),
            'status'         => 'used', // Event sudah selesai, tiket sudah dipakai
            'created_at'     => Carbon::parse($eventInfo->start_date)->subDays(5),
            'updated_at'     => $eventInfo->start_date,
        ]);

        // ── Attendance Log (Check-in) ──
        $firstSessionId = DB::table('event_sessions')
            ->where('event_id', $eventId)
            ->orderBy('day_number')
            ->orderBy('start_time')
            ->value('id');

        DB::table('attendance_logs')->insert([
            'ticket_id'  => $ticketId,
            'event_id'   => $eventId,
            'post_id'    => null,
            'session_id' => $firstSessionId,
            'scan_time'  => $eventInfo->start_date,
            'scanned_by' => null,
            'method'     => 'qr',
            'created_at' => $eventInfo->start_date,
            'updated_at' => $eventInfo->start_date,
        ]);

        $this->command->info("  🎫 {$memberInfo['name']} → terdaftar & hadir di: {$eventInfo->title}");
    }
}
