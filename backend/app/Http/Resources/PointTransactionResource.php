<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointTransactionResource extends JsonResource
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
            'amount' => $this->amount,
            'type' => $this->type,
            'description' => $this->description,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'event' => $this->event ? [
                'id' => $this->event->id,
                'title' => $this->event->title,
            ] : null,
            'reward' => $this->reward ? [
                'id' => $this->reward->id,
                'title' => $this->reward->title,
                'points_cost' => $this->reward->points_cost,
            ] : null,
        ];
    }
}
