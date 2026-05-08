<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
    ];

    protected $casts = [
        'prerequisite_session_ids' => 'array', // Casting kolom JSON ke Array
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

}
