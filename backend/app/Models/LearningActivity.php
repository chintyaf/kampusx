<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LearningActivity extends Model
{
    use HasFactory;

    protected $table = 'learning_activities';

    protected $fillable = [
        'user_id',
        'enrollment_id',
        'module_id',
        'lesson_id',
        'activity_type',
        'target_type',
        'target_id',
        'metadata',
        'occurred_at',
        'start_time',
        'end_time',
        'duration_seconds',
        'progress',
        'completed_at',
    ];

    protected $casts = [
        'metadata'         => 'array',
        'occurred_at'      => 'datetime',
        'start_time'       => 'datetime',
        'end_time'         => 'datetime',
        'completed_at'     => 'datetime',
        'duration_seconds' => 'integer',
        'progress'         => 'decimal:2',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    /**
     * Hitung durasi belajar dalam menit (rounded).
     */
    public function getDurationMinutesAttribute(): int
    {
        return $this->duration_seconds ? (int) ceil($this->duration_seconds / 60) : 0;
    }
}
