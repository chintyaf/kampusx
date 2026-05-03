<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EventStation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'name',
        'description',
        'is_active',   // Wajib didaftarkan
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relasi Many-to-Many ke EventSession melalui tabel pivot.
     */
    public function sessions(): BelongsToMany
    {
        return $this->belongsToMany(EventSession::class, 'event_session_station')
                    ->withTimestamps();
    }
}
