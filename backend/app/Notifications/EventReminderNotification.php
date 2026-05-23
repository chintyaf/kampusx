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
        if ($this->type === 'H-24') $timeStr = 'Besok (H-1)';
        if ($this->type === 'H-1') $timeStr = '1 Jam lagi';
        if ($this->type === 'M-15') $timeStr = '15 Menit lagi';

        if ($this->role === 'organizer') {
            $msg = "Siap-siap! Acara '{$this->event->title}' yang Anda kelola akan berlangsung dalam $timeStr.";
        } else {
            if ($this->type === 'H-24') {
                $msg = "Pengingat H-1: Acara '{$this->event->title}' akan berlangsung besok. Silakan lakukan persiapan yang diperlukan!";
            } else {
                $location = $this->event->locationDetail;
                $linkStr = '';
                if ($location && $location->meeting_link && in_array($location->type, ['online', 'hybrid'])) {
                    $linkStr = " melalui tautan: {$location->meeting_link}";
                }
                $msg = "Penting! Acara '{$this->event->title}' akan segera dimulai dalam $timeStr. Segera bersiap dan masuk ke virtual event{$linkStr}!";
            }
        }

        return [
            'event_id' => $this->event->id,
            'title' => $this->type === 'H-24' ? 'Pengingat Acara (H-1)' : 'Notifikasi Mendesak Acara',
            'message' => $msg,
            'type' => $this->type,
        ];
    }
}
