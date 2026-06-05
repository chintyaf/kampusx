<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class EventAnnouncementNotification extends Notification
{
    use Queueable;

    public $title;
    public $eventName;
    public $description;
    public $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $title, string $eventName, string $description, string $actionUrl = '/')
    {
        $this->title = $title;
        $this->eventName = $eventName;
        $this->description = $description;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengumuman Baru: ' . $this->title)
            ->greeting('Halo, ' . ($notifiable->name ?? 'User') . '!')
            ->line('Ada pengumuman baru untuk event "' . $this->eventName . '".')
            ->line('**' . $this->title . '**')
            ->line($this->description)
            ->action('Lihat Detail Event', url($this->actionUrl))
            ->line('Terima kasih telah menggunakan platform kami!');
    }

    /**
     * Get the WebPush representation of the notification.
     */
    public function toWebPush(object $notifiable, $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title('Pengumuman Baru: ' . $this->title)
            ->icon('/logo192.png')
            ->body('Event: ' . $this->eventName . "\n" . $this->description)
            ->action('Buka', 'open_action')
            ->data(['url' => $this->actionUrl]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pengumuman Baru: ' . $this->title,
            'event_name' => $this->eventName,
            'message' => $this->description,
            'action_url' => $this->actionUrl,
            'type' => 'announcement'
        ];
    }
}
