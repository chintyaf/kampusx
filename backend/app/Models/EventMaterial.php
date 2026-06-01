<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'session_name',
        'speaker_name',
        'title',
        'description',
        'type',
        'content_url',
        'file_path',
        'status'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
