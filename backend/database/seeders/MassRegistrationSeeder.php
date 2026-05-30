<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\AttendanceLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class MassRegistrationSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        
        // Ambil event (misalnya event ID 1 atau event published pertama)
        $event = Event::where('status', 'published')->first();

        if (!$event) {
            $this->command->error("Tidak ada event yang aktif/published untuk pendaftaran!");
            return;
        }

        $numberOfParticipants = 50; // Jumlah peserta yang ingin di-generate
        $this->command->info("Membuat {$numberOfParticipants} peserta bayangan untuk event: " . $event->title);

        $progressBar = $this->command->getOutput()->createProgressBar($numberOfParticipants);
        $progressBar->start();

        for ($i = 0; $i < $numberOfParticipants; $i++) {
            DB::transaction(function () use ($event, $faker) {
                // 1. Buat User Fake
                $user = User::create([
                    'name' => $faker->name,
                    'email' => $faker->unique()->safeEmail,
                    'password' => bcrypt('password'),
                    'role' => 'participant',
                    'phone' => $faker->phoneNumber,
                ]);

                // 2. Buat Order
                $order = Order::create([
                    'order_id'    => 'ORD-' . strtoupper(Str::random(10)),
                    'event_id'    => $event->id,
                    'user_id'     => $user->id,
                    'amount'      => 0, // atau total_price jika berbeda di skema Anda
                    'status'      => 'paid',
                    'paid_at'     => now(),
                ]);

                // 3. Buat Order Item
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => 1,
                    'price'    => 0,
                ]);

                // 4. Buat Tiket
                $ticket = Ticket::create([
                    'participant_id' => $user->id,
                    'order_item_id'  => $orderItem->id,
                    'attendee_name'  => $user->name,
                    'attendee_email' => $user->email,
                    'ticket_code'    => strtoupper(Str::random(10)),
                    'qr_token'       => Str::uuid()->toString(),
                    'status'         => 'active',
                ]);

                // 5. Random Check-in (sekitar 60% peserta hadir)
                if (rand(1, 100) <= 60) {
                    $scanTime = now()->subMinutes(rand(10, 120)); // Hadir 10-120 menit lalu
                    
                    $checkoutTime = rand(1, 100) <= 50 ? $scanTime->copy()->addMinutes(rand(60, 180)) : null;

                    AttendanceLog::create([
                        'event_id' => $event->id,
                        'ticket_id' => $ticket->id,
                        'method' => 'qr', // atau manual
                        'scan_time' => $scanTime,
                        'checkout_time' => $checkoutTime
                    ]);

                    $ticket->update(['status' => 'used']);

                    // 6. Buat Dummy Survey Response untuk peserta yang checkout
                    if ($checkoutTime) {
                        \App\Models\SurveyResponse::create([
                            'user_id' => $user->id,
                            'event_id' => $event->id,
                            'rating' => rand(3, 5),
                            'speaker_rating' => rand(3, 5),
                            'material_rating' => rand(3, 5),
                            'comments' => 'Acara yang luar biasa!',
                        ]);
                    }
                }
            });

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->info("\nSeeding Mass Registration selesai!");
    }
}
