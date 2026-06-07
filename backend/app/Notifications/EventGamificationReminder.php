<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventGamificationReminder extends Notification
{
    use Queueable;

    protected $points;

    /**
     * Create a new notification instance.
     */
    public function __construct(int $points)
    {
        $this->points = $points;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengingat Poin Global Belum Ditukarkan')
            ->line("Jangan lupa! Anda memiliki {$this->points} Global Point yang belum ditukar. Cek katalog reward kami sekarang sebelum kadaluarsa.")
            ->action('Kunjungi Katalog Reward', url('/rewards'))
            ->line('Terima kasih telah berpartisipasi dalam event kami!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'points' => $this->points,
            'title' => 'Pengingat Poin Global',
            'message' => "Jangan lupa! Anda memiliki {$this->points} Global Point yang belum ditukar. Cek katalog reward kami sekarang sebelum kadaluarsa.",
            'action_url' => '/rewards',
            'type' => 'global_points_reminder',
        ];
    }
}
