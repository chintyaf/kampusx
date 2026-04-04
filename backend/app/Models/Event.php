<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_id',
        'institution_id',

        'title',
        'slug',
        'description',
        'image_path',

        'start_date',
        'end_date',
        'timezone',

        'status',

        'is_featured'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_featured' => 'boolean',
    ];

    // Penyelenggara individu (User)
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    // Institusi penyelenggara utama
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    // Lokasi (1-to-1)
    public function locationDetail(): HasOne
    {
        return $this->hasOne(EventLocation::class);
    }

    // Sesi/Agenda event
    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    // Daftar pembicara yang terdaftar di event ini
    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    // Institusi partner (Collaborators)
    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class, 'event_collaborators')
                    ->withPivot('role');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'event_categories');
    }

    public function eventTypes(): BelongsToMany
    {
        return $this->belongsToMany(EventType::class, 'event_types_event', 'event_id', 'event_types_id');
    }


}
