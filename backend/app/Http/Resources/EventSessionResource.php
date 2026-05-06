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
                'date' => $this->date,
                'day_number' => $this->day_number,
                'startTime' => $this->start_time,
                'endTime' => $this->end_time,

                'prerequisiteSessionIds' => $this->prerequisite_session_ids,
        ];
        return parent::toArray($request);
    }
}
