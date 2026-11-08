<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $table = 'enrollments';

    protected $fillable = [
        'user_id',
        'learning_path_id',
        'status',
        'enrolled_at',
        'completed_at',
        'last_accessed_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'learning_path_id');
    }

    public function forethoughts(): HasMany
    {
        return $this->hasMany(SrlForethought::class, 'enrollment_id');
    }

    public function reflections(): HasMany
    {
        return $this->hasMany(SrlReflection::class, 'enrollment_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LearningActivity::class, 'enrollment_id');
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    /**
     * Hitung total durasi belajar dalam detik dari semua aktivitas.
     */
    public function getTotalStudySecondsAttribute(): int
    {
        return $this->activities()->sum('duration_seconds') ?? 0;
    }

    /**
     * Apakah enrollment sudah selesai.
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }
}

