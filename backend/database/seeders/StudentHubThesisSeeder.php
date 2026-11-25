<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Badge;
use App\Models\StudentBadge;
use App\Models\RewardCatalog;
use App\Models\SoulboundToken;
use App\Models\PointTransaction;
use App\Models\EventSeat;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\ExternalAchievement;
use Carbon\Carbon;

class StudentHubThesisSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Update role enum to support 'recruiter' if not yet supported
        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('participant','organizer','admin','committee','recruiter') NOT NULL DEFAULT 'participant'");
        } catch (\Throwable $e) {
            // Already modified or MariaDB/MySQL syntax handled
        }

        // 1. SEED 5 BADGES RESMI
        $badges = [
            [
                'code'               => 'FIRST_STEP',
                'name'               => 'First Step',
                'description'        => 'Langkah pertama Anda dalam mengikuti seminar atau workshop pengembangan diri.',
                'criteria'           => 'Mengikuti event pertama',
                'icon'               => 'Award',
                'points_requirement' => 50,
                'category'           => 'event',
                'is_active'          => true,
            ],
            [
                'code'               => 'ACTIVE_STUDENT',
                'name'               => 'Active Student',
                'description'        => 'Dedikasi aktif dalam memperkaya kompetensi dengan menghadiri 5 seminar.',
                'criteria'           => 'Mengikuti minimal 5 event',
                'icon'               => 'Zap',
                'points_requirement' => 250,
                'category'           => 'event',
                'is_active'          => true,
            ],
            [
                'code'               => 'KNOWLEDGE_SEEKER',
                'name'               => 'Knowledge Seeker',
                'description'        => 'Pembelajar mandiri yang tekun menyelesaikan modul microlearning secara konsisten.',
                'criteria'           => 'Menyelesaikan 5 microlearning',
                'icon'               => 'BookOpen',
                'points_requirement' => 150,
                'category'           => 'microlearning',
                'is_active'          => true,
            ],
            [
                'code'               => 'PERFECT_SCORE',
                'name'               => 'Perfect Score',
                'description'        => 'Prestasi luar biasa dengan meraih nilai sempurna 100 pada kuis kognitif.',
                'criteria'           => 'Memperoleh nilai kuis 100',
                'icon'               => 'Sparkles',
                'points_requirement' => 100,
                'category'           => 'quiz',
                'is_active'          => true,
            ],
            [
                'code'               => 'EVENT_ENTHUSIAST',
                'name'               => 'Event Enthusiast',
                'description'        => 'Apresiasi komitmen tertinggi menghadiri lebih dari 10 sesi pembelajaran industri.',
                'criteria'           => 'Mengikuti 10 event',
                'icon'               => 'Trophy',
                'points_requirement' => 500,
                'category'           => 'event',
                'is_active'          => true,
            ],
        ];

        foreach ($badges as $b) {
            Badge::updateOrCreate(['code' => $b['code']], $b);
        }

        // 2. SEED 5 REWARD CATALOG RESMI
        $rewards = [
            [
                'code'            => 'REWARD_DISCOUNT_10',
                'name'            => 'Diskon Tiket Event 10%',
                'description'     => 'Potongan harga instan 10% untuk tiket seminar dan workshop berbayar di KampusX.',
                'reward_type'     => 'ticket_discount',
                'reward_value'    => 10.0,
                'quota'           => 50,
                'remaining_quota' => 48,
                'cost_budget'     => 5000.0,
                'is_active'       => true,
            ],
            [
                'code'            => 'REWARD_DISCOUNT_20',
                'name'            => 'Diskon Tiket Event 20%',
                'description'     => 'Potongan harga spesial 20% khusus peserta berprestasi untuk tiket seminar.',
                'reward_type'     => 'ticket_discount',
                'reward_value'    => 20.0,
                'quota'           => 30,
                'remaining_quota' => 26,
                'cost_budget'     => 10000.0,
                'is_active'       => true,
            ],
            [
                'code'            => 'REWARD_BONUS_50',
                'name'            => 'Bonus Gamifikasi 50 Poin',
                'description'     => 'Tambahan 50 poin gamifikasi langsung masuk ke saldo akun Anda untuk mempercepat kenaikan tier.',
                'reward_type'     => 'bonus_points',
                'reward_value'    => 50.0,
                'quota'           => 100,
                'remaining_quota' => 95,
                'cost_budget'     => 0.0,
                'is_active'       => true,
            ],
            [
                'code'            => 'REWARD_BONUS_100',
                'name'            => 'Bonus Gamifikasi 100 Poin',
                'description'     => 'Tambahan 100 poin gamifikasi eksklusif untuk akselerasi status Gold dan Platinum.',
                'reward_type'     => 'bonus_points',
                'reward_value'    => 100.0,
                'quota'           => 50,
                'remaining_quota' => 45,
                'cost_budget'     => 0.0,
                'is_active'       => true,
            ],
            [
                'code'            => 'REWARD_EXCLUSIVE_ACCESS',
                'name'            => 'Exclusive Access Pass',
                'description'     => 'Akses jalur VIP kursi baris depan dan materi eksklusif pasca-event.',
                'reward_type'     => 'exclusive_access',
                'reward_value'    => 1.0,
                'quota'           => 20,
                'remaining_quota' => 18,
                'cost_budget'     => 25000.0,
                'is_active'       => true,
            ],
        ];

        foreach ($rewards as $r) {
            RewardCatalog::updateOrCreate(['code' => $r['code']], $r);
        }

        // 3. SEED 5 MAHASISWA DEMO (Konsisten dengan Skenario Sidang)
        $students = [
            [
                'email'       => 'part@kampusx.com',
                'name'        => 'Budi Pratama',
                'role'        => 'participant',
                'points'      => 450, // Silver tier -> butuh +50 poin untuk naik Gold (500)
                'tier'        => 'Silver',
                'phone'       => '081298765431',
                'events'      => 4,
                'sbt_title'   => 'Certified Fullstack Application Specialist',
            ],
            [
                'email'       => 'ahmad.fauzi@mail.ugm.ac.id',
                'name'        => 'Ahmad Fauzi',
                'role'        => 'participant',
                'points'      => 1250, // Platinum (>= 1000)
                'tier'        => 'Platinum',
                'phone'       => '081234567891',
                'events'      => 12,
                'sbt_title'   => 'Advanced AI & Deep Learning Specialist',
            ],
            [
                'email'       => 'rian.hidayat@itb.ac.id',
                'name'        => 'Rian Hidayat',
                'role'        => 'participant',
                'points'      => 1100, // Platinum
                'tier'        => 'Platinum',
                'phone'       => '081234567892',
                'events'      => 8,
                'sbt_title'   => 'Fullstack Microservices & Cloud Engineering',
            ],
            [
                'email'       => 'siti.rahma@student.ub.ac.id',
                'name'        => 'Siti Rahma',
                'role'        => 'participant',
                'points'      => 750, // Gold (500 - 999)
                'tier'        => 'Gold',
                'phone'       => '081234567893',
                'events'      => 6,
                'sbt_title'   => 'Smart Contract Security & EVM Vulnerabilities',
            ],
            [
                'email'       => 'dian.sastro@ui.ac.id',
                'name'        => 'Dian Sastro',
                'role'        => 'participant',
                'points'      => 600, // Gold
                'tier'        => 'Gold',
                'phone'       => '081234567894',
                'events'      => 5,
                'sbt_title'   => 'Mastering Design Systems & Accessibility',
            ],
        ];

        foreach ($students as $std) {
            $user = User::updateOrCreate(
                ['email' => $std['email']],
                [
                    'name'              => $std['name'],
                    'password'          => Hash::make('kampusx123'),
                    'role'              => 'participant',
                    'points'            => $std['points'],
                    'tier'              => $std['tier'],
                    'phone'             => $std['phone'],
                    'is_verified'       => true,
                    'status'            => 'active',
                    'email_verified_at' => now(),
                ]
            );

            // Berikan badge First Step & Active Student jika event >= 5
            $firstStepBadge = Badge::where('code', 'FIRST_STEP')->first();
            if ($firstStepBadge) {
                StudentBadge::firstOrCreate([
                    'user_id'  => $user->id,
                    'badge_id' => $firstStepBadge->id,
                ], [
                    'unlocked_at' => Carbon::now()->subDays(10),
                ]);
            }

            if ($std['events'] >= 5) {
                $activeBadge = Badge::where('code', 'ACTIVE_STUDENT')->first();
                if ($activeBadge) {
                    StudentBadge::firstOrCreate([
                        'user_id'  => $user->id,
                        'badge_id' => $activeBadge->id,
                    ], [
                        'unlocked_at' => Carbon::now()->subDays(5),
                    ]);
                }
            }

            // Pastikan ada riwayat transaksi poin
            $txCount = PointTransaction::where('user_id', $user->id)->count();
            if ($txCount === 0) {
                PointTransaction::create([
                    'user_id'     => $user->id,
                    'amount'      => 50,
                    'type'        => 'global',
                    'description' => 'Mengikuti Event: Workshop Cloud Architecture & DevOps [REF:EVT-INIT-01]',
                    'created_at'  => Carbon::now()->subDays(14),
                ]);
                PointTransaction::create([
                    'user_id'     => $user->id,
                    'amount'      => 30,
                    'type'        => 'global',
                    'description' => 'Menyelesaikan Microlearning: Dasar Containerization [REF:MCL-INIT-01]',
                    'created_at'  => Carbon::now()->subDays(7),
                ]);
            }

            // Seed Kredensial SBT untuk mahasiswa jika belum ada
            $sbtCount = SoulboundToken::where('user_id', $user->id)->count();
            if ($sbtCount === 0) {
                $rawNum = rand(100, 999);
                $certCode = 'CERT-' . date('Y') . '-' . str_pad($rawNum, 4, '0', STR_PAD_LEFT);
                $tokenId = '#SBT-' . date('Y') . '-' . str_pad($rawNum, 4, '0', STR_PAD_LEFT);
                $txHash = '0x' . hash('sha256', $user->id . $std['sbt_title'] . 'demo');

                SoulboundToken::create([
                    'user_id'          => $user->id,
                    'credential_code'  => $certCode,
                    'ticket_code'      => $certCode,
                    'token_id'         => $tokenId,
                    'title'            => $std['sbt_title'],
                    'issuer'           => 'KampusX Verified Authority & GDSC Indonesia',
                    'tx_hash'          => $txHash,
                    'contract_address' => \App\Services\Blockchain\SoulboundTokenService::CONTRACT_ADDRESS,
                    'wallet_address'   => '0x' . substr(hash('sha256', $user->email . 'wallet'), 0, 40),
                    'block_number'     => (string) rand(58210000, 58280000),
                    'standard'         => 'ERC-5192 (Soulbound / Non-Transferable)',
                    'cognitive_score'  => 96,
                    'skill_category'   => 'Software Engineering',
                    'token_uri'        => 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata-' . $rawNum . '.json',
                    'status'           => 'active',
                    'minting_status'   => 'MINTED',
                    'is_revoked'       => false,
                    'minted_at'        => Carbon::now()->subDays(rand(2, 20)),
                ]);
            }
        }

        // 4. SEED 1 AKUN RECRUITER
        User::updateOrCreate(
            ['email' => 'recruiter@kampusx.com'],
            [
                'name'              => 'HR Recruiter Partner (PT Teknologi Bangsa)',
                'password'          => Hash::make('kampusx123'),
                'role'              => 'recruiter',
                'is_verified'       => true,
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 5. SEED 1 AKUN ADMIN
        User::updateOrCreate(
            ['email' => 'admin@kampusx.com'],
            [
                'name'              => 'Admin KampusX (Issuer)',
                'password'          => Hash::make('kampusx123'),
                'role'              => 'admin',
                'is_verified'       => true,
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 6. SEED KURSI UNTUK EVENT PERTAMA
        $firstEvent = Event::first();
        if ($firstEvent) {
            $existingSeats = EventSeat::where('event_id', $firstEvent->id)->count();
            if ($existingSeats === 0) {
                app(\App\Services\SeatLockService::class)->getSeats($firstEvent->id);
            }
        }
    }
}
