<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class SrlLearningSession extends Model
{
    use HasFactory;

    protected $table = 'srl_learning_sessions';

    protected $fillable = [
        'enrollment_id',
        'user_id',
        'module_id',
        'lesson_id',
        'status',
        'current_phase',
        'goal',
        'motivation',
        'strategies',
        'estimated_minutes',
        'confidence_level',
        'started_at',
        'ended_at',
        'accumulated_seconds',
        'notes',
        'focus_level',
        'goal_achievement',
        'factors',
        'evaluation',
        'future_adjustment',
    ];

    protected $casts = [
        'strategies'          => 'array',
        'factors'             => 'array',
        'estimated_minutes'   => 'integer',
        'confidence_level'    => 'integer',
        'accumulated_seconds' => 'integer',
        'focus_level'         => 'integer',
        'started_at'          => 'datetime',
        'ended_at'            => 'datetime',
        'created_at'          => 'datetime',
        'updated_at'          => 'datetime',
    ];

    // Status siklus sesi
    const STATUS_PLANNED     = 'planned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED   = 'completed';
    const STATUS_ABANDONED   = 'abandoned';

    // Fase SRL sesuai 3 fase Zimmerman
    const PHASE_FORETHOUGHT = 'forethought';
    const PHASE_PERFORMANCE = 'performance';
    const PHASE_REFLECTION  = 'reflection';

    // Opsi capaian target
    const GOAL_ACHIEVED = 'tercapai';
    const GOAL_PARTIAL  = 'sebagian';
    const GOAL_UNMET    = 'belum';

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    // ----------------------------------------------------------------
    // Scopes
    // ----------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    /**
     * Durasi aktual dalam satuan menit (dibulatkan ke atas).
     */
    public function getDurationMinutesAttribute(): int
    {
        return $this->accumulated_seconds > 0
            ? (int) ceil($this->accumulated_seconds / 60)
            : 0;
    }

    /**
     * Target waktu belajar dalam satuan detik.
     */
    public function getTargetSecondsAttribute(): int
    {
        return ($this->estimated_minutes ?? 25) * 60;
    }

    /**
     * Cek apakah target waktu belajar telah tercapai/terlewati.
     */
    public function getIsTargetTimeReachedAttribute(): bool
    {
        return $this->accumulated_seconds >= $this->target_seconds;
    }

    /**
     * Cek apakah sesi saat ini sedang aktif berjalan.
     */
    public function getIsSessionActiveAttribute(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }
}
