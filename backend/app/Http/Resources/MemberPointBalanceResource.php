<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberPointBalanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'current_local_points' => (int) $this['current_local_points'],
            'current_global_points' => (int) $this['current_global_points'],
            'event_id' => $this['event_id'] ? (int) $this['event_id'] : null,
        ];
    }
}
