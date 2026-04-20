<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'title',
        'type',
        'url',
        'description',
        'require_attendance'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
