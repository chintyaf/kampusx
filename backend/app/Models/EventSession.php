<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventSession extends Model
{
    protected $fillable = [
        'event_id',
        'title',
        'description',
        'day_number',
        'date',
        'start_time',
        'end_time',
        'prerequisite_session_ids',
        'is_published',
        'no_speaker',
        'checkin_link',
        'checkin_expires_at',
    ];

    protected $casts = [
        'prerequisite_session_ids' => 'array', // Casting kolom JSON ke Array
        'is_published' => 'boolean',
        'no_speaker' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    // Relasi Many-to-Many ke Speaker (lewat tabel event_session_speakers)
    public function speakers(): BelongsToMany
    {
        return $this->belongsToMany(
            Speaker::class,
            'event_session_speakers',
            'session_id',
            'speaker_id'
        );
    }

    // Relasi One-to-Many ke SessionMaterial
    public function materials(): HasMany
    {
        return $this->hasMany(SessionMaterial::class, 'event_session_id')->orderBy('sort_order');
    }

}
