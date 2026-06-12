<?php

namespace App\Services;

use App\Models\Event;
use App\Models\User;
use App\Models\Ticket;
use App\Models\CertificateTemplate;
use App\Models\Survey;
use App\Notifications\OperationalNotification;
use Illuminate\Support\Facades\DB;

class CertificateNotificationHelper
{
    /**
     * Check if certificates are ready for the event and notify participants who attended.
     *
     * @param int $eventId
     * @param int|null $userId
     * @return void
     */
    public static function checkAndNotify($eventId, $userId = null)
    {
        $event = Event::find($eventId);
        if (!$event) {
            return;
        }

        // 1. Check if event is ended (status is completed or post_event)
        if (!in_array($event->status, ['completed', 'post_event'])) {
            return;
        }

        // 2. Check if certificate template exists
        $hasTemplate = CertificateTemplate::where('event_id', $eventId)->exists();
        if (!$hasTemplate) {
            return;
        }

        // 3. Check if active survey exists
        $hasSurvey = Survey::where('event_id', $eventId)->exists();
        if (!$hasSurvey) {
            return;
        }

        // 4. Find tickets of type 'used' (attended)
        $query = Ticket::whereHas('orderItem.order', function ($q) use ($eventId) {
            $q->where('event_id', $eventId);
        })->where('status', 'used');

        if ($userId) {
            $query->where('participant_id', $userId);
        }

        $tickets = $query->get();

        foreach ($tickets as $ticket) {
            $user = User::find($ticket->participant_id);
            if (!$user) {
                continue;
            }

            // Check if notification already sent to prevent duplicate notifications
            $notifExists = DB::table('notifications')
                ->where('notifiable_id', $user->id)
                ->where('notifiable_type', User::class)
                ->whereJsonContains('data->event_id', $event->id)
                ->whereJsonContains('data->type', 'certificate_available')
                ->exists();

            if (!$notifExists) {
                $user->notify(new OperationalNotification(
                    "Sertifikat Tersedia!",
                    "Sertifikat untuk event '{$event->title}' telah tersedia. Silakan isi survei evaluasi singkat untuk mengklaim sertifikat Anda.",
                    "certificate_available",
                    [
                        'event_id' => $event->id,
                        'ticket_code' => $ticket->ticket_code
                    ]
                ));
            }
        }
    }
}
