<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Speaker extends Model
{
    public $timestamps = false; // Migrasi tidak mencantumkan timestamps

    protected $fillable = [
        'event_session_id', // Jika ingin pakai One-to-Many langsung
        'name',
        'role',
        'bio',
        'linkedin',
        'expertise'
    ];

    // Relasi Many-to-Many ke Sessions
    public function sessions(): BelongsToMany
    {
        return $this->belongsToMany(EventSession::class, 'event_session_speakers', 'speaker_id', 'session_id');
    }
}
