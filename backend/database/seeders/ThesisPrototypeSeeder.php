<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Institution;
use App\Models\SoulboundToken;
use App\Models\Ticket;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\PointTransaction;

class ThesisPrototypeSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Menjalankan ThesisPrototypeSeeder...');

        // 1. Pastikan Data Universitas Lengkap
        $universities = [
            'Universitas Indonesia'                 => 'UI',
            'Institut Teknologi Bandung'            => 'ITB',
            'Universitas Gadjah Mada'               => 'UGM',
            'Universitas Brawijaya'                 => 'UB',
            'Institut Teknologi Sepuluh Nopember'   => 'ITS',
            'Universitas Padjadjaran'               => 'UNPAD',
            'Universitas Diponegoro'                => 'UNDIP',
            'Universitas Airlangga'                 => 'UNAIR',
            'Universitas Sebelas Maret'             => 'UNS',
            'Binus University'                      => 'BINUS',
            'Telkom University'                     => 'TELKOM',
            'Universitas Kristen Maranatha'         => 'MARANATHA',
            'Universitas Pelita Harapan'            => 'UPH',
            'Universitas Prasetiya Mulya'           => 'PRASMUL'
        ];

        $univMap = [];
        foreach ($universities as $fullName => $code) {
            $slug = Str::slug($fullName);
            $inst = Institution::firstOrCreate(
                ['slug' => $slug],
                [
                    'name'        => $fullName,
                    'type'        => 'university',
                    'description' => "Perguruan Tinggi Mitra KampusX - {$fullName}",
                ]
            );
            $univMap[$code] = $inst->id;
        }

        // 2. Siapkan User Akun Presentasi Mahasiswa (Brigitta Caitlin & Participant KampusX)
        // Diberi poin 2.450 (Silver Tier) -> hanya butuh +50 poin untuk naik ke Gold Tier (threshold: 2.500)
        $demoMembers = [
            [
                'email'         => '2372016@maranatha.ac.id',
                'name'          => 'Brigitta Caitlin Surya Adiwangsa',
                'univ_code'     => 'MARANATHA',
                'points'        => 2450,
                'tier'          => 'Silver',
                'phone'         => '081234567890'
            ],
            [
                'email'         => 'part@kampusx.com',
                'name'          => 'Budi Pratama (Demo Member)',
                'univ_code'     => 'UI',
                'points'        => 2450,
                'tier'          => 'Silver',
                'phone'         => '081298765432'
            ]
        ];

        foreach ($demoMembers as $dm) {
            $user = User::updateOrCreate(
                ['email' => $dm['email']],
                [
                    'name'          => $dm['name'],
                    'password'      => Hash::make('kampusx123'),
                    'role'          => 'participant',
                    'status'        => 'active',
                    'is_verified'   => true,
                    'university_id' => $univMap[$dm['univ_code']] ?? null,
                    'points'        => $dm['points'],
                    'tier'          => $dm['tier'],
                    'phone'         => $dm['phone']
                ]
            );

            // Berikan tiket partisipasi riil
            $this->ensureTicketsForUser($user->id, $user->name, $user->email, 5);
        }

        // 3. Seed Top Leaderboard Mahasiswa Se-Indonesia (Data Realistis Multi-Tier)
        $topRankedStudents = [
            [
                'name'      => 'Ahmad Fauzi',
                'email'     => 'ahmad.fauzi@mail.ugm.ac.id',
                'univ_code' => 'UGM',
                'points'    => 5450,
                'tier'      => 'Diamond',
                'events'    => 21,
                'sbt'       => [
                    'title'          => 'Advanced AI & Deep Learning Specialist',
                    'skill_category' => 'Artificial Intelligence & Machine Learning',
                    'score'          => 98
                ]
            ],
            [
                'name'      => 'Rian Hidayat',
                'email'     => 'rian.hidayat@itb.ac.id',
                'univ_code' => 'ITB',
                'points'    => 4820,
                'tier'      => 'Platinum',
                'events'    => 15,
                'sbt'       => [
                    'title'          => 'Fullstack Microservices & Cloud Architecture',
                    'skill_category' => 'Cloud Computing & DevOps',
                    'score'          => 94
                ]
            ],
            [
                'name'      => 'Siti Rahma',
                'email'     => 'siti.rahma@student.ub.ac.id',
                'univ_code' => 'UB',
                'points'    => 4100,
                'tier'      => 'Gold',
                'events'    => 13,
                'sbt'       => [
                    'title'          => 'Smart Contract Security & EVM Vulnerabilities',
                    'skill_category' => 'Blockchain & Smart Contracts',
                    'score'          => 95
                ]
            ],
            [
                'name'      => 'Dian Sastro',
                'email'     => 'dian.sastro@ui.ac.id',
                'univ_code' => 'UI',
                'points'    => 3920,
                'tier'      => 'Gold',
                'events'    => 12,
                'sbt'       => [
                    'title'          => 'Mastering Design Systems & UX Engineering',
                    'skill_category' => 'UI/UX & Product Design',
                    'score'          => 91
                ]
            ],
            [
                'name'      => 'Budi Santoso',
                'email'     => 'budi.santoso@mhs.its.ac.id',
                'univ_code' => 'ITS',
                'points'    => 3680,
                'tier'      => 'Gold',
                'events'    => 9,
                'sbt'       => null
            ],
            [
                'name'      => 'Citra Kirana',
                'email'     => 'citra.kirana@mail.unpad.ac.id',
                'univ_code' => 'UNPAD',
                'points'    => 3410,
                'tier'      => 'Gold',
                'events'    => 11,
                'sbt'       => null
            ],
            [
                'name'      => 'Eko Prasetyo',
                'email'     => 'eko.prasetyo@undip.ac.id',
                'univ_code' => 'UNDIP',
                'points'    => 3150,
                'tier'      => 'Gold',
                'events'    => 8,
                'sbt'       => null
            ],
            [
                'name'      => 'Fahri Alamsyah',
                'email'     => 'fahri.alamsyah@unair.ac.id',
                'univ_code' => 'UNAIR',
                'points'    => 2990,
                'tier'      => 'Gold',
                'events'    => 7,
                'sbt'       => null
            ],
            [
                'name'      => 'Gita Gutawa',
                'email'     => 'gita.gutawa@uns.ac.id',
                'univ_code' => 'UNS',
                'points'    => 2750,
                'tier'      => 'Gold',
                'events'    => 6,
                'sbt'       => null
            ],
            [
                'name'      => 'Hendra Wijaya',
                'email'     => 'hendra.wijaya@binus.ac.id',
                'univ_code' => 'BINUS',
                'points'    => 2560,
                'tier'      => 'Gold',
                'events'    => 7,
                'sbt'       => null
            ],
            [
                'name'      => 'Kevin Anggara',
                'email'     => 'kevin.anggara@telkomuniversity.ac.id',
                'univ_code' => 'TELKOM',
                'points'    => 2500,
                'tier'      => 'Silver',
                'events'    => 6,
                'sbt'       => null
            ],
            [
                'name'      => 'Nadin Amizah',
                'email'     => 'nadin.amizah@uph.edu',
                'univ_code' => 'UPH',
                'points'    => 2380,
                'tier'      => 'Silver',
                'events'    => 5,
                'sbt'       => null
            ],
            [
                'name'      => 'Raditya Dika',
                'email'     => 'raditya.dika@pmbs.ac.id',
                'univ_code' => 'PRASMUL',
                'points'    => 2210,
                'tier'      => 'Silver',
                'events'    => 4,
                'sbt'       => null
            ],
            [
                'name'      => 'Tara Basro',
                'email'     => 'tara.basro@binus.edu',
                'univ_code' => 'BINUS',
                'points'    => 2090,
                'tier'      => 'Silver',
                'events'    => 4,
                'sbt'       => null
            ]
        ];

        foreach ($topRankedStudents as $std) {
            $student = User::updateOrCreate(
                ['email' => $std['email']],
                [
                    'name'          => $std['name'],
                    'password'      => Hash::make('kampusx123'),
                    'role'          => 'participant',
                    'status'        => 'active',
                    'is_verified'   => true,
                    'university_id' => $univMap[$std['univ_code']] ?? null,
                    'points'        => $std['points'],
                    'tier'          => $std['tier'],
                    'phone'         => '08' . rand(111111111, 999999999)
                ]
            );

            // Pastikan event tickets tercatat
            $this->ensureTicketsForUser($student->id, $student->name, $student->email, $std['events']);

            // Jika punya SBT, catat di tabel soulbound_tokens
            if (!empty($std['sbt'])) {
                $rawNum = rand(100, 999);
                SoulboundToken::updateOrCreate(
                    ['user_id' => $student->id, 'title' => $std['sbt']['title']],
                    [
                        'ticket_code'      => 'CERT-2026-0' . $rawNum,
                        'token_id'         => '#SBT-2026-0' . $rawNum,
                        'issuer'           => 'KampusX Verified Credentials & Partner University',
                        'tx_hash'          => '0x' . hash('sha256', $student->id . $std['sbt']['title']),
                        'contract_address' => '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
                        'wallet_address'   => '0x' . Str::random(40),
                        'block_number'     => 58220000 + rand(100, 999),
                        'standard'         => 'ERC-5192 (Soulbound / Non-Transferable)',
                        'cognitive_score'  => $std['sbt']['score'],
                        'skill_category'   => $std['sbt']['skill_category'],
                        'token_uri'        => 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/token-' . $student->id . '.json',
                        'status'           => 'Success',
                        'minted_at'        => now()->subDays(rand(5, 30)),
                    ]
                );
            }
        }

        $this->command->info('✅ ThesisPrototypeSeeder selesai! 16 Mahasiswa berhasil di-seed dengan points, tier, & kredensial.');
    }

    /**
     * Pastikan user memiliki N tiket aktif di database agar count eventsAttended di Leaderboard valid
     */
    protected function ensureTicketsForUser(int $userId, string $name, string $email, int $count): void
    {
        $currentCount = Ticket::where('participant_id', $userId)->count();
        if ($currentCount >= $count) {
            return;
        }

        $needed = $count - $currentCount;
        for ($i = 0; $i < $needed; $i++) {
            $ticketCode = 'TK-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);
            Ticket::create([
                'participant_id' => $userId,
                'order_item_id'  => 1, // Fallback dummy order item
                'attendee_name'  => $name,
                'attendee_email' => $email,
                'ticket_code'    => $ticketCode,
                'qr_token'       => (string) Str::uuid(),
                'status'         => 'active',
                'created_at'     => now()->subDays(rand(1, 40))
            ]);
        }
    }
}
