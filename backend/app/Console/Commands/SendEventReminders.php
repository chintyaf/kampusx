<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use Illuminate\Support\Carbon;
use App\Notifications\EventReminderNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SendEventReminders extends Command
{
    protected $signature = 'app:send-event-reminders';
    protected $description = 'Send automated reminders for upcoming events';

    public function handle()
    {
        $now = Carbon::now();

        // Cari Event H-24
        $h24Events = Event::where('status', 'published')
            ->where('is_h24_sent', false)
            ->whereNotNull('start_date')
            ->whereBetween('start_date', [$now->copy()->addHours(23)->addMinutes(50), $now->copy()->addHours(24)->addMinutes(10)])
            ->get();

        foreach ($h24Events as $event) {
            $this->notifyEvent($event, 'H-24');
            $event->update(['is_h24_sent' => true]);
        }

        // Cari Event H-1
        $h1Events = Event::where('status', 'published')
            ->where('is_h1_sent', false)
            ->whereNotNull('start_date')
            ->whereBetween('start_date', [$now->copy()->addMinutes(50), $now->copy()->addHours(1)->addMinutes(10)])
            ->get();

        foreach ($h1Events as $event) {
            $this->notifyEvent($event, 'H-1');
            $event->update(['is_h1_sent' => true]);
        }

        // Cari Event M-15
        $m15Events = Event::where('status', 'published')
            ->where('is_m15_sent', false)
            ->whereNotNull('start_date')
            ->whereBetween('start_date', [$now->copy()->addMinutes(5), $now->copy()->addMinutes(15)])
            ->get();

        foreach ($m15Events as $event) {
            $this->notifyEvent($event, 'M-15');
            $event->update(['is_m15_sent' => true]);
        }
        
        $this->info("Event reminders processed successfully.");
    }

    private function notifyEvent($event, $type)
    {
        if ($event->organizer) {
            $event->organizer->notify(new EventReminderNotification($event, $type, 'organizer'));
        }

        $participantIds = DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $event->id)
            ->where('tickets.status', '!=', 'cancelled')
            ->pluck('tickets.participant_id')
            ->unique();
        
        if ($participantIds->isNotEmpty()) {
            foreach (array_chunk($participantIds->toArray(), 100) as $chunk) {
                $users = User::whereIn('id', $chunk)->get();
                foreach($users as $u) {
                    $u->notify(new EventReminderNotification($event, $type, 'participant'));
                }
            }
        }
    }
}
