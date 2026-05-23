<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OperationalNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;
    protected $type;
    protected $extraData;

    /**
     * Create a new notification instance.
     *
     * @param string $title
     * @param string $message
     * @param string $type
     * @param array $extraData
     */
    public function __construct($title, $message, $type, $extraData = [])
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->extraData = $extraData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return array_merge([
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
        ], $this->extraData);
    }
}
