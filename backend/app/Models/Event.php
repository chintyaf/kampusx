<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;
    
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
        return $this->belongsToMany(Category::class, 'event_categories', 'event_id', 'tag_id');
    }
}
