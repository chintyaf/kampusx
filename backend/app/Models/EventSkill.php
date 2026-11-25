<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSkill extends Model
{
    protected $fillable = [
        'event_id',
        'skill_id',
        'relevance_weight',
    ];

    protected $casts = [
        'relevance_weight' => 'float',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
