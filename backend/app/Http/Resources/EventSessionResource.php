<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'dayNumber' => $this->day_number,
            'date' => $this->date,
            'startTime' => $this->start_time,
            'endTime' => $this->end_time,
            'prerequisite_session_ids' => $this->prerequisite_session_ids,
            'checkin_link' => $this->checkin_link,
            'checkin_expires_at' => $this->checkin_expires_at,
            'checkout_link' => $this->checkout_link,
            'checkout_expires_at' => $this->checkout_expires_at,
            'no_speaker' => $this->no_speaker,

            // Masukkan speakers di sini (bisa juga pakai Resource terpisah seperti SpeakerResource)
            'speakers' => $this->whenLoaded('speakers'),
        ];
    }
}
