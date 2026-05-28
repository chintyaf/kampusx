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

        // Cari Event H-24 (H-1 Hari sebelum acara)
        $h24Events = Event::where('status', 'published')
            ->where('is_h24_sent', false)
            ->whereNotNull('start_date')
            ->where('start_date', '<=', $now->copy()->addHours(24))
            ->where('start_date', '>', $now)
            ->get();

        foreach ($h24Events as $event) {
            $this->notifyEvent($event, 'H-24');
            $event->update(['is_h24_sent' => true]);
        }

        // Cari Event H-1 (1 Jam sebelum acara)
        $h1Events = Event::where('status', 'published')
            ->where('is_h1_sent', false)
            ->whereNotNull('start_date')
            ->where('start_date', '<=', $now->copy()->addHours(1))
            ->where('start_date', '>', $now)
            ->get();

        foreach ($h1Events as $event) {
            $this->notifyEvent($event, 'H-1');
            $event->update(['is_h1_sent' => true]);
        }

        // Cari Event M-15 (15 Menit sebelum acara)
        $m15Events = Event::where('status', 'published')
            ->where('is_m15_sent', false)
            ->whereNotNull('start_date')
            ->where('start_date', '<=', $now->copy()->addMinutes(15))
            ->where('start_date', '>', $now)
            ->get();

        foreach ($m15Events as $event) {
            $this->notifyEvent($event, 'M-15');
            $event->update(['is_m15_sent' => true]);
        }

        // ==========================================
        // TAMBAHAN: REMINDER ORGANIZER KHUSUS
        // ==========================================

        // 1. Missing Info (Draft, H-3 dari start_date)
        $missingInfoEvents = Event::where('status', '!=', 'published')
            ->where('is_missing_info_reminded', false)
            ->whereNotNull('start_date')
            ->where('start_date', '<=', $now->copy()->addDays(3))
            ->where('start_date', '>', $now)
            ->get();

        foreach ($missingInfoEvents as $event) {
            // Hanya kirim ke organizer
            if ($event->organizer) {
                $event->organizer->notify(new EventReminderNotification($event, 'MISSING_INFO', 'organizer'));
            }
            $event->update(['is_missing_info_reminded' => true]);
        }

        // 2. Acara Sedang Berjalan (Tepat saat start_date terlewati)
        $ongoingEvents = Event::where('status', 'published')
            ->where('is_ongoing_reminded', false)
            ->whereNotNull('start_date')
            ->where('start_date', '<=', $now)
            ->get();

        foreach ($ongoingEvents as $event) {
            if ($event->organizer) {
                $event->organizer->notify(new EventReminderNotification($event, 'ONGOING', 'organizer'));
            }
            $event->update(['is_ongoing_reminded' => true]);
        }

        // 3. Acara Telah Selesai (Tepat saat end_date terlewati)
        $finishedEvents = Event::whereIn('status', ['published', 'ongoing', 'completed'])
            ->where('is_finished_reminded', false)
            ->whereNotNull('end_date')
            ->where('end_date', '<=', $now)
            ->get();

        foreach ($finishedEvents as $event) {
            if ($event->organizer) {
                $event->organizer->notify(new EventReminderNotification($event, 'FINISHED', 'organizer'));
            }
            $event->update(['is_finished_reminded' => true]);
        }

        // 4. Post-Event (Upload Materi & Sertifikat - H+1)
        $postEvents = Event::whereIn('status', ['published', 'ongoing', 'completed'])
            ->where('is_post_event_reminded', false)
            ->whereNotNull('end_date')
            ->where('end_date', '<=', $now->copy()->subHours(24))
            ->get();

        foreach ($postEvents as $event) {
            if ($event->organizer) {
                $event->organizer->notify(new EventReminderNotification($event, 'POST_EVENT', 'organizer'));
            }
            $event->update(['is_post_event_reminded' => true]);
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
