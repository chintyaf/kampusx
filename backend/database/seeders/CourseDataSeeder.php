<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CourseDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat User / Organizer Default (jika belum ada)
        $userId = DB::table('users')->insertGetId([
            'name' => 'Dosen Pengampu',
            'email' => 'dosen@maranatha.edu',
            'password' => bcrypt('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Buat Learning Path
        $pathId = DB::table('learning_paths')->insertGetId([
            'created_by' => $userId,
            'title' => 'Dasar Pemrograman dengan Python',
            'description' => 'Kursus komprehensif dasar pemrograman mengacu pada kurikulum Teknik Informatika Universitas Kristen Maranatha, meliputi tipe data, kontrol alur, fungsi, struktur data array/matriks, hingga algoritma pencarian dan pengurutan.',
            'category' => 'Computer Science',
            'thumbnail' => 'thumbnails/dasar-pemrograman.png',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Buat Master Skills
        $skillsData = [
            ['name' => 'Data Types & Variables', 'category' => 'Basic Programming', 'description' => 'Pemahaman jenis data dasar (Integer, Float, Boolean, String) dan variabel.'],
            ['name' => 'Input & Output Formatting', 'category' => 'Basic Programming', 'description' => 'Pengolahan instruksi input dan kustomisasi tampilan cetak data.'],
            ['name' => 'Control Flow & Looping', 'category' => 'Algorithms', 'description' => 'Struktur perulangan While, For, serta perulangan bersarang (nested loops).'],
            ['name' => 'Modular Programming & Functions', 'category' => 'Software Engineering', 'description' => 'Penerapan fungsi, parameter, return value, dan prinsip top-down design.'],
            ['name' => 'Array & List Data Structure', 'category' => 'Data Structures', 'description' => 'Manipulasi elemen list/array 1-dimensi dan traversal data.'],
            ['name' => 'Matrix & Multi-Dimensional Array', 'category' => 'Data Structures', 'description' => 'Pengolahan struktur data matriks 2-dimensi per baris dan kolom.'],
            ['name' => 'Searching Algorithms', 'category' => 'Algorithms', 'description' => 'Algoritma pencarian Sequential Search, Sentinel Search, dan Binary Search.'],
            ['name' => 'Sorting Algorithms', 'category' => 'Algorithms', 'description' => 'Algoritma pengurutan Bubble Sort, Selection/Maximum Sort, dan Insertion Sort.'],
        ];

        $skillIds = [];
        foreach ($skillsData as $skill) {
            $skillIds[$skill['name']] = DB::table('skills')->insertGetId([
                'name' => $skill['name'],
                'description' => $skill['description'],
                'category' => $skill['category'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Struktur Modul & Lesson Berdasarkan PPT
        $modules = [
            [
                'title' => 'Modul 1: Tipe Data Dasar',
                'description' => 'Mempelajari konsep data, representasi memori, serta tipe data dasar (Boolean, Integer, Float, Karakter/String).',
                'difficulty_level' => 'beginner',
                'order_index' => 1,
                'lessons' => [
                    [
                        'title' => 'Konsep Data & Stored Program Computer',
                        'content' => file_get_contents(database_path('seeders/contents/daspro/lesson_01.html')),
                        'summary' => 'Pengenalan pola representasi data dan alur data-proses-informasi.',
                        'duration_minutes' => 15,
                        'skills' => [
                            'Data Types & Variables' => 1.00,
                        ]
                    ],
                    [
                        'title' => 'Bilangan Logika, Bulat, Real, dan String',
                        'content' => file_get_contents(database_path('seeders/contents/daspro/lesson_02.html')),
                        'summary' => 'Domain harga dan operator pada tiap tipe data dasar.',
                        'duration_minutes' => 25,
                        'skills' => [
                            'Data Types & Variables' => 1.00,
                        ]
                    ],
                ]
            ],

            [
                'title' => 'Modul 2: Program Sederhana & Aksi Sekuensial',
                'description' => 'Memahami variabel, instruksi pengisian nilai (assignment), I/O formatting, dan struktur sekuensial.',
                'difficulty_level' => 'beginner',
                'order_index' => 2,
                'lessons' => [
                    [
                        'title' => 'Variabel, Assignment, dan Input/Output',
                        'content' => 'Aturan penulisan nama variabel, pengisian nilai melalui instruksi assignment (`=`) dan pembacaan masukan `input()`.',
                        'summary' => 'Dasar pembuatan instruksi program sekuensial sederhana.',
                        'duration_minutes' => 20,
                        'skills' => [
                            'Data Types & Variables' => 0.60,
                            'Input & Output Formatting' => 0.40,
                        ]
                    ],
                    [
                        'title' => 'Formatting Output & Studi Kasus Sekuensial',
                        'content' => 'Penggunaan parameter `end`, `sep`, serta format numerik `{0:4.2f}`. Implementasi studi kasus penukaran isi variabel dan konversi waktu.',
                        'summary' => 'Teknik merapikan tampilan keluaran dan menyelesaikan aksi sekuensial.',
                        'duration_minutes' => 30,
                        'skills' => [
                            'Input & Output Formatting' => 0.80,
                            'Data Types & Variables' => 0.20,
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Modul 3: Pengulangan (Looping)',
                'description' => 'Mempelajari mekanisme kontrol perulangan menggunakan struktur While, For, dan Nested Loop.',
                'difficulty_level' => 'intermediate',
                'order_index' => 3,
                'lessons' => [
                    [
                        'title' => 'Instruksi While & Perulangan Dummy',
                        'content' => 'Sintaks `while`, pencacah (counter), serta penanganan perulangan dengan data sembarang berbasis nilai penanda (sentinel/dummy value seperti 9999).',
                        'summary' => 'Mekanisme kontrol perulangan berdasarkan kondisi boolean.',
                        'duration_minutes' => 30,
                        'skills' => [
                            'Control Flow & Looping' => 1.00,
                        ]
                    ],
                    [
                        'title' => 'Instruksi For & Range Iterasi',
                        'content' => 'Sintaks `for var in range(n1, n2, inc)` untuk perulangan berbasis jumlah iterasi pasti, deret angka, dan konversi dari struktur While ke For.',
                        'summary' => 'Penggunaan instruksi For untuk iterasi tercacah.',
                        'duration_minutes' => 25,
                        'skills' => [
                            'Control Flow & Looping' => 1.00,
                        ]
                    ],
                    [
                        'title' => 'Nested Loop (Pengulangan Bersarang)',
                        'content' => 'Penerapan perulangan di dalam perulangan untuk mencetak pola geometris (persegi, segitiga siku-siku, jajargenjang) dan tabel perkalian.',
                        'summary' => 'Logika perulangan multi-tingkat untuk pemrosesan kompleks.',
                        'duration_minutes' => 35,
                        'skills' => [
                            'Control Flow & Looping' => 1.00,
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Modul 4: Pemrograman Modular & Fungsi',
                'description' => 'Penerapan pendekatan Top-Down Programming, modulerisasi kode, parameter fungsi, dan return value.',
                'difficulty_level' => 'intermediate',
                'order_index' => 4,
                'lessons' => [
                    [
                        'title' => 'Pendefinisian & Pemanggilan Fungsi',
                        'content' => 'Struktur pendefinisian `def <nama_fungsi>(<parameter>):`, penggunaan `return`, serta pemanggilan fungsi dalam assignment dan instruksi print.',
                        'summary' => 'Dasar pembuatan subprogram modular dengan fungsi.',
                        'duration_minutes' => 30,
                        'skills' => [
                            'Modular Programming & Functions' => 1.00,
                        ]
                    ],
                    [
                        'title' => 'Top-Down Design, Code Reuse, & Scope Variabel',
                        'content' => 'Memecah program utama menjadi modul-modul kecil (menu, masukan, keluaran). Memahami perbedaan Variabel Global dan Variabel Lokal.',
                        'summary' => 'Pengorganisasian kode secara top-down dan manajemen cakupan variabel.',
                        'duration_minutes' => 35,
                        'skills' => [
                            'Modular Programming & Functions' => 1.00,
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Modul 5: Struktur Data Array / List 1-Dimensi',
                'description' => 'Penggunaan struktur data terurut untuk menyimpan sekumpulan elemen bertipe sama.',
                'difficulty_level' => 'intermediate',
                'order_index' => 5,
                'lessons' => [
                    [
                        'title' => 'Deklarasi, Pengisian, dan Akses Array',
                        'content' => 'Inisialisasi `A = [None] * N`, pengisian array menggunakan N pasti atau data dummy (9999), dan pengaksesan berbasis indeks.',
                        'summary' => 'Dasar pemrosesan elemen array 1-dimensi.',
                        'duration_minutes' => 30,
                        'skills' => [
                            'Array & List Data Structure' => 1.00,
                        ]
                    ],
                    [
                        'title' => 'Pemrosesan Array & Pengintegrasian Fungsi',
                        'content' => 'Studi kasus pencarian nilai minimum, maksimum, median, pergeseran isi array, serta pembungkusan operasi array ke dalam modul fungsi.',
                        'summary' => 'Teknik pemrosesan statistik dan manipulasi elemen array.',
                        'duration_minutes' => 40,
                        'skills' => [
                            'Array & List Data Structure' => 0.70,
                            'Modular Programming & Functions' => 0.30,
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Modul 6: Array Multi-dimensi & Matriks',
                'description' => 'Pemesanan memori 2-dimensi, pemrosesan elemen per baris dan kolom, serta aplikasi matematis matriks.',
                'difficulty_level' => 'advanced',
                'order_index' => 6,
                'lessons' => [
                    [
                        'title' => 'Deklarasi & Pemesanan Memori Matriks',
                        'content' => 'Konsep array of array `arr[baris][kolom]`, pembuatan fungsi `deklarasiMatriks(dimensi1, dimensi2)`, dan pengisian matriks.',
                        'summary' => 'Representasi struktur data 2-dimensi dalam memori.',
                        'duration_minutes' => 35,
                        'skills' => [
                            'Matrix & Multi-Dimensional Array' => 0.80,
                            'Array & List Data Structure' => 0.20,
                        ]
                    ],
                    [
                        'title' => 'Operasi & Operasi Aritmatika Matriks',
                        'content' => 'Iterasi bersarang `for i ... for j ...` untuk menghitung total per baris/kolom, penjumlahan matriks, dan perkalian matriks 2x2.',
                        'summary' => 'Pengolahan dan manipulasi data matriks.',
                        'duration_minutes' => 45,
                        'skills' => [
                            'Matrix & Multi-Dimensional Array' => 1.00,
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Modul 7: Algoritma Pencarian (Searching)',
                'description' => 'Studi dan perbandingan efisiensi teknik pencarian data pada array terurut dan acak.',
                'difficulty_level' => 'advanced',
                'order_index' => 7,
                'lessons' => [
                    [
                        'title' => 'Sequential Search & Sentinel Search',
                        'content' => 'Pencarian berturutan skema boolean, skema tanpa boolean, pencarian pada tabel terurut, serta optimasi Sentinel Search di posisi `A[N]`.',
                        'summary' => 'Konsep dan variasi algoritma Sequential Search.',
                        'duration_minutes' => 35,
                        'skills' => [
                            'Searching Algorithms' => 0.80,
                            'Array & List Data Structure' => 0.20,
                        ]
                    ],
                    [
                        'title' => 'Binary Search (Pencarian Biner)',
                        'content' => 'Metode divide-and-conquer dengan membagi rentang pencarian (atas, bawah, tengah) pada array yang sudah terurut membesar.',
                        'summary' => 'Pencarian biner berefisiensi tinggi pada data terurut.',
                        'duration_minutes' => 35,
                        'skills' => [
                            'Searching Algorithms' => 1.00,
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Modul 8: Algoritma Pengurutan (Sorting)',
                'description' => 'Pemahaman metode pengurutan internal data pada memori utama.',
                'difficulty_level' => 'advanced',
                'order_index' => 8,
                'lessons' => [
                    [
                        'title' => 'Maximum Sort & Insertion Sort',
                        'content' => 'Algoritma Maximum/Selection Sort dengan mencari elemen terbesar tiap iterasi, serta Insertion Sort dengan menggeser dan menyisipkan elemen pada posisi tepat.',
                        'summary' => 'Pengurutan berbasis penyeleksian nilai ekstrim dan penyisipan.',
                        'duration_minutes' => 40,
                        'skills' => [
                            'Sorting Algorithms' => 1.00,
                        ]
                    ],
                    [
                        'title' => 'Bubble Sort & Bubble Sort Plus',
                        'content' => 'Pengurutan berbasis penukaran elemen tetangga, serta pengoptimalan Bubble Sort Plus menggunakan flag `Tukar` untuk menghentikan loop lebih awal jika data sudah terurut.',
                        'summary' => 'Prinsip penggelembungan data dan optimasi deteksi pertukaran.',
                        'duration_minutes' => 40,
                        'skills' => [
                            'Sorting Algorithms' => 1.00,
                        ]
                    ],
                ]
            ],
        ];

        // 5. Insert Modules, Lessons, dan Pivot lesson_skills
        foreach ($modules as $modData) {
            $lessonsData = $modData['lessons'];
            unset($modData['lessons']);

            $modData['learning_path_id'] = $pathId;
            $modData['status'] = 'published';
            $modData['created_at'] = now();
            $modData['updated_at'] = now();

            $moduleId = DB::table('modules')->insertGetId($modData);

            foreach ($lessonsData as $lessonIndex => $lesData) {
                $skillsToAttach = $lesData['skills'];
                unset($lesData['skills']);

                $lesData['module_id'] = $moduleId;
                $lesData['order_index'] = $lessonIndex + 1;
                $lesData['created_at'] = now();
                $lesData['updated_at'] = now();

                $lessonId = DB::table('lessons')->insertGetId($lesData);

                // Pivot lesson_skills
                foreach ($skillsToAttach as $skillName => $weight) {
                    if (isset($skillIds[$skillName])) {
                        DB::table('lesson_skills')->insert([
                            'lesson_id' => $lessonId,
                            'skill_id' => $skillIds[$skillName],
                            'relevance_weight' => $weight,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }
}
