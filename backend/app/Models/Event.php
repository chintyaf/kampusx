<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    protected $fillable = [
        'organizer_id',
        'slug',
        'title',
        'description',
        'location_type',
        'start_date',
        'end_date',
        'status'
    ];

    // Relasi ke User (Organizer)
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id', 'id');
    }

    // Relasi ke Sessions
    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    // Relasi Many-to-Many ke Category (lewat tabel event_categories)
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
                Category::class,
                'event_categories', // nama tabel pivot
                'event_id',         // foreign key di tabel pivot untuk Event
                'tag_id'            // foreign key di tabel pivot untuk Category
            );
    }

    public function locationDetail(): HasOne
    {
        return $this->hasOne(EventLocation::class, 'event_id');
    }
}
