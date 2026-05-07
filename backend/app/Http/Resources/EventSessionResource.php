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

            // Masukkan speakers di sini (bisa juga pakai Resource terpisah seperti SpeakerResource)
            'speakers' => $this->whenLoaded('speakers'),
        ];
        return parent::toArray($request);
    }
}
