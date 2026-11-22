<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBadge extends Model
{
    protected $table = 'lms_user_badges';

    protected $fillable = [
        'user_id',
        'completion_id',
        'badge_code',
        'name',
        'description',
        'icon',
        'awarded_at',
    ];

    protected $casts = [
        'awarded_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function completion(): BelongsTo
    {
        return $this->belongsTo(LearningCompletion::class, 'completion_id');
    }
}
