<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventLocation extends Model
{
    use HasFactory;

    protected $table = 'event_locations';

    protected $fillable = [
        'event_id',
        'type',

        // Online
        'platform',
        'meeting_link',
        'online_instruction',

        // Offline
        'location',
        'location_detail',
        'maps_url',
        'offline_instruction',

        // Quota
        'online_quota',
        'offline_quota',
    ];


    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}

