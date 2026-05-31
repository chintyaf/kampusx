<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class EventRegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ambil event pertama yang published
        $event = Event::where('status', 'published')->first();

        if (!$event) {
            $this->command->error("Tidak ada event yang aktif/published untuk pendaftaran!");
            return;
        }

        // 2. Ambil semua user dengan role participant
        $participants = User::where('role', 'participant')->get();

        if ($participants->isEmpty()) {
            $this->command->warn("Tidak ada user participant untuk didaftarkan.");
            return;
        }

        $this->command->info("Mendaftarkan " . $participants->count() . " participant ke event: " . $event->title);

        foreach ($participants as $user) {
            // Cek apakah user sudah terdaftar di event ini
            $exists = Order::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($exists) {
                $this->command->line("User {$user->name} ({$user->email}) sudah terdaftar. Skip.");
                continue;
            }

            DB::transaction(function () use ($event, $user) {
                // Buat Order
                $order = Order::create([
                    'order_id'    => 'ORD-' . strtoupper(Str::random(10)),
                    'event_id'    => $event->id,
                    'user_id'     => $user->id,
                    'amount'      => 0,
                    'total_price' => 0,
                    'status'      => 'paid',
                    'paid_at'     => now(),
                ]);

                // Buat Order Item
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => 1,
                    'price'    => 0,
                ]);

                // Buat Tiket
                Ticket::create([
                    'participant_id' => $user->id,
                    'order_item_id'  => $orderItem->id,
                    'attendee_name'  => $user->name,
                    'attendee_email' => $user->email,
                    'ticket_code'    => strtoupper(Str::random(8)),
                    'qr_token'       => Str::uuid()->toString(),
                    'status'         => 'active',
                ]);
            });

            $this->command->info("Berhasil mendaftarkan {$user->name}.");
        }
    }
}
