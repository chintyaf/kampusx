<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LmsUserBadge extends Model
{
    use HasFactory;

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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function completion(): BelongsTo
    {
        return $this->belongsTo(LearningCompletion::class, 'completion_id');
    }
}
