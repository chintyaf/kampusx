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
            if ($this->type === 'MISSING_INFO') {
                $title = 'Pengingat: Lengkapi Info Acara';
                $msg = "Acara '{$this->event->title}' tinggal 3 hari lagi tapi belum dipublikasikan! Segera lengkapi informasi yang kurang.";
            } elseif ($this->type === 'ONGOING') {
                $title = 'Acara Dimulai!';
                $msg = "Acara '{$this->event->title}' sedang berlangsung saat ini. Selamat bertugas!";
            } elseif ($this->type === 'FINISHED') {
                $title = 'Acara Selesai';
                $msg = "Acara '{$this->event->title}' telah selesai. Terima kasih atas kerja keras Anda!";
            } elseif ($this->type === 'POST_EVENT') {
                $title = 'Tugas Pasca-Acara';
                $msg = "Acara '{$this->event->title}' sudah berakhir. Jangan lupa untuk mengunggah materi presentasi atau membagikan sertifikat kepada peserta jika ada.";
            } else {
                $title = $this->type === 'H-24' ? 'Pengingat Acara (H-1)' : 'Notifikasi Acara';
                $msg = "Siap-siap! Acara '{$this->event->title}' yang Anda kelola akan berlangsung dalam $timeStr.";
            }
        } else {
            $title = $this->type === 'H-24' ? 'Pengingat Acara (H-1)' : 'Notifikasi Mendesak Acara';
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
            'title' => $title,
            'message' => $msg,
            'type' => $this->type,
        ];
    }
}
