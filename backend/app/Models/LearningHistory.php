<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningHistory extends Model
{
    use HasFactory;

    protected $table = 'learning_histories';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'status',
        'progress',
        'duration_seconds',
        'started_at',
        'last_accessed_at',
        'completed_at',
    ];

    protected $casts = [
        'progress'         => 'decimal:2',
        'duration_seconds' => 'integer',
        'started_at'       => 'datetime',
        'last_accessed_at' => 'datetime',
        'completed_at'     => 'datetime',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    const STATUS_NOT_STARTED = 'not_started';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED   = 'completed';

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    public function getDurationMinutesAttribute(): int
    {
        return $this->duration_seconds ? (int) ceil($this->duration_seconds / 60) : 0;
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
