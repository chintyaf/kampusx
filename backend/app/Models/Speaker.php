<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Speaker extends Model
{
    public $timestamps = false; // Migrasi tidak mencantumkan timestamps

    protected $fillable = [
        'event_id', // Jika ingin pakai One-to-Many langsung
        'name',
        'role',
        'bio',
        'social_link',
        'expertise'
    ];

    protected $casts = [
        'expertise' => 'array',
        'social_link' => 'array',
    ];

    // Relasi Many-to-Many ke Sessions
    public function sessions(): BelongsToMany
    {
        return $this->belongsToMany(
                EventSession::class,        // Model Target
                'event_session_speakers',   // Nama tabel Pivot
                'speaker_id',               // Foreign key di pivot untuk model ini
                'session_id'                // Foreign key di pivot untuk target
        );
    }

    /**
     * Relasi One-to-Many ke session utama (opsional)
     * Berdasarkan kolom 'event_session_id' yang ada langsung di tabel speakers
     */
    public function primarySession()
    {
        return $this->belongsTo(EventSession::class, 'event_session_id');
    }
}
