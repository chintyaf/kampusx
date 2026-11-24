<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberJobProfile extends Model
{
    protected $fillable = [
        'user_id',
        'is_discoverable',
        'headline',
        'bio',
        'availability',
    ];

    protected $casts = [
        'is_discoverable' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Hanya member yang opt-in untuk dicari recruiter. */
    public function scopeDiscoverable(Builder $query): Builder
    {
        return $query->where('is_discoverable', true);
    }
}
