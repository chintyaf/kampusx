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
                    'description' => 'Konferensi kecerdasan buatan terbesar di Indonesia yang menghadirkan para ahli dan praktisi AI dari berbagai sektor. Dalam acara ini, kita akan membahas perkembangan terbaru dalam machine learning, NLP, dan implementasi AI dalam industri kreatif, kesehatan, serta manufaktur. Jangan lewatkan kesempatan untuk berjejaring dengan ribuan profesional teknologi, mendengarkan studi kasus nyata dari perusahaan terkemuka, dan melihat demo produk AI inovatif yang dapat mengubah cara kita bekerja di masa depan.',
                    'type_name'   => 'Conference',
                    'status'      => 'ongoing',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->subDays(1),
                    'end_date'    => Carbon::now()->addDays(2),
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
                    ['name' => 'Tiket Event (Online)', 'type' => 'online',  'price' => 150000,  'capacity' => 1000, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(28)],
                    ['name' => 'Tiket Event (Offline)', 'type' => 'offline', 'price' => 750000,  'capacity' => 300, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(25)],
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
                    'description' => 'Webinar intensif sehari penuh yang dirancang khusus untuk para founder startup tahap awal yang ingin memahami seluk-beluk ekosistem pendanaan. Anda akan mempelajari langkah demi langkah cara mempersiapkan pitch deck yang menarik, memahami valuasi startup, serta strategi negosiasi dengan angel investor maupun venture capital. Sesi ini juga akan menghadirkan investor berpengalaman yang akan membedah contoh-contoh pitching yang berhasil maupun yang gagal.',
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
                'sessions'   => [
                    [
                        'title'       => 'Sesi Utama',
                        'description' => 'Sesi pemaparan materi dan tanya jawab.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(14)->toDateString(),
                        'start_time'  => '09:00:00',
                        'end_time'    => '12:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'online', 'price' => 50000, 'capacity' => 1000, 'sale_start' => Carbon::now()->subDays(5), 'sale_end' => Carbon::now()->addDays(13)],
                ],
                'collaborators' => [
                    ['institution' => 3, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 3: Kompetisi / Hackathon Offline (OFFLINE) ─────────────────────────
            [
                'meta' => [
                    'title'       => 'HackBandung 2025 — 36 Hours of Innovation',
                    'description' => 'HackBandung 2025 adalah hackathon 36 jam non-stop di mana inovasi bertemu dengan eksekusi nyata! Tim mahasiswa dan profesional muda dari seluruh Indonesia akan bersaing memecahkan tantangan di bidang smart city, green tech, dan inklusi finansial. Dapatkan bimbingan langsung dari mentor industri, nikmati makanan dan minuman gratis selama acara, serta menangkan total hadiah puluhan juta rupiah beserta kesempatan inkubasi ide bisnis Anda.',
                    'type_name'   => 'Competition',
                    'status'      => 'draft',
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
                'sessions'   => [
                    [
                        'title'       => 'Pelaksanaan Lomba Hari 1',
                        'description' => 'Sesi pertama perlombaan.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(45)->toDateString(),
                        'start_time'  => '08:00:00',
                        'end_time'    => '17:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'offline', 'price' => 200000, 'capacity' => 150, 'sale_start' => Carbon::now()->subDays(20), 'sale_end' => Carbon::now()->addDays(40)],
                ],
                'collaborators' => [
                    ['institution' => 1, 'role' => 'co_host'],
                ],
            ],

            // ── Event 4: Workshop Seni & Desain (ONLINE) ────────────────────────────────
            [
                'meta' => [
                    'title'       => 'UI/UX Bootcamp: Dari Wireframe ke Prototype',
                    'description' => 'Bootcamp intensif selama 3 sesi yang akan memandu Anda memahami keseluruhan proses desain produk digital, mulai dari riset pengguna, pembuatan wireframe, hingga desain high-fidelity dan prototype interaktif menggunakan Figma. Pelatihan ini sangat cocok bagi pemula yang ingin beralih karir menjadi UI/UX Designer maupun developer yang ingin meningkatkan kepekaan visual mereka. Anda juga akan mendapatkan review portofolio di akhir sesi.',
                    'type_name'   => 'Bootcamp',
                    'status'      => 'completed',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->subDays(10),
                    'end_date'    => Carbon::now()->subDays(9),
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
                'sessions'   => [
                    [
                        'title'       => 'Materi Pengenalan UI/UX',
                        'description' => 'Sesi pembuka bootcamp.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(7)->toDateString(),
                        'start_time'  => '10:00:00',
                        'end_time'    => '15:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'online', 'price' => 195000, 'capacity' => 100, 'sale_start' => Carbon::now()->subDays(3), 'sale_end' => Carbon::now()->addDays(6)],
                ],
                'collaborators' => [
                    ['institution' => 4, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 5: Event Kesehatan & Musik (OFFLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'FestiFit 2025: Gerak Sehat, Jiwa Sehat',
                    'description' => 'FestiFit 2025 adalah festival kesehatan holistik yang mengajak masyarakat untuk bergerak dan menjaga keseimbangan pikiran. Acara ini akan diisi dengan sesi zumba massal, yoga di ruang terbuka, serta berbagai talkshow inspiratif mengenai pentingnya kesehatan mental di tengah hiruk pikuk kehidupan modern. Terdapat juga bazaar makanan sehat, cek kesehatan gratis, dan area bermain anak yang membuat acara ini cocok dikunjungi bersama keluarga.',
                    'type_name'   => 'Networking Event',
                    'status'      => 'post_event',
                    'is_featured' => false,
                    'start_date'  => Carbon::now()->subDays(5),
                    'end_date'    => Carbon::now()->subDays(4),
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
                'sessions'   => [
                    [
                        'title'       => 'Senam Pagi & Talkshow',
                        'description' => 'Sesi senam pagi dilanjutkan dengan bincang santai kesehatan.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(21)->toDateString(),
                        'start_time'  => '06:00:00',
                        'end_time'    => '11:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event (Gratis)', 'type' => 'offline', 'price' => 0, 'capacity' => 5000, 'sale_start' => Carbon::now()->subDays(7), 'sale_end' => Carbon::now()->addDays(20)],
                ],
                'collaborators' => [
                    ['institution' => 5, 'role' => 'co_host'],
                ],
            ],

            // ── Event 6: Workshop Kuliner/Kopi (OFFLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Masterclass: Seni Roasting Kopi Nusantara',
                    'description' => 'Pelajari teknik rahasia di balik secangkir kopi yang sempurna melalui masterclass seni roasting kopi nusantara. Dipandu oleh master roaster bersertifikat internasional, Anda akan diajak mengenal berbagai profil biji kopi dari Sumatera hingga Papua, cara mengoperasikan mesin roasting, hingga memahami kurva pemanggangan. Acara ini akan ditutup dengan sesi cupping eksklusif untuk melatih kepekaan indra perasa Anda terhadap aneka notes kopi.',
                    'type_name'   => 'Workshop',
                    'status'      => 'ongoing',
                    'is_featured' => true,
                    'start_date'  => Carbon::now()->subDays(2),
                    'end_date'    => Carbon::now()->addDays(2),
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
                'sessions'   => [
                    [
                        'title'       => 'Praktek Roasting Kopi',
                        'description' => 'Peserta akan langsung mempraktekkan teknik roasting.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(10)->toDateString(),
                        'start_time'  => '13:00:00',
                        'end_time'    => '16:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'offline', 'price' => 350000, 'capacity' => 20, 'sale_start' => Carbon::now()->subDays(2), 'sale_end' => Carbon::now()->addDays(8)],
                ],
                'collaborators' => [],
            ],

            // ── Event 7: Kursus Bahasa & IT (ONLINE) ────────────────────────────────
            [
                'meta' => [
                    'title'       => 'Intensive Course: English for Software Engineers',
                    'description' => 'Tingkatkan kemampuan komunikasi bahasa Inggris Anda secara spesifik untuk lingkungan kerja bidang teknologi dan rekayasa perangkat lunak. Melalui kursus intensif ini, Anda akan berlatih melakukan presentasi teknis, memimpin sesi daily stand-up, menulis dokumentasi kode yang profesional, serta berargumen secara efektif saat code review. Penguasaan bahasa Inggris ini akan sangat membantu Anda untuk bekerja secara remote di perusahaan internasional.',
                    'type_name'   => 'Course',
                    'status'      => 'cancelled',
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
                'sessions'   => [
                    [
                        'title'       => 'Basic Tech English',
                        'description' => 'Materi dasar bahasa Inggris untuk kebutuhan teknis.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(5)->toDateString(),
                        'start_time'  => '19:00:00',
                        'end_time'    => '21:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'online', 'price' => 450000, 'capacity' => 50, 'sale_start' => Carbon::now()->subDays(10), 'sale_end' => Carbon::now()->addDays(4)],
                ],
                'collaborators' => [],
            ],

            // ── Event 8: Panel Diskusi Lingkungan (HYBRID) ─────────────────────────
            [
                'meta' => [
                    'title'       => 'Panel Diskusi: Transisi Energi Hijau di Indonesia',
                    'description' => 'Mari bahas secara komprehensif mengenai peluang dan tantangan nyata yang dihadapi Indonesia dalam mewujudkan target net-zero emissions. Diskusi panel ini akan menghadirkan para pembuat kebijakan, inovator teknologi hijau, serta pemimpin industri energi yang akan berdebat secara konstruktif tentang transisi dari energi fosil ke energi terbarukan. Sesi ini juga akan membahas aspek pembiayaan hijau (green financing) dan dampaknya terhadap perekonomian lokal.',
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
                'sessions'   => [
                    [
                        'title'       => 'Panel Utama: Transisi Energi',
                        'description' => 'Diskusi panel utama dengan para ahli.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(60)->toDateString(),
                        'start_time'  => '09:00:00',
                        'end_time'    => '12:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event (Online)', 'type' => 'online', 'price' => 0, 'capacity' => 2000, 'sale_start' => Carbon::now()->addDays(10), 'sale_end' => Carbon::now()->addDays(59)],
                    ['name' => 'Tiket Event (Offline)', 'type' => 'offline', 'price' => 150000, 'capacity' => 200, 'sale_start' => Carbon::now()->addDays(10), 'sale_end' => Carbon::now()->addDays(50)],
                ],
                'collaborators' => [
                    ['institution' => 2, 'role' => 'sponsor'],
                ],
            ],

            // ── Event 9: Pelatihan Keselamatan (OFFLINE) ──────────────────────────────
            [
                'meta' => [
                    'title'       => 'Pelatihan Basic Life Support & First Aid',
                    'description' => 'Kecelakaan bisa terjadi kapan saja dan di mana saja. Bekali diri Anda dengan pengetahuan krusial melalui pelatihan Basic Life Support (BLS) dan First Aid ini. Program bersertifikat ini dirancang untuk masyarakat umum maupun pekerja kantoran yang ingin belajar cara melakukan Resusitasi Jantung Paru (RJP/CPR), menangani luka pendarahan, tersedak, serta patah tulang sebelum bantuan medis profesional tiba. Keselamatan dimulai dari kesiapsiagaan Anda.',
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
                'sessions'   => [
                    [
                        'title'       => 'Teori & Praktek P3K Dasar',
                        'description' => 'Sesi teori dan praktek langsung.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(18)->toDateString(),
                        'start_time'  => '08:00:00',
                        'end_time'    => '16:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'offline', 'price' => 250000, 'capacity' => 40, 'sale_start' => Carbon::now()->subDays(5), 'sale_end' => Carbon::now()->addDays(15)],
                ],
                'collaborators' => [],
            ],

            // ── Event 10: Talkshow Keuangan (ONLINE) ──────────────────────────────────
            [
                'meta' => [
                    'title'       => 'Talkshow Santai: Cerdas Investasi Saham untuk Pemula',
                    'description' => 'Bingung mulai investasi dari mana dan takut terjebak investasi bodong? Yuk ngobrol santai bareng para perencana keuangan bersertifikat yang akan mengupas tuntas cara membaca laporan keuangan dasar, memahami profil risiko, serta merancang money management yang sehat untuk anak muda. Talkshow interaktif ini menggunakan bahasa yang mudah dipahami oleh pemula, tanpa istilah finansial yang rumit, sehingga Anda bisa langsung mempraktekkannya.',
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
                'sessions'   => [
                    [
                        'title'       => 'Materi Investasi Saham',
                        'description' => 'Pemaparan materi investasi untuk pemula.',
                        'day_number'  => 1,
                        'date'        => Carbon::now()->addDays(2)->toDateString(),
                        'start_time'  => '19:00:00',
                        'end_time'    => '21:00:00',
                        'speakers'    => [],
                    ],
                ],
                'tickets'        => [
                    ['name' => 'Tiket Event', 'type' => 'online', 'price' => 25000, 'capacity' => 500, 'sale_start' => Carbon::now()->subDays(15), 'sale_end' => Carbon::now()->addDays(1)],
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
