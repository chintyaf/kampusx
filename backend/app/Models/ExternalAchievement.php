<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExternalAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_reference',
        'user_id',
        'achievement_type',
        'achievement_name',
        'description',
        'score',
        'points_awarded',
        'completed_at',
    ];

    protected $casts = [
        'score' => 'float',
        'points_awarded' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
