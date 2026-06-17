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
        $ongoingEventsCandidate = Event::where('status', 'published')
            ->where('is_ongoing_reminded', false)
            ->whereNotNull('start_date')
            ->get();

        $ongoingEvents = $ongoingEventsCandidate->filter(function ($event) use ($now) {
            $tzMap = [
                'WIB' => 'Asia/Jakarta',
                'WITA' => 'Asia/Makassar',
                'WIT' => 'Asia/Jayapura',
            ];
            $tz = $tzMap[$event->timezone] ?? $event->timezone ?? 'UTC';
            $eventNow = $now->copy()->setTimezone($tz);
            $eventStart = Carbon::parse($event->start_date->format('Y-m-d H:i:s'), $tz);
            return $eventNow->gte($eventStart);
        });

        foreach ($ongoingEvents as $event) {
            // Notify Organizer
            if ($event->organizer) {
                $event->organizer->notify(new EventReminderNotification($event, 'ONGOING', 'organizer'));
            }

            // Notify Participants
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
                    foreach ($users as $u) {
                        $u->notify(new EventReminderNotification($event, 'ONGOING', 'participant'));
                    }
                }
            }

            // Auto-create Event Announcement in Event Space
            \App\Models\EventAnnouncement::create([
                'event_id' => $event->id,
                'title' => 'Acara Telah Dimulai!',
                'content' => "Kabar gembira! Acara '{$event->title}' telah resmi dimulai saat ini. Selamat datang dan silakan ikuti seluruh jalannya acara serta sesi yang tersedia di Event Space. Selamat belajar!",
            ]);

            $event->update([
                'status' => 'ongoing',
                'is_ongoing_reminded' => true
            ]);
        }

        // 3. Acara Telah Selesai (Tepat saat end_date terlewati)
        $finishedEventsCandidate = Event::whereIn('status', ['published', 'ongoing', 'completed'])
            ->where('is_finished_reminded', false)
            ->whereNotNull('end_date')
            ->get();

        $finishedEvents = $finishedEventsCandidate->filter(function ($event) use ($now) {
            $tzMap = [
                'WIB' => 'Asia/Jakarta',
                'WITA' => 'Asia/Makassar',
                'WIT' => 'Asia/Jayapura',
            ];
            $tz = $tzMap[$event->timezone] ?? $event->timezone ?? 'UTC';
            $eventNow = $now->copy()->setTimezone($tz);
            $eventEnd = Carbon::parse($event->end_date->format('Y-m-d H:i:s'), $tz);
            return $eventNow->gte($eventEnd);
        });

        foreach ($finishedEvents as $event) {
            if ($event->organizer) {
                $hasCertificate = DB::table('certificate_templates')->where('event_id', $event->id)->exists();
                if (!$hasCertificate) {
                    $event->organizer->notify(new EventReminderNotification($event, 'FINISHED_NO_CERTIFICATE', 'organizer'));
                } else {
                    $event->organizer->notify(new EventReminderNotification($event, 'FINISHED', 'organizer'));
                }
            }
            $event->update([
                'status' => 'completed',
                'is_finished_reminded' => true
            ]);

            \App\Services\CertificateNotificationHelper::checkAndNotify($event->id);
        }

        // 4. Post-Event (Upload Materi & Sertifikat - H+1)
        $postEventsCandidate = Event::whereIn('status', ['published', 'ongoing', 'completed'])
            ->where('is_post_event_reminded', false)
            ->whereNotNull('end_date')
            ->get();

        $postEvents = $postEventsCandidate->filter(function ($event) use ($now) {
            $tzMap = [
                'WIB' => 'Asia/Jakarta',
                'WITA' => 'Asia/Makassar',
                'WIT' => 'Asia/Jayapura',
            ];
            $tz = $tzMap[$event->timezone] ?? $event->timezone ?? 'UTC';
            $eventNow = $now->copy()->setTimezone($tz);
            $eventEnd = Carbon::parse($event->end_date->format('Y-m-d H:i:s'), $tz);
            return $eventNow->gte($eventEnd->copy()->addHours(24));
        });

        foreach ($postEvents as $event) {
            if ($event->organizer) {
                $hasCertificate = DB::table('certificate_templates')->where('event_id', $event->id)->exists();
                if (!$hasCertificate) {
                    $event->organizer->notify(new EventReminderNotification($event, 'POST_EVENT_NO_CERTIFICATE', 'organizer'));
                } else {
                    $event->organizer->notify(new EventReminderNotification($event, 'POST_EVENT', 'organizer'));
                }
            }
            $event->update(['is_post_event_reminded' => true]);

            \App\Services\CertificateNotificationHelper::checkAndNotify($event->id);
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
