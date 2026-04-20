<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EventReminderNotification extends Notification
{
    use Queueable;

    protected $event;
    protected $type;
    protected $role;

    public function __construct($event, $type, $role)
    {
        $this->event = $event;
        $this->type = $type;
        $this->role = $role;
    }

    public function via($notifiable)
    {
        return ['database']; // Can be configured to 'mail' later
    }

    public function toArray($notifiable)
    {
        $timeStr = '';
        if ($this->type === 'H-24') $timeStr = 'Besok (24 Jam lagi)';
        if ($this->type === 'H-1') $timeStr = '1 Jam lagi';
        if ($this->type === 'M-15') $timeStr = '15 Menit lagi';

        $msg = $this->role === 'organizer' 
            ? "Siap-siap! Acara '{$this->event->title}' yang Anda kelola akan berlangsung dalam $timeStr."
            : "Reminder: Acara '{$this->event->title}' akan segera dimulai dalam $timeStr. Bersiaplah!";

        return [
            'event_id' => $this->event->id,
            'title' => 'Pengingat Acara',
            'message' => $msg,
            'type' => $this->type,
        ];
    }
}
