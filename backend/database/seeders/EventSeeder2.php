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

        // Pastikan organizer & institusi tersedia
        if (! $organizerId || empty($institutions)) {
            $this->command->warn('Jalankan UserSeeder dan InstitutionSeeder terlebih dahulu!');
            return;
        }

        // ─────────────────────────────────────────
        // Definisi event yang akan dibuat
        // ─────────────────────────────────────────
        $eventsData = [

            // ── Event 1: Konferensi AI Multi-Hari ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Indonesia AI Summit 2025',
                    'description' => 'Konferensi kecerdasan buatan terbesar di Indonesia yang menghadirkan para ahli dan praktisi AI dari berbagai sektor. Dua hari penuh diskusi, workshop, dan networking bersama pemimpin industri teknologi.',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(30),
                    'end_date'    => Carbon::now()->addDays(31),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0, // index dari $institutions
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
                        'description' => 'Pembukaan resmi summit dan keynote speech dari Menteri Kominfo tentang roadmap AI nasional.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(30)->toDateString(),
                        'start_time'  => '08:30:00',
                        'end_time'    => '10:00:00',
                        'speakers'    => [
                            ['name' => 'Dr. Budi Santoso', 'role' => 'Keynote Speaker', 'bio' => 'Pakar AI dan Guru Besar Informatika UI.', 'expertise' => ['Machine Learning', 'NLP', 'Data Science']],
                            ['name' => 'Rina Marlina', 'role' => 'Moderator', 'bio' => 'Tech journalist dan host podcast teknologi.', 'expertise' => ['Tech Journalism']],
                        ],
                    ],
                    [
                        'title'       => 'Panel: Etika dan Regulasi AI',
                        'description' => 'Diskusi panel tentang pentingnya regulasi AI yang bertanggung jawab dan dampaknya terhadap masyarakat.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(30)->toDateString(),
                        'start_time'  => '10:30:00',
                        'end_time'    => '12:00:00',
                        'speakers'    => [
                            ['name' => 'Prof. Agus Wijaya', 'role' => 'Panelist', 'bio' => 'Profesor Hukum Teknologi Universitas Gadjah Mada.', 'expertise' => ['Hukum Teknologi', 'Kebijakan Digital']],
                            ['name' => 'Sarah Chen', 'role' => 'Panelist', 'bio' => 'AI Ethics Researcher di Google DeepMind.', 'expertise' => ['AI Ethics', 'Responsible AI']],
                        ],
                    ],
                    [
                        'title'       => 'Workshop: Implementasi LLM untuk Bisnis',
                        'description' => 'Sesi hands-on membangun solusi berbasis Large Language Model untuk kebutuhan enterprise.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(30)->toDateString(),
                        'start_time'  => '13:00:00',
                        'end_time'    => '15:30:00',
                        'speakers'    => [
                            ['name' => 'Hendra Kusuma', 'role' => 'Workshop Facilitator', 'bio' => 'Lead AI Engineer di Gojek Indonesia.', 'expertise' => ['LLM', 'Python', 'MLOps']],
                        ],
                    ],
                    [
                        'title'       => 'AI in Healthcare: Revolusi Diagnostik',
                        'description' => 'Presentasi tentang penerapan AI dalam dunia kesehatan, dari deteksi penyakit hingga drug discovery.',
                        'day_number'  => 2,
                        'date'        => Carbon::now()->addDays(31)->toDateString(),
                        'start_time'  => '09:00:00',
                        'end_time'    => '10:30:00',
                        'speakers'    => [
                            ['name' => 'dr. Maya Putri, Sp.PD', 'role' => 'Speaker', 'bio' => 'Dokter Spesialis Penyakit Dalam dan peneliti AI Healthcare RSCM.', 'expertise' => ['Medical AI', 'Digital Health']],
                        ],
                    ],
                    [
                        'title'       => 'Closing Panel & Networking',
                        'description' => 'Penutupan summit dengan sesi networking eksklusif bersama seluruh pembicara.',
                        'day_number'  => 2,
                        'date'        => Carbon::now()->addDays(31)->toDateString(),
                        'start_time'  => '15:00:00',
                        'end_time'    => '17:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Early Bird Online', 'type' => 'online',  'price' => 150000,  'capacity' => 500, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(15)],
                    ['name' => 'Regular Online',    'type' => 'online',  'price' => 250000,  'capacity' => 1000,'sale_start' => Carbon::now()->addDays(16), 'sale_end' => Carbon::now()->addDays(28)],
                    ['name' => 'Offline Pass',      'type' => 'offline', 'price' => 750000,  'capacity' => 300, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(25)],
                    ['name' => 'VIP All-Access',    'type' => 'offline', 'price' => 1500000, 'capacity' => 50,  'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(20)],
                ],
                'collaborators'  => [
                    ['institution' => 1, 'role' => 'co_host'],
                    ['institution' => 2, 'role' => 'sponsor'],
                    ['institution' => 6, 'role' => 'media_partner'],
                ],
            ],

            // ── Event 2: Seminar Online Satu Hari ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Webinar Nasional: Startup Funding & Pitching 101',
                    'description' => 'Webinar intensif sehari untuk para founder startup yang ingin memahami ekosistem pendanaan, cara membuat pitch deck yang menarik, dan tips negosiasi dengan investor.',
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
                    'online_instruction' => 'Link akan dikirim ke email 1 jam sebelum acara dimulai. Harap hadir 10 menit lebih awal.',
                ],
                'sessions'   => [
                    [
                        'title'      => 'Landscape Pendanaan Startup Indonesia',
                        'description'=> 'Overview ekosistem VC, angel investor, dan program akselerator yang tersedia di Indonesia.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(14)->toDateString(),
                        'start_time' => '09:00:00',
                        'end_time'   => '10:30:00',
                        'speakers'   => [
                            ['name' => 'Kevin Tanaka', 'role' => 'VC Partner', 'bio' => 'Partner di Convergence Ventures, investor awal Tokopedia dan beberapa startup unicorn.', 'expertise' => ['Venture Capital', 'Early Stage Investing']],
                        ],
                    ],
                    [
                        'title'      => 'Membuat Pitch Deck yang Mematikan',
                        'description'=> 'Panduan praktis membangun pitch deck yang menarik perhatian investor dalam 3 menit pertama.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(14)->toDateString(),
                        'start_time' => '11:00:00',
                        'end_time'   => '12:30:00',
                        'speakers'   => [
                            ['name' => 'Dewi Rahayu', 'role' => 'Startup Mentor', 'bio' => 'Founder 2 startup yang telah exit, kini menjadi mentor di Y Combinator Indonesia.', 'expertise' => ['Product Strategy', 'Fundraising', 'Go-to-Market']],
                        ],
                    ],
                    [
                        'title'      => 'Live Pitch Practice & Feedback',
                        'description'=> 'Peserta terpilih mempresentasikan startup mereka dan mendapatkan feedback langsung dari panel investor.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(14)->toDateString(),
                        'start_time' => '13:30:00',
                        'end_time'   => '15:30:00',
                        'speakers'   => [
                            ['name' => 'Kevin Tanaka', 'role' => 'Judge', 'bio' => 'Partner di Convergence Ventures.', 'expertise' => ['Venture Capital']],
                            ['name' => 'Dewi Rahayu', 'role' => 'Judge', 'bio' => 'Founder dan startup mentor.', 'expertise' => ['Product Strategy']],
                            ['name' => 'Rizky Hamdani', 'role' => 'Judge', 'bio' => 'CEO & Co-Founder PasarModal, fintech startup Series B.', 'expertise' => ['Fintech', 'Operations']],
                        ],
                    ],
                ],
                'tickets'       => [
                    ['name' => 'Tiket Reguler', 'type' => 'online', 'price' => 0,      'capacity' => 1000, 'sale_start' => Carbon::now()->subDays(5),  'sale_end' => Carbon::now()->addDays(13)],
                    ['name' => 'Tiket Premium (+ Rekaman)', 'type' => 'online', 'price' => 99000, 'capacity' => 200,  'sale_start' => Carbon::now()->subDays(5),  'sale_end' => Carbon::now()->addDays(13)],
                ],
                'collaborators' => [
                    ['institution' => 3, 'role' => 'sponsor'],
                    ['institution' => 7, 'role' => 'co_host'],
                ],
            ],

            // ── Event 3: Kompetisi / Hackathon Offline ─────────────────────────
            [
                'meta' => [
                    'title'       => 'HackBandung 2025 — 36 Hours of Innovation',
                    'description' => 'Hackathon 36 jam non-stop di Kota Bandung! Tim mahasiswa dari seluruh Indonesia bersaing membangun solusi teknologi untuk isu sosial, pendidikan, dan lingkungan. Total hadiah Rp 150 juta.',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(45),
                    'end_date'    => Carbon::now()->addDays(46),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Teknik & Tech', 'Pendidikan', 'Seni & Desain'],
                'location'   => [
                    'type'            => 'offline',
                    'location_name'   => 'Gedung CRCS ITB',
                    'location_detail' => 'Jl. Ganesa No.10, Lb. Siliwangi',
                    'maps_url'        => 'https://maps.google.com/?q=ITB+Bandung',
                    'latitude'        => -6.8915,
                    'longitude'       => 107.6107,
                    'country'         => 'Indonesia',
                    'province'        => 'Jawa Barat',
                    'city'            => 'Kota Bandung',
                    'district'        => 'Coblong',
                    'address_detail'  => 'Jl. Ganesa No.10, Lebak Siliwangi',
                    'offline_instruction' => 'Peserta wajib membawa laptop, charger, dan sleeping bag. Konsumsi disediakan panitia selama 36 jam.',
                ],
                'sessions'   => [
                    [
                        'title'      => 'Registrasi & Opening Ceremony',
                        'description'=> 'Check-in peserta, pembagian ID card, dan briefing peraturan hackathon.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(45)->toDateString(),
                        'start_time' => '07:00:00',
                        'end_time'   => '09:00:00',
                        'speakers'   => [
                            ['name' => 'Dimas Pratama', 'role' => 'MC', 'bio' => 'Ketua Pelaksana HackBandung 2025.', 'expertise' => ['Event Management']],
                        ],
                    ],
                    [
                        'title'      => 'Hacking Session Dimulai!',
                        'description'=> '36 jam pengerjaan proyek dimulai. Mentor teknis siap membantu tim peserta.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(45)->toDateString(),
                        'start_time' => '09:00:00',
                        'end_time'   => '23:59:00',
                        'speakers'   => [],
                    ],
                    [
                        'title'      => 'Tech Talk: Building for Scale',
                        'description'=> 'Guest lecture dari engineer senior Tokopedia tentang arsitektur sistem yang scalable.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(45)->toDateString(),
                        'start_time' => '14:00:00',
                        'end_time'   => '15:00:00',
                        'speakers'   => [
                            ['name' => 'Anita Yulianti', 'role' => 'Guest Lecturer', 'bio' => 'Staff Engineer di Tokopedia, spesialis distributed systems.', 'expertise' => ['Distributed Systems', 'Microservices', 'Golang']],
                        ],
                    ],
                    [
                        'title'      => 'Final Submission & Presentasi',
                        'description'=> 'Deadline pengumpulan proyek dan sesi presentasi 5 menit per tim kepada dewan juri.',
                        'day_number' => 2,
                        'date'       => Carbon::now()->addDays(46)->toDateString(),
                        'start_time' => '09:00:00',
                        'end_time'   => '13:00:00',
                        'speakers'   => [],
                    ],
                    [
                        'title'      => 'Penjurian & Pengumuman Pemenang',
                        'description'=> 'Deliberasi juri dan pengumuman pemenang. Dihadiri oleh perwakilan sponsor dan media.',
                        'day_number' => 2,
                        'date'       => Carbon::now()->addDays(46)->toDateString(),
                        'start_time' => '14:00:00',
                        'end_time'   => '16:00:00',
                        'speakers'   => [
                            ['name' => 'Prof. Ir. Bambang Riyanto', 'role' => 'Chief Judge', 'bio' => 'Dekan Sekolah Teknik Elektro dan Informatika ITB.', 'expertise' => ['Computer Vision', 'Robotics']],
                            ['name' => 'Anita Yulianti', 'role' => 'Judge', 'bio' => 'Staff Engineer di Tokopedia.', 'expertise' => ['Distributed Systems']],
                        ],
                    ],
                ],
                'tickets'       => [
                    ['name' => 'Registrasi Tim (Maks. 4 orang)', 'type' => 'offline', 'price' => 200000, 'capacity' => 150, 'sale_start' => Carbon::now()->subDays(20), 'sale_end' => Carbon::now()->addDays(40)],
                ],
                'collaborators' => [
                    ['institution' => 1, 'role' => 'co_host'],
                    ['institution' => 2, 'role' => 'sponsor'],
                    ['institution' => 4, 'role' => 'media_partner'],
                ],
            ],

            // ── Event 4: Workshop Seni & Desain ────────────────────────────────
            [
                'meta' => [
                    'title'       => 'UI/UX Bootcamp: Dari Wireframe ke Prototype',
                    'description' => 'Bootcamp intensif 3 sesi yang mengajarkan proses desain produk digital dari riset pengguna, wireframing, hingga membuat prototype interaktif menggunakan Figma.',
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
                    'online_instruction' => 'Install Figma (gratis) sebelum sesi dimulai. Link Zoom akan dikirim H-1 acara.',
                ],
                'sessions'   => [
                    [
                        'title'      => 'Sesi 1: User Research & Empathy Mapping',
                        'description'=> 'Memahami pengguna melalui teknik interview, survey, dan empathy map.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(7)->toDateString(),
                        'start_time' => '09:00:00',
                        'end_time'   => '11:00:00',
                        'speakers'   => [
                            ['name' => 'Fira Azahra', 'role' => 'UX Researcher', 'bio' => 'Senior UX Researcher di Shopee Indonesia dengan pengalaman 7 tahun.', 'expertise' => ['User Research', 'Usability Testing', 'UX Writing']],
                        ],
                    ],
                    [
                        'title'      => 'Sesi 2: Information Architecture & Wireframing',
                        'description'=> 'Merancang struktur informasi dan membuat wireframe low-fidelity menggunakan Figma.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(7)->toDateString(),
                        'start_time' => '13:00:00',
                        'end_time'   => '15:00:00',
                        'speakers'   => [
                            ['name' => 'Rafi Hernandez', 'role' => 'UI/UX Designer', 'bio' => 'Lead Product Designer di Bukalapak.', 'expertise' => ['Figma', 'Design System', 'Interaction Design']],
                        ],
                    ],
                    [
                        'title'      => 'Sesi 3: Prototyping & Usability Testing',
                        'description'=> 'Mengubah desain menjadi prototype interaktif dan melakukan usability test bersama.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(7)->toDateString(),
                        'start_time' => '15:30:00',
                        'end_time'   => '17:30:00',
                        'speakers'   => [
                            ['name' => 'Fira Azahra', 'role' => 'Facilitator', 'bio' => 'Senior UX Researcher di Shopee Indonesia.', 'expertise' => ['Usability Testing']],
                            ['name' => 'Rafi Hernandez', 'role' => 'Facilitator', 'bio' => 'Lead Product Designer di Bukalapak.', 'expertise' => ['Prototyping']],
                        ],
                    ],
                ],
                'tickets'       => [
                    ['name' => 'Tiket Peserta', 'type' => 'online', 'price' => 195000, 'capacity' => 100, 'sale_start' => Carbon::now()->subDays(3), 'sale_end' => Carbon::now()->addDays(6)],
                ],
                'collaborators' => [
                    ['institution' => 4, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 5: Event Kesehatan & Musik ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'FestiFit 2025: Gerak Sehat, Jiwa Sehat',
                    'description' => 'Festival kesehatan dan wellness yang menggabungkan senam massal, talkshow kesehatan mental, pameran produk sehat, dan live music akustik. Terbuka untuk umum, gratis!',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(21),
                    'end_date'    => Carbon::now()->addDays(21),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Kesehatan', 'Musik & Hiburan', 'Ilmu Sosial'],
                'location'   => [
                    'type'            => 'offline',
                    'location_name'   => 'Lapangan Gasibu',
                    'location_detail' => 'Depan Gedung Sate, Bandung',
                    'maps_url'        => 'https://maps.google.com/?q=Lapangan+Gasibu+Bandung',
                    'latitude'        => -6.9022,
                    'longitude'       => 107.6186,
                    'country'         => 'Indonesia',
                    'province'        => 'Jawa Barat',
                    'city'            => 'Kota Bandung',
                    'district'        => 'Sumur Bandung',
                    'address_detail'  => 'Jl. Diponegoro, Citarum',
                    'offline_instruction' => 'Kenakan pakaian olahraga yang nyaman. Bawa air minum sendiri. Parkir tersedia di sekitar area Gasibu.',
                ],
                'sessions'   => [
                    [
                        'title'      => 'Senam Massal Bersama',
                        'description'=> 'Senam aerobik dan Zumba bersama ratusan peserta dipandu instruktur bersertifikat.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(21)->toDateString(),
                        'start_time' => '06:30:00',
                        'end_time'   => '08:00:00',
                        'speakers'   => [
                            ['name' => 'Yolla Fitriani', 'role' => 'Instruktur Senam', 'bio' => 'Certified Zumba Instructor dan personal trainer.', 'expertise' => ['Zumba', 'Aerobics', 'Personal Training']],
                        ],
                    ],
                    [
                        'title'      => 'Talkshow: Kesehatan Mental di Era Digital',
                        'description'=> 'Diskusi ringan bersama psikolog tentang cara menjaga kesehatan mental di tengah tuntutan media sosial.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(21)->toDateString(),
                        'start_time' => '08:30:00',
                        'end_time'   => '10:00:00',
                        'speakers'   => [
                            ['name' => 'Prita Nadia, M.Psi.', 'role' => 'Psikolog', 'bio' => 'Psikolog klinis dan content creator kesehatan mental @pritatalk.', 'expertise' => ['Kesehatan Mental', 'Psikologi Klinis', 'Digital Wellbeing']],
                        ],
                    ],
                    [
                        'title'      => 'Live Music Akustik',
                        'description'=> 'Penampilan live music akustik dari band lokal Bandung. Santai dan nikmati sore bersama.',
                        'day_number' => 1,
                        'date'       => Carbon::now()->addDays(21)->toDateString(),
                        'start_time' => '15:00:00',
                        'end_time'   => '17:30:00',
                        'speakers'   => [
                            ['name' => 'Reika & The Sunsets', 'role' => 'Performer', 'bio' => 'Band indie pop Bandung dengan single hits "Senja di Dago".', 'expertise' => ['Musik Indie', 'Akustik']],
                        ],
                    ],
                ],
                'tickets'       => [
                    ['name' => 'Tiket Gratis (Registrasi Wajib)', 'type' => 'offline', 'price' => 0, 'capacity' => 5000, 'sale_start' => Carbon::now()->subDays(7), 'sale_end' => Carbon::now()->addDays(20)],
                ],
                'collaborators' => [
                    ['institution' => 5, 'role' => 'co_host'],
                    ['institution' => 0, 'role' => 'sponsor'],
                ],
            ],
        ];

        // ─────────────────────────────────────────
        // Loop & Insert setiap event
        // ─────────────────────────────────────────
        foreach ($eventsData as $eventData) {
            $meta = $eventData['meta'];

            // -- 1. Insert ke tabel events --
            $eventId = DB::table('events')->insertGetId([
                'organizer_id'   => $organizerId,
                'institution_id' => $institutions[$meta['institution']] ?? $institutions[0],
                'title'          => $meta['title'],
                'slug'           => Str::slug($meta['title']),
                'description'    => $meta['description'],
                'image_path'     => null,
                'start_date'     => $meta['start_date'],
                'end_date'       => $meta['end_date'],
                'timezone'       => $meta['timezone'],
                'status'         => $meta['status'],
                'is_featured'    => $meta['is_featured'],
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

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

                foreach ($sessionData['speakers'] as $spkData) {
                    // Cek apakah speaker dengan nama sama sudah ada di event ini
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

                    // Insert pivot session <-> speaker (ignore jika duplikat)
                    DB::table('event_session_speakers')->insertOrIgnore([
                        'session_id' => $sessionId,
                        'speaker_id' => $speakerId,
                    ]);
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

            $this->command->info("✅ Event seeded: {$meta['title']}");
        }

        $this->command->info('🎉 EventSeeder selesai! ' . count($eventsData) . ' event berhasil dibuat.');
    }
}
