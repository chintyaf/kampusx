<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PublishedEventSeeder extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────
        // Ambil referensi ID
        // ─────────────────────────────────────────
        $allOrganizers = DB::table('users')->where('role', 'organizer')->pluck('id')->toArray();
        $institutions  = DB::table('institutions')->pluck('id')->toArray();
        $categories    = DB::table('categories')->pluck('id', 'name');
        $eventTypes    = DB::table('event_types')->pluck('id', 'name');

        if (empty($allOrganizers) || empty($institutions) || $eventTypes->isEmpty()) {
            $this->command->warn('Jalankan UserSeeder, InstitutionSeeder, dan EventTypeSeeder terlebih dahulu!');
            return;
        }

        // ─────────────────────────────────────────
        // 15 Published Events — berbagai organizer, kategori, & tipe
        // ─────────────────────────────────────────
        $eventsData = [

            // 1
            [
                'organizer_idx' => 0,
                'meta' => [
                    'title'       => 'National Youth Leadership Summit 2025',
                    'description' => 'Summit kepemimpinan pemuda nasional yang mempertemukan 500 pemimpin muda dari 34 provinsi. Peserta akan mengikuti sesi plenary, workshop kepemimpinan, serta mentoring eksklusif bersama tokoh-tokoh nasional dari dunia politik, bisnis, dan sosial. Jadilah bagian dari generasi pemimpin Indonesia masa depan.',
                    'type_name'   => 'Conference',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(20),
                    'end_date'    => Carbon::now()->addDays(21),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Ilmu Sosial', 'Pendidikan'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Hotel Grand Hyatt Jakarta',
                    'location_detail' => 'Grand Ballroom Lantai 3',
                    'maps_url'      => 'https://maps.google.com/?q=Grand+Hyatt+Jakarta',
                    'latitude'      => -6.1944,
                    'longitude'     => 106.8230,
                    'country'       => 'Indonesia',
                    'province'      => 'DKI Jakarta',
                    'city'          => 'Jakarta Pusat',
                    'district'      => 'Menteng',
                    'address_detail' => 'Jl. MH. Thamrin No. 28-30',
                ],
                'sessions' => [
                    ['title' => 'Opening & Keynote', 'description' => 'Pembukaan resmi oleh Menteri Pemuda.', 'day_number' => 1, 'date' => Carbon::now()->addDays(20)->toDateString(), 'start_time' => '08:00:00', 'end_time' => '10:00:00', 'speakers' => [['name' => 'Dr. Ari Prasetyo', 'role' => 'Keynote Speaker', 'bio' => 'Pakar kepemimpinan.', 'expertise' => ['Leadership']]]],
                ],
                'tickets' => [
                    ['name' => 'Early Bird', 'type' => 'offline', 'price' => 250000, 'capacity' => 200, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(10)],
                    ['name' => 'Regular', 'type' => 'offline', 'price' => 350000, 'capacity' => 300, 'sale_start' => Carbon::now()->addDays(11), 'sale_end' => Carbon::now()->addDays(18)],
                ],
                'collaborators' => [['institution' => 0, 'role' => 'co_host']],
            ],

            // 2
            [
                'organizer_idx' => 1,
                'meta' => [
                    'title'       => 'Bootcamp Full-Stack Web Development (React + Laravel)',
                    'description' => 'Bootcamp intensif 4 minggu yang akan membawa Anda dari nol hingga mampu membangun aplikasi web full-stack secara profesional. Kurikulum mencakup HTML/CSS, JavaScript modern, React.js, Node.js, hingga Laravel sebagai back-end. Dilengkapi dengan proyek nyata, code review, dan sertifikat kelulusan yang diakui industri.',
                    'type_name'   => 'Bootcamp',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(35),
                    'end_date'    => Carbon::now()->addDays(63),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Teknik & Tech', 'Pendidikan'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Zoom + Discord',
                    'meeting_link'       => 'https://zoom.us/j/fullstack-bootcamp-2025',
                    'online_instruction' => 'Join Discord server untuk akses materi dan tugas harian.',
                ],
                'sessions' => [
                    ['title' => 'Week 1: HTML, CSS & JS Dasar', 'description' => 'Fondasi web development.', 'day_number' => 1, 'date' => Carbon::now()->addDays(35)->toDateString(), 'start_time' => '19:00:00', 'end_time' => '21:30:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Bootcamp', 'type' => 'online', 'price' => 1500000, 'capacity' => 60, 'sale_start' => Carbon::now()->subDays(5), 'sale_end' => Carbon::now()->addDays(30)],
                ],
                'collaborators' => [],
            ],

            // 3
            [
                'organizer_idx' => 2,
                'meta' => [
                    'title'       => 'Konser Amal: Musik untuk Negeri',
                    'description' => 'Konser musik amal dengan menampilkan 10 band indie terbaik Indonesia. Seluruh hasil penjualan tiket akan disumbangkan untuk beasiswa pendidikan anak-anak kurang mampu di pelosok negeri. Nikmati malam penuh harmoni sambil berkontribusi nyata untuk masa depan pendidikan Indonesia.',
                    'type_name'   => 'Networking Event',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(12),
                    'end_date'    => Carbon::now()->addDays(12),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 2,
                ],
                'categories' => ['Musik & Hiburan', 'Ilmu Sosial'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Lapangan Parkir Selatan GBK',
                    'location_detail' => 'Open Stage Area',
                    'maps_url'      => 'https://maps.google.com/?q=GBK+Senayan',
                    'latitude'      => -6.2183,
                    'longitude'     => 106.8025,
                    'country'       => 'Indonesia',
                    'province'      => 'DKI Jakarta',
                    'city'          => 'Jakarta Selatan',
                    'district'      => 'Senayan',
                    'address_detail' => 'Jl. Pintu Senayan I, Gelora',
                ],
                'sessions' => [
                    ['title' => 'Show Night', 'description' => 'Penampilan 10 band indie.', 'day_number' => 1, 'date' => Carbon::now()->addDays(12)->toDateString(), 'start_time' => '17:00:00', 'end_time' => '23:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Festival', 'type' => 'offline', 'price' => 100000, 'capacity' => 3000, 'sale_start' => Carbon::now()->subDays(7), 'sale_end' => Carbon::now()->addDays(11)],
                ],
                'collaborators' => [['institution' => 1, 'role' => 'sponsor']],
            ],

            // 4
            [
                'organizer_idx' => 3,
                'meta' => [
                    'title'       => 'Seminar Nasional Hukum Digital & Keamanan Siber',
                    'description' => 'Seminar yang membahas lanskap hukum di era digital, termasuk regulasi perlindungan data pribadi (UU PDP), kejahatan siber, hak kekayaan intelektual digital, serta kontrak elektronik. Pembicara dari Kementerian Komunikasi, Badan Siber Nasional (BSSN), dan pakar hukum TI terkemuka akan hadir untuk memberikan perspektif komprehensif.',
                    'type_name'   => 'Panel Discussion',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(25),
                    'end_date'    => Carbon::now()->addDays(25),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Ilmu Sosial', 'Teknik & Tech'],
                'location'   => [
                    'type'               => 'hybrid',
                    'platform'           => 'YouTube Live',
                    'meeting_link'       => 'https://youtube.com/live/hukum-digital-2025',
                    'location_name'      => 'Auditorium Fakultas Hukum UI',
                    'location_detail'    => 'Gedung D, Lantai 4',
                    'maps_url'           => 'https://maps.google.com/?q=Fakultas+Hukum+UI+Depok',
                    'latitude'           => -6.3625,
                    'longitude'          => 106.8275,
                    'country'            => 'Indonesia',
                    'province'           => 'Jawa Barat',
                    'city'               => 'Kota Depok',
                    'district'           => 'Beji',
                    'address_detail'     => 'Kampus UI, Depok',
                ],
                'sessions' => [
                    ['title' => 'Panel: UU PDP & Implikasinya', 'description' => 'Diskusi mendalam mengenai UU Perlindungan Data Pribadi.', 'day_number' => 1, 'date' => Carbon::now()->addDays(25)->toDateString(), 'start_time' => '09:00:00', 'end_time' => '13:00:00', 'speakers' => [['name' => 'Prof. Siti Rahayu', 'role' => 'Moderator', 'bio' => 'Guru besar hukum siber.', 'expertise' => ['Hukum Digital']]]],
                ],
                'tickets' => [
                    ['name' => 'Online (Gratis)', 'type' => 'online', 'price' => 0, 'capacity' => 5000, 'sale_start' => Carbon::now()->subDays(3), 'sale_end' => Carbon::now()->addDays(24)],
                    ['name' => 'Offline (Terbatas)', 'type' => 'offline', 'price' => 75000, 'capacity' => 150, 'sale_start' => Carbon::now()->subDays(3), 'sale_end' => Carbon::now()->addDays(22)],
                ],
                'collaborators' => [],
            ],

            // 5
            [
                'organizer_idx' => 4,
                'meta' => [
                    'title'       => 'Workshop Fotografi: Streetphotography & Lightroom',
                    'description' => 'Asah kemampuan fotografi jalanan Anda bersama fotografer profesional yang karyanya telah terpajang di galeri internasional. Anda akan belajar teknik komposisi, membaca cahaya alami, hingga alur kerja pasca-produksi menggunakan Lightroom untuk menghasilkan foto yang bercerita dan memukau.',
                    'type_name'   => 'Workshop',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(8),
                    'end_date'    => Carbon::now()->addDays(8),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 3,
                ],
                'categories' => ['Seni & Desain'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Kemang Art Space',
                    'location_detail' => 'Studio B',
                    'maps_url'      => 'https://maps.google.com/?q=Kemang+Jakarta+Selatan',
                    'latitude'      => -6.2607,
                    'longitude'     => 106.8135,
                    'country'       => 'Indonesia',
                    'province'      => 'DKI Jakarta',
                    'city'          => 'Jakarta Selatan',
                    'district'      => 'Kemang',
                    'address_detail' => 'Jl. Kemang Raya No. 5',
                ],
                'sessions' => [
                    ['title' => 'Hunting Foto & Editing', 'description' => 'Sesi langsung ke lapangan dilanjutkan editing.', 'day_number' => 1, 'date' => Carbon::now()->addDays(8)->toDateString(), 'start_time' => '07:00:00', 'end_time' => '17:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Workshop', 'type' => 'offline', 'price' => 450000, 'capacity' => 25, 'sale_start' => Carbon::now()->subDays(1), 'sale_end' => Carbon::now()->addDays(6)],
                ],
                'collaborators' => [],
            ],

            // 6
            [
                'organizer_idx' => 0,
                'meta' => [
                    'title'       => 'Talkshow: Mental Health di Era Gen Z',
                    'description' => 'Sesi bincang-bincang terbuka mengenai isu kesehatan mental yang kerap dihadapi generasi Z: kecemasan akademik, social media pressure, dan burnout. Hadirkan Psikolog klinis, konten kreator kesehatan mental, dan mahasiswa yang telah berhasil melewati masa krisis. Gratis dan terbuka untuk umum.',
                    'type_name'   => 'Talkshow',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(6),
                    'end_date'    => Carbon::now()->addDays(6),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 4,
                ],
                'categories' => ['Kesehatan', 'Pendidikan'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/mental-health-genz',
                    'online_instruction' => 'Peserta bebas mematikan kamera untuk menjaga privasi.',
                ],
                'sessions' => [
                    ['title' => 'Cerita & Solusi', 'description' => 'Bincang bersama narasumber.', 'day_number' => 1, 'date' => Carbon::now()->addDays(6)->toDateString(), 'start_time' => '19:00:00', 'end_time' => '21:00:00', 'speakers' => [['name' => 'Psikolog Dewi Lestari', 'role' => 'Narasumber', 'bio' => 'Psikolog klinis berpengalaman 10 tahun.', 'expertise' => ['Psikologi Klinis']]]],
                ],
                'tickets' => [
                    ['name' => 'Tiket Gratis', 'type' => 'online', 'price' => 0, 'capacity' => 1000, 'sale_start' => Carbon::now()->subDays(2), 'sale_end' => Carbon::now()->addDays(5)],
                ],
                'collaborators' => [],
            ],

            // 7
            [
                'organizer_idx' => 1,
                'meta' => [
                    'title'       => 'Lomba Karya Tulis Ilmiah Nasional 2025',
                    'description' => 'Ajang bergengsi bagi mahasiswa S1 & S2 dari seluruh Indonesia untuk menuangkan gagasan inovatif dalam bentuk karya tulis ilmiah. Tema tahun ini: "Inovasi Berkelanjutan untuk Indonesia Emas 2045." Total hadiah Rp 50 juta dan kesempatan mempresentasikan karya di seminar nasional.',
                    'type_name'   => 'Competition',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(50),
                    'end_date'    => Carbon::now()->addDays(52),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Pendidikan', 'Ilmu Sosial'],
                'location'   => [
                    'type'               => 'hybrid',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/lktin-2025',
                    'location_name'      => 'Gedung Rektorat UGM',
                    'location_detail'    => 'Ruang Sidang Utama',
                    'maps_url'           => 'https://maps.google.com/?q=UGM+Yogyakarta',
                    'latitude'           => -7.7714,
                    'longitude'          => 110.3772,
                    'country'            => 'Indonesia',
                    'province'           => 'DI Yogyakarta',
                    'city'               => 'Kota Yogyakarta',
                    'district'           => 'Caturtunggal',
                    'address_detail'     => 'Bulaksumur, Caturtunggal',
                ],
                'sessions' => [
                    ['title' => 'Presentasi Finalis', 'description' => 'Presentasi 10 karya tulis terbaik.', 'day_number' => 1, 'date' => Carbon::now()->addDays(50)->toDateString(), 'start_time' => '08:00:00', 'end_time' => '16:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Pendaftaran Tim', 'type' => 'offline', 'price' => 100000, 'capacity' => 200, 'sale_start' => Carbon::now()->subDays(15), 'sale_end' => Carbon::now()->addDays(40)],
                ],
                'collaborators' => [['institution' => 2, 'role' => 'co_host']],
            ],

            // 8
            [
                'organizer_idx' => 2,
                'meta' => [
                    'title'       => 'Webinar: Cara Dapat Beasiswa S2 Luar Negeri',
                    'description' => 'Pelajari strategi dan rahasia sukses mendapatkan beasiswa penuh untuk studi S2 di luar negeri dari para awardee Chevening, DAAD, Fulbright, dan LPDP. Mereka akan berbagi pengalaman nyata mulai dari persiapan berkas, tips wawancara, hingga kehidupan sebagai penerima beasiswa di negeri orang.',
                    'type_name'   => 'Webinar',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(3),
                    'end_date'    => Carbon::now()->addDays(3),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Pendidikan'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Google Meet',
                    'meeting_link'       => 'https://meet.google.com/beasiswa-luar-negeri',
                    'online_instruction' => 'Link aktif 15 menit sebelum acara. Siapkan pertanyaan Anda!',
                ],
                'sessions' => [
                    ['title' => 'Sharing Session', 'description' => 'Berbagi pengalaman dari para penerima beasiswa.', 'day_number' => 1, 'date' => Carbon::now()->addDays(3)->toDateString(), 'start_time' => '15:00:00', 'end_time' => '17:30:00', 'speakers' => [['name' => 'Alya Ramadhani', 'role' => 'Awardee Chevening', 'bio' => 'Mahasiswa S2 di University of Edinburgh.', 'expertise' => ['Beasiswa']]]],
                ],
                'tickets' => [
                    ['name' => 'Tiket Gratis', 'type' => 'online', 'price' => 0, 'capacity' => 2000, 'sale_start' => Carbon::now()->subDays(4), 'sale_end' => Carbon::now()->addDays(2)],
                ],
                'collaborators' => [],
            ],

            // 9
            [
                'organizer_idx' => 3,
                'meta' => [
                    'title'       => 'Pelatihan Public Speaking & Presentasi Profesional',
                    'description' => 'Kuasai seni berbicara di depan umum dan presentasi yang meyakinkan dalam pelatihan intensif dua hari ini. Melalui latihan praktik yang intensif dengan umpan balik langsung dari pelatih bersertifikat, Anda akan belajar mengontrol rasa gugup, membangun koneksi dengan audiens, serta merancang struktur presentasi yang memukau.',
                    'type_name'   => 'Training',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(17),
                    'end_date'    => Carbon::now()->addDays(18),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 2,
                ],
                'categories' => ['Pendidikan', 'Bisnis & Ekonomi'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Surabaya Business Center',
                    'location_detail' => 'Ruang Pelatihan A',
                    'maps_url'      => 'https://maps.google.com/?q=Surabaya+Business+Center',
                    'latitude'      => -7.2571,
                    'longitude'     => 112.7510,
                    'country'       => 'Indonesia',
                    'province'      => 'Jawa Timur',
                    'city'          => 'Kota Surabaya',
                    'district'      => 'Tegalsari',
                    'address_detail' => 'Jl. Pemuda No. 17, Embong Kaliasin',
                ],
                'sessions' => [
                    ['title' => 'Fondasi Public Speaking', 'description' => 'Teori dan praktik dasar.', 'day_number' => 1, 'date' => Carbon::now()->addDays(17)->toDateString(), 'start_time' => '08:30:00', 'end_time' => '17:00:00', 'speakers' => [['name' => 'Reza Wirawan', 'role' => 'Trainer', 'bio' => 'Trainer komunikasi berpengalaman.', 'expertise' => ['Public Speaking', 'Communication']]]],
                    ['title' => 'Simulasi & Feedback', 'description' => 'Praktik dan review intensif.', 'day_number' => 2, 'date' => Carbon::now()->addDays(18)->toDateString(), 'start_time' => '08:30:00', 'end_time' => '16:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Pelatihan', 'type' => 'offline', 'price' => 750000, 'capacity' => 30, 'sale_start' => Carbon::now()->subDays(8), 'sale_end' => Carbon::now()->addDays(15)],
                ],
                'collaborators' => [],
            ],

            // 10
            [
                'organizer_idx' => 4,
                'meta' => [
                    'title'       => 'Expo Startup & Pameran Produk Digital 2025',
                    'description' => 'Pameran terbesar untuk startup Indonesia yang menghadirkan lebih dari 80 booth pameran dari berbagai tahapan bisnis. Temukan produk-produk digital inovatif, jalin kolaborasi dengan founder lain, serta bertemu langsung dengan 20+ investor aktif yang siap mendanai ide terbaik Anda.',
                    'type_name'   => 'Networking Event',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(40),
                    'end_date'    => Carbon::now()->addDays(41),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 1,
                ],
                'categories' => ['Bisnis & Ekonomi', 'Teknik & Tech'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Jakarta International Expo (JIExpo)',
                    'location_detail' => 'Hall B2 & B3',
                    'maps_url'      => 'https://maps.google.com/?q=JIExpo+Kemayoran',
                    'latitude'      => -6.1564,
                    'longitude'     => 106.8451,
                    'country'       => 'Indonesia',
                    'province'      => 'DKI Jakarta',
                    'city'          => 'Jakarta Pusat',
                    'district'      => 'Kemayoran',
                    'address_detail' => 'Jl. Benyamin Sueb, Kemayoran',
                ],
                'sessions' => [
                    ['title' => 'Opening Day 1', 'description' => 'Pembukaan dan tour pameran.', 'day_number' => 1, 'date' => Carbon::now()->addDays(40)->toDateString(), 'start_time' => '10:00:00', 'end_time' => '20:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Pengunjung', 'type' => 'offline', 'price' => 50000, 'capacity' => 10000, 'sale_start' => Carbon::now()->subDays(20), 'sale_end' => Carbon::now()->addDays(38)],
                    ['name' => 'Tiket VIP (Investor Lounge)', 'type' => 'offline', 'price' => 500000, 'capacity' => 100, 'sale_start' => Carbon::now()->subDays(20), 'sale_end' => Carbon::now()->addDays(35)],
                ],
                'collaborators' => [['institution' => 3, 'role' => 'sponsor']],
            ],

            // 11
            [
                'organizer_idx' => 0,
                'meta' => [
                    'title'       => 'Kelas Online: Menulis Konten & Copywriting',
                    'description' => 'Pelajari seni menulis konten yang menarik, persuasif, dan mampu menggerakkan pembaca untuk mengambil tindakan. Dari penulisan caption media sosial, artikel blog SEO, hingga email marketing yang efektif, semua akan dibahas tuntas dengan contoh kasus nyata dari brand-brand besar Indonesia.',
                    'type_name'   => 'Course',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(15),
                    'end_date'    => Carbon::now()->addDays(22),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Seni & Desain', 'Bisnis & Ekonomi'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/copywriting-course-2025',
                    'online_instruction' => 'Rekaman sesi tersedia di Google Drive untuk peserta yang tidak bisa hadir langsung.',
                ],
                'sessions' => [
                    ['title' => 'Sesi 1: Dasar Copywriting', 'description' => 'Framework AIDA dan penerapannya.', 'day_number' => 1, 'date' => Carbon::now()->addDays(15)->toDateString(), 'start_time' => '19:00:00', 'end_time' => '21:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Kelas', 'type' => 'online', 'price' => 175000, 'capacity' => 200, 'sale_start' => Carbon::now()->subDays(6), 'sale_end' => Carbon::now()->addDays(13)],
                ],
                'collaborators' => [],
            ],

            // 12
            [
                'organizer_idx' => 1,
                'meta' => [
                    'title'       => 'Summit Kesehatan & Wellness Indonesia 2025',
                    'description' => 'Konferensi kesehatan tahunan yang membahas tren terkini di bidang preventif health, nutrisi berbasis riset, teknologi kesehatan (healthtech), serta gaya hidup aktif. Lebih dari 30 dokter spesialis, ahli gizi, dan inovator healthtech hadir untuk berbagi wawasan terdepan bagi masyarakat Indonesia.',
                    'type_name'   => 'Conference',
                    'status'      => 'published',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->addDays(55),
                    'end_date'    => Carbon::now()->addDays(56),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 4,
                ],
                'categories' => ['Kesehatan', 'Teknik & Tech'],
                'location'   => [
                    'type'          => 'hybrid',
                    'platform'      => 'YouTube Live',
                    'meeting_link'  => 'https://youtube.com/live/health-summit-2025',
                    'location_name' => 'Bali International Convention Centre (BICC)',
                    'location_detail' => 'Plenary Hall',
                    'maps_url'      => 'https://maps.google.com/?q=BICC+Bali',
                    'latitude'      => -8.7268,
                    'longitude'     => 115.1700,
                    'country'       => 'Indonesia',
                    'province'      => 'Bali',
                    'city'          => 'Badung',
                    'district'      => 'Kuta',
                    'address_detail' => 'Kawasan ITDC, Nusa Dua',
                ],
                'sessions' => [
                    ['title' => 'Opening & Plenary', 'description' => 'Sambutan dan sesi plenary.', 'day_number' => 1, 'date' => Carbon::now()->addDays(55)->toDateString(), 'start_time' => '08:00:00', 'end_time' => '10:30:00', 'speakers' => [['name' => 'Dr. Budi Gunawan', 'role' => 'Keynote', 'bio' => 'Dokter spesialis penyakit dalam.', 'expertise' => ['Kesehatan Preventif']]]],
                ],
                'tickets' => [
                    ['name' => 'Online', 'type' => 'online', 'price' => 0, 'capacity' => 10000, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(54)],
                    ['name' => 'Offline Regular', 'type' => 'offline', 'price' => 500000, 'capacity' => 500, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(50)],
                    ['name' => 'Offline VIP', 'type' => 'offline', 'price' => 1500000, 'capacity' => 50, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(45)],
                ],
                'collaborators' => [['institution' => 0, 'role' => 'co_host']],
            ],

            // 13
            [
                'organizer_idx' => 2,
                'meta' => [
                    'title'       => 'Workshop Animasi 2D: Dari Sketch ke Animasi Digital',
                    'description' => 'Wujudkan karakter animasi impian Anda dalam workshop intensif sehari ini! Dipandu oleh animator profesional yang telah berkontribusi pada produksi animasi internasional, Anda akan berlatih teknik sketsa karakter, prinsip animasi 12 dasar, hingga menganimasikan karakter menggunakan software Procreate dan Animate CC.',
                    'type_name'   => 'Workshop',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(28),
                    'end_date'    => Carbon::now()->addDays(28),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 3,
                ],
                'categories' => ['Seni & Desain', 'Teknik & Tech'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Gedung Kreatif Bandung',
                    'location_detail' => 'Studio Animasi Lt. 2',
                    'maps_url'      => 'https://maps.google.com/?q=Braga+Bandung',
                    'latitude'      => -6.9175,
                    'longitude'     => 107.6098,
                    'country'       => 'Indonesia',
                    'province'      => 'Jawa Barat',
                    'city'          => 'Kota Bandung',
                    'district'      => 'Sumur Bandung',
                    'address_detail' => 'Jl. Braga No. 55, Bandung',
                ],
                'sessions' => [
                    ['title' => 'Sketch & Animate', 'description' => 'Dari kertas ke layar digital.', 'day_number' => 1, 'date' => Carbon::now()->addDays(28)->toDateString(), 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Workshop', 'type' => 'offline', 'price' => 550000, 'capacity' => 20, 'sale_start' => Carbon::now()->subDays(2), 'sale_end' => Carbon::now()->addDays(26)],
                ],
                'collaborators' => [],
            ],

            // 14
            [
                'organizer_idx' => 3,
                'meta' => [
                    'title'       => 'Webinar Karir: Tips Lolos Seleksi BUMN & CPNS 2025',
                    'description' => 'Pelajari strategi jitu untuk lolos seleksi masuk BUMN bergengsi dan ujian CPNS dari para alumni yang telah berhasil. Materi mencakup persiapan psikotes, TKD, wawancara HRD, hingga assessment center. Bonus: simulasi soal TKD eksklusif dan sesi tanya jawab langsung dengan narasumber.',
                    'type_name'   => 'Webinar',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(9),
                    'end_date'    => Carbon::now()->addDays(9),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 0,
                ],
                'categories' => ['Pendidikan', 'Bisnis & Ekonomi'],
                'location'   => [
                    'type'               => 'online',
                    'platform'           => 'Zoom',
                    'meeting_link'       => 'https://zoom.us/j/karir-bumn-cpns-2025',
                    'online_instruction' => 'Peserta mendapatkan modul PDF setelah mendaftar.',
                ],
                'sessions' => [
                    ['title' => 'Tips & Trik BUMN/CPNS', 'description' => 'Sharing dari alumni sukses.', 'day_number' => 1, 'date' => Carbon::now()->addDays(9)->toDateString(), 'start_time' => '13:00:00', 'end_time' => '16:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Webinar', 'type' => 'online', 'price' => 30000, 'capacity' => 3000, 'sale_start' => Carbon::now()->subDays(5), 'sale_end' => Carbon::now()->addDays(8)],
                ],
                'collaborators' => [],
            ],

            // 15
            [
                'organizer_idx' => 4,
                'meta' => [
                    'title'       => 'Workshop Memasak: Authentic Italian Cuisine',
                    'description' => 'Ikuti perjalanan kuliner ke Italia tanpa harus keluar negeri! Chef berpengalaman yang pernah magang di restoran Michelin Star Italia akan mengajarkan resep dan teknik autentik membuat pasta dari nol, saus ragù bolognese, risotto, dan tiramisu klasik. Semua bahan telah disediakan, dan Anda pulang dengan membawa makanan hasil kreasi sendiri.',
                    'type_name'   => 'Workshop',
                    'status'      => 'published',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->addDays(16),
                    'end_date'    => Carbon::now()->addDays(16),
                    'timezone'    => 'Asia/Jakarta',
                    'institution' => 2,
                ],
                'categories' => ['Bisnis & Ekonomi'],
                'location'   => [
                    'type'          => 'offline',
                    'location_name' => 'Studio Dapur Kulinara',
                    'location_detail' => 'Area Cooking Class',
                    'maps_url'      => 'https://maps.google.com/?q=Pondok+Indah+Jakarta',
                    'latitude'      => -6.2755,
                    'longitude'     => 106.7880,
                    'country'       => 'Indonesia',
                    'province'      => 'DKI Jakarta',
                    'city'          => 'Jakarta Selatan',
                    'district'      => 'Pondok Indah',
                    'address_detail' => 'Jl. Metro Pondok Indah No. 10',
                ],
                'sessions' => [
                    ['title' => 'Italian Cooking Class', 'description' => 'Memasak pasta, risotto, dan tiramisu.', 'day_number' => 1, 'date' => Carbon::now()->addDays(16)->toDateString(), 'start_time' => '10:00:00', 'end_time' => '14:00:00', 'speakers' => []],
                ],
                'tickets' => [
                    ['name' => 'Tiket Cooking Class', 'type' => 'offline', 'price' => 650000, 'capacity' => 16, 'sale_start' => Carbon::now()->subDays(3), 'sale_end' => Carbon::now()->addDays(14)],
                ],
                'collaborators' => [],
            ],
        ];

        // ─────────────────────────────────────────
        // Loop & Insert
        // ─────────────────────────────────────────
        $imageCounter = 11; // Lanjutkan dari event-banners/11.jpg
        foreach ($eventsData as $idx => $eventData) {
            $meta = $eventData['meta'];

            // Pilih organizer bergiliran berdasarkan organizer_idx
            $organizerId = $allOrganizers[$eventData['organizer_idx'] % count($allOrganizers)];

            $eventId = DB::table('events')->insertGetId([
                'organizer_id'   => $organizerId,
                'institution_id' => $institutions[$meta['institution']] ?? $institutions[0],
                'title'          => $meta['title'],
                'slug'           => Str::slug($meta['title']),
                'description'    => $meta['description'],
                'image_path'     => "event-banners/{$imageCounter}.jpg",
                'start_date'     => $meta['start_date'],
                'end_date'       => $meta['end_date'],
                'timezone'       => $meta['timezone'],
                'status'         => $meta['status'],
                'is_featured'    => $meta['is_featured'],
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // Event type pivot
            $eventTypeId = $eventTypes[$meta['type_name']] ?? null;
            if ($eventTypeId) {
                DB::table('event_types_event')->insertOrIgnore([
                    'event_id'       => $eventId,
                    'event_types_id' => $eventTypeId,
                ]);
            }

            // Categories
            foreach ($eventData['categories'] as $catName) {
                $catId = $categories[$catName] ?? null;
                if ($catId) {
                    DB::table('event_categories')->insertOrIgnore([
                        'event_id'    => $eventId,
                        'category_id' => $catId,
                    ]);
                }
            }

            // Location
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

            // Sessions & Speakers
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
                    $speakerId = DB::table('speakers')
                        ->where('event_id', $eventId)
                        ->where('name', $spkData['name'])
                        ->value('id');

                    if (!$speakerId) {
                        $speakerId = DB::table('speakers')->insertGetId([
                            'event_id'  => $eventId,
                            'name'      => $spkData['name'],
                            'role'      => $spkData['role'],
                            'bio'       => $spkData['bio'],
                            'expertise' => json_encode($spkData['expertise']),
                        ]);
                    }

                    DB::table('event_session_speakers')->insertOrIgnore([
                        'session_id' => $sessionId,
                        'speaker_id' => $speakerId,
                    ]);
                }
            }

            // Tickets
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

            // Collaborators
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

            $imageCounter++;
            $this->command->info("✅ Published event seeded: {$meta['title']}");
        }

        $this->command->info('🎉 PublishedEventSeeder selesai! 15 event published berhasil dibuat.');
    }
}
