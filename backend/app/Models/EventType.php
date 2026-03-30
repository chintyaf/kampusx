<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventType extends Model
{
    protected $table = 'event_types';

    protected $fillable = [
        'name',
    ];

    // many-to-many ke Event
    public function events()
    {
        return $this->belongsToMany(
            Event::class,
            'event_type_event', // pivot table
            'event_type_id',    // FK di pivot ke table ini
            'event_id'          // FK ke events
        );
    }
}
