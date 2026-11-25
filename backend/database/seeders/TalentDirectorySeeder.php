<?php

namespace Database\Seeders;

use App\Models\SbtCredential;
use App\Models\TalentPost;
use App\Models\TalentProfile;
use App\Models\TalentSkill;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TalentDirectorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $talentsData = [
            [
                'name'              => 'Ahmad Fauzi',
                'email'             => 'ahmad.fauzi@ugm.ac.id',
                'headline'          => 'Data Scientist & AI Enthusiast | UGM Computer Science',
                'campus'            => 'Universitas Gadjah Mada',
                'major'             => 'Ilmu Komputer',
                'tier'              => 'Diamond',
                'avatar_bg'         => '#fef3c7',
                'avatar_color'      => '#92400e',
                'bio'               => 'Fokus pada riset NLP, Machine Learning, dan Big Data. Telah menyelesaikan kurikulum microlearning SRL Python & AI di KampusX.',
                'wallet_address'    => '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
                'specialization'    => 'DATA',
                'modules_completed' => 8,
                'events_attended'   => 21,
                'sbt_count'         => 5,
                'skills'            => [
                    ['name' => 'Python', 'level' => 94, 'category' => 'Data'],
                    ['name' => 'Machine Learning', 'level' => 90, 'category' => 'Data'],
                    ['name' => 'Data Analysis', 'level' => 88, 'category' => 'Data'],
                    ['name' => 'SQL', 'level' => 85, 'category' => 'Data'],
                ],
                'sbt' => [
                    'token_id'         => '#SBT-2026-0041',
                    'title'            => 'Advanced Data Science & Machine Learning Specialist',
                    'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                    'tx_hash'          => '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
                    'block_number'     => '58,219,044',
                    'minted_at'        => Carbon::parse('2026-09-28 14:22:00'),
                ],
                'post' => [
                    'content' => 'Sangat bersyukur baru saja menyelesaikan modul SRL Microlearning "Python & Deep Learning Foundations" dengan passing grade 98%! Kredensial sertifikat otomatis tercetak sebagai Soulbound Token (SBT) permanen di Blockchain Polygon 🎓🚀 Terima kasih KampusX!',
                    'badge'   => [
                        'title'   => 'Advanced AI & Deep Learning Specialist',
                        'tokenId' => '#SBT-2026-0041',
                        'issuer'  => 'KampusX Verified Credentials',
                    ],
                    'likes'    => 34,
                    'comments' => 6,
                ]
            ],
            [
                'name'              => 'Rian Hidayat',
                'email'             => 'rian.hidayat@itb.ac.id',
                'headline'          => 'Fullstack Software Engineer & Cloud Architect | ITB Informatics',
                'campus'            => 'Institut Teknologi Bandung',
                'major'             => 'Teknik Informatika',
                'tier'              => 'Platinum',
                'avatar_bg'         => '#e0f2fe',
                'avatar_color'      => '#0369a1',
                'bio'               => 'Membangun aplikasi web performa tinggi menggunakan React, Node.js, dan arsitektur microservices.',
                'wallet_address'    => '0x7b12A456C89dE102F44d909Acb123456789044d9',
                'specialization'    => 'ENGINEERING',
                'modules_completed' => 7,
                'events_attended'   => 15,
                'sbt_count'         => 4,
                'skills'            => [
                    ['name' => 'React', 'level' => 92, 'category' => 'Engineering'],
                    ['name' => 'Node.js', 'level' => 88, 'category' => 'Engineering'],
                    ['name' => 'TypeScript', 'level' => 85, 'category' => 'Engineering'],
                    ['name' => 'Docker', 'level' => 80, 'category' => 'Engineering'],
                ],
                'sbt' => [
                    'token_id'         => '#SBT-2026-0082',
                    'title'            => 'Fullstack Microservices & Cloud Engineering',
                    'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                    'tx_hash'          => '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
                    'block_number'     => '58,190,412',
                    'minted_at'        => Carbon::parse('2026-09-22 10:15:00'),
                ],
                'post' => [
                    'content' => 'Tim kami berhasil mengimplementasikan arsitektur Smart Contract Soulbound Token ERC-5192 untuk portofolio digital mahasiswa. Dengan verifikasi Zero-Trust on-chain, rekruter dapat langsung membuktikan keabsahan sertifikat tanpa pihak ketiga! Cek kredensial saya di bawah:',
                    'badge'   => [
                        'title'   => 'Fullstack Cloud & Web3 Architecture',
                        'tokenId' => '#SBT-2026-0082',
                        'issuer'  => 'KampusX Verified Credentials',
                    ],
                    'likes'    => 52,
                    'comments' => 11,
                ]
            ],
            [
                'name'              => 'Dian Sastro',
                'email'             => 'dian.sastro@ui.ac.id',
                'headline'          => 'Product Designer (UI/UX) & Design System Enthusiast | UI Information Systems',
                'campus'            => 'Universitas Indonesia',
                'major'             => 'Sistem Informasi',
                'tier'              => 'Gold',
                'avatar_bg'         => '#fce7f3',
                'avatar_color'      => '#9d174d',
                'bio'               => 'Mendesain antarmuka berbasis riset pengguna (UX Research), wireframing, prototipe Figma berstandar enterprise.',
                'wallet_address'    => '0x99c4F19028471bE85a67140b91e847192a5471ab',
                'specialization'    => 'DESIGN',
                'modules_completed' => 6,
                'events_attended'   => 12,
                'sbt_count'         => 3,
                'skills'            => [
                    ['name' => 'Figma', 'level' => 96, 'category' => 'Design'],
                    ['name' => 'UI/UX Design', 'level' => 92, 'category' => 'Design'],
                    ['name' => 'UX Research', 'level' => 85, 'category' => 'Design'],
                    ['name' => 'Design System', 'level' => 90, 'category' => 'Design'],
                ],
                'sbt' => [
                    'token_id'         => '#SBT-2026-0105',
                    'title'            => 'Human-Centered UI/UX Master Credentials',
                    'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                    'tx_hash'          => '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
                    'block_number'     => '58,124,500',
                    'minted_at'        => Carbon::parse('2026-09-15 16:45:00'),
                ],
                'post' => [
                    'content' => 'Desain yang baik selalu berlandaskan data dan kebutuhan riil pengguna. Senang sekali bisa berbagi materi seputar Design System & UX Research di workshop KampusX kemarin! Kredensial pembicara sudah terverifikasi di Polygon Ledger.',
                    'badge'   => [
                        'title'   => 'Human-Centered UI/UX Master Credentials',
                        'tokenId' => '#SBT-2026-0105',
                        'issuer'  => 'KampusX Verified Credentials',
                    ],
                    'likes'    => 41,
                    'comments' => 4,
                ]
            ],
            [
                'name'              => 'Siti Rahma',
                'email'             => 'siti.rahma@ub.ac.id',
                'headline'          => 'AI Engineer & Deep Learning Researcher | Universitas Brawijaya',
                'campus'            => 'Universitas Brawijaya',
                'major'             => 'Teknik Informatika',
                'tier'              => 'Gold',
                'avatar_bg'         => '#fef3c7',
                'avatar_color'      => '#b45309',
                'bio'               => 'Tertarik pada Computer Vision, generative models, dan RAG retrieval optimization.',
                'wallet_address'    => '0x44d1E185c899d214C718b89Fc3a4b98F12c088ec',
                'specialization'    => 'DATA',
                'modules_completed' => 6,
                'events_attended'   => 13,
                'sbt_count'         => 3,
                'skills'            => [
                    ['name' => 'Python', 'level' => 91, 'category' => 'Data'],
                    ['name' => 'Machine Learning', 'level' => 89, 'category' => 'Data'],
                    ['name' => 'TensorFlow', 'level' => 84, 'category' => 'Data'],
                    ['name' => 'Data Analysis', 'level' => 86, 'category' => 'Data'],
                ],
                'sbt' => [
                    'token_id'         => '#SBT-2026-0118',
                    'title'            => 'Deep Learning & Neural Networks Practitioner',
                    'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                    'tx_hash'          => '0x629a81234b981e74a682910ba7491029c8714019a82740192847bca8271039de',
                    'block_number'     => '58,091,230',
                    'minted_at'        => Carbon::parse('2026-09-10 09:30:00'),
                ],
                'post' => null
            ],
            [
                'name'              => 'Budi Santoso',
                'email'             => 'budi.santoso@its.ac.id',
                'headline'          => 'Backend Engineer (Golang & Kubernetes) | ITS Informatics',
                'campus'            => 'Institut Teknologi Sepuluh Nopember',
                'major'             => 'Teknik Informatika',
                'tier'              => 'Gold',
                'avatar_bg'         => '#ede9fe',
                'avatar_color'      => '#6d28d9',
                'bio'               => 'Spesialis sistem terdistribusi, database concurrency, Redis caching, dan event-driven microservices.',
                'wallet_address'    => '0x81ee91402ba815349e5d4cb3c94f1c8a73b299a0',
                'specialization'    => 'ENGINEERING',
                'modules_completed' => 5,
                'events_attended'   => 9,
                'sbt_count'         => 3,
                'skills'            => [
                    ['name' => 'Go', 'level' => 93, 'category' => 'Engineering'],
                    ['name' => 'SQL', 'level' => 89, 'category' => 'Engineering'],
                    ['name' => 'Docker', 'level' => 84, 'category' => 'Engineering'],
                    ['name' => 'Redis', 'level' => 86, 'category' => 'Engineering'],
                ],
                'sbt' => [
                    'token_id'         => '#SBT-2026-0130',
                    'title'            => 'High-Throughput Backend Architecture',
                    'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                    'tx_hash'          => '0x38471928a471029c8714019a82740192847bca8271039de629a81234b981e74a',
                    'block_number'     => '58,014,921',
                    'minted_at'        => Carbon::parse('2026-09-05 11:10:00'),
                ],
                'post' => null
            ],
            [
                'name'              => 'Citra Kirana',
                'email'             => 'citra.kirana@unpad.ac.id',
                'headline'          => 'Product Manager & Tech Strategist | Universitas Padjadjaran',
                'campus'            => 'Universitas Padjadjaran',
                'major'             => 'Manajemen Bisnis & IT',
                'tier'              => 'Gold',
                'avatar_bg'         => '#dcfce7',
                'avatar_color'      => '#166534',
                'bio'               => 'Menghubungkan strategi bisnis dengan eksekusi rekayasa perangkat lunak melalui metodologi Scrum/Agile.',
                'wallet_address'    => '0x12a8492e85a67140b91e847192a54b38294755c1',
                'specialization'    => 'BUSINESS',
                'modules_completed' => 5,
                'events_attended'   => 11,
                'sbt_count'         => 2,
                'skills'            => [
                    ['name' => 'Product Management', 'level' => 92, 'category' => 'Business'],
                    ['name' => 'Data Analysis', 'level' => 86, 'category' => 'Data'],
                    ['name' => 'Scrum Agile', 'level' => 90, 'category' => 'Business'],
                    ['name' => 'UI/UX Design', 'level' => 78, 'category' => 'Design'],
                ],
                'sbt' => [
                    'token_id'         => '#SBT-2026-0144',
                    'title'            => 'Digital Product Management Excellence',
                    'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                    'tx_hash'          => '0x9918274a1029c8714019a82740192847bca8271039de629a81234b981e74a384',
                    'block_number'     => '57,984,110',
                    'minted_at'        => Carbon::parse('2026-09-01 13:00:00'),
                ],
                'post' => null
            ],
        ];

        foreach ($talentsData as $data) {
            // 1. Buat atau ambil user
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => Hash::make('password123'),
                    'role'     => 'participant',
                    'points'   => $data['modules_completed'] * 350 + $data['sbt_count'] * 500,
                ]
            );

            // 2. Buat atau perbarui Talent Profile
            $profile = TalentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'headline'          => $data['headline'],
                    'campus'            => $data['campus'],
                    'major'             => $data['major'],
                    'tier'              => $data['tier'],
                    'avatar_bg'         => $data['avatar_bg'],
                    'avatar_color'      => $data['avatar_color'],
                    'bio'               => $data['bio'],
                    'wallet_address'    => $data['wallet_address'],
                    'specialization'    => $data['specialization'],
                    'modules_completed' => $data['modules_completed'],
                    'events_attended'   => $data['events_attended'],
                    'sbt_count'         => $data['sbt_count'],
                    'is_public'         => true,
                    'is_open_to_work'   => true,
                ]
            );

            // 3. Masukkan Skills
            TalentSkill::where('talent_profile_id', $profile->id)->delete();
            foreach ($data['skills'] as $skillItem) {
                TalentSkill::create([
                    'talent_profile_id' => $profile->id,
                    'user_id'           => $user->id,
                    'name'              => $skillItem['name'],
                    'level'             => $skillItem['level'],
                    'category'          => $skillItem['category'] ?? null,
                ]);
            }

            // 4. Masukkan SBT Credential
            $sbt = null;
            if (!empty($data['sbt'])) {
                $sbt = SbtCredential::updateOrCreate(
                    ['token_id' => $data['sbt']['token_id']],
                    [
                        'user_id'           => $user->id,
                        'talent_profile_id' => $profile->id,
                        'title'             => $data['sbt']['title'],
                        'contract_address'  => $data['sbt']['contract_address'],
                        'tx_hash'           => $data['sbt']['tx_hash'],
                        'block_number'      => $data['sbt']['block_number'],
                        'minted_at'         => $data['sbt']['minted_at'],
                        'network'           => 'Polygon PoS',
                        'token_standard'    => 'ERC-5192 (Soulbound Token)',
                        'issuer'            => 'KampusX Verified Credentials',
                        'is_verified'       => true,
                    ]
                );
            }

            // 5. Masukkan Feed Post jika ada
            if (!empty($data['post'])) {
                TalentPost::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'content' => $data['post']['content'],
                    ],
                    [
                        'sbt_credential_id' => $sbt ? $sbt->id : null,
                        'badge_highlight'   => $data['post']['badge'],
                        'likes_count'       => $data['post']['likes'],
                        'comments_count'    => $data['post']['comments'],
                        'created_at'        => Carbon::now()->subHours(rand(2, 24)),
                    ]
                );
            }
        }
    }
}
