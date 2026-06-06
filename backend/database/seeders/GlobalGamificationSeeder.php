<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\Reward;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;
use App\Models\Setting;
use App\Services\ProcessGlobalPointConversion;
use Illuminate\Support\Facades\Log;

class GlobalGamificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Log::info('Memulai simulasi GlobalGamificationSeeder...');

        // 1. Setup 1 Member dummy
        $user = User::firstOrCreate(
            ['email' => 'member.poc@example.com'],
            [
                'name' => 'Member PoC Test',
                'password' => bcrypt('password'),
                'role' => 'participant',
                'is_verified' => true
            ]
        );

        // Setup 1 Organizer dummy
        $organizer = User::firstOrCreate(
            ['email' => 'organizer.poc@example.com'],
            [
                'name' => 'Organizer PoC',
                'password' => bcrypt('password'),
                'role' => 'organizer',
                'is_verified' => true
            ]
        );

        // 2. Setup 1 Event dummy yang sudah selesai ("ended")
        $event = Event::create([
            'organizer_id' => $organizer->id,
            'title' => 'Event Gamifikasi Berakhir PoC',
            'description' => 'Event yang sudah selesai untuk skenario QA konversi.',
            'status' => 'completed',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(5)
        ]);

        // Setup sisa 500 Poin Lokal dari event tersebut
        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'activity_id' => null,
            'amount' => 500,
            'type' => 'local',
            'description' => 'Poin lokal akumulasi peserta dari event'
        ]);

        LocalMemberPoint::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'points_balance' => 500
        ]);

        Log::info("Dummy Member '{$user->name}' disiapkan dengan 500 Poin Lokal untuk Event ID: {$event->id}.");

        // 3. Setup rasio konversi di settings (10 Local = 1 Global)
        Setting::updateOrCreate(
            ['key' => 'local_to_global_ratio'],
            ['value' => '10']
        );

        // 4. Eksekusi service ProcessGlobalPointConversion untuk member tersebut
        $conversionService = new ProcessGlobalPointConversion();
        $globalPointsAdded = $conversionService->execute($user, $event->id, 500);

        Log::info("Service ProcessGlobalPointConversion dijalankan. 500 Poin Lokal dikonversi menjadi {$globalPointsAdded} Poin Global.");

        // 5. Setup 1 Global Reward seharga 50 poin
        $reward = Reward::create([
            'event_id' => null,
            'title' => 'Kaos Eksklusif KampusX',
            'description' => 'Reward global yang dapat ditukarkan dengan poin global.',
            'points_cost' => 50,
            'stock' => 5,
            'limit_per_user' => 1,
            'reward_type' => 'physical',
            'type' => 'global',
            'is_active' => true
        ]);

        // 6. Lakukan simulasi penukaran (redeem) Reward Global menggunakan saldo Poin Global baru
        $reward->decrement('stock');

        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => null,
            'activity_id' => null,
            'amount' => -$reward->points_cost,
            'type' => 'global',
            'description' => 'Penukaran Reward Global: ' . $reward->title
        ]);

        RedemptionHistory::create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'points_spent' => $reward->points_cost,
            'status' => 'pending',
            'notes' => 'Ukuran L, Warna Hitam',
            'redeemed_at' => now()
        ]);

        Log::info("Simulasi penukaran reward global '{$reward->title}' seharga 50 poin berhasil dijalankan.");
        Log::info("Simulasi seeder selesai dengan sukses.");
    }
}
