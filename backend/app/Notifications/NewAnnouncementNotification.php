<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Event;
use App\Models\EventAnnouncement;

class NewAnnouncementNotification extends Notification
{
    use Queueable;

    protected $event;
    protected $announcement;

    /**
     * Create a new notification instance.
     */
    public function __construct(Event $event, EventAnnouncement $announcement)
    {
        $this->event = $event;
        $this->announcement = $announcement;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'event_id'        => $this->event->id,
            'event_title'     => $this->event->title,
            'announcement_id' => $this->announcement->id,
            'title'           => 'Pengumuman Baru: ' . $this->announcement->title,
            'message'         => 'Penyelenggara baru saja menerbitkan pengumuman baru untuk event "' . $this->event->title . '". Silakan periksa di tab Pengumuman Event.',
            'action_url'      => '/event-space/' . $this->event->id,
            'type'            => 'announcement'
        ];
    }
}
