<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SrlLearningSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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

    protected function casts(): array
    {
        return [
            'strategies' => 'array',
            'factors' => 'array',
            'estimated_minutes' => 'integer',
            'confidence_level' => 'integer',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'accumulated_seconds' => 'integer',
            'focus_level' => 'integer',
        ];
    }

    // --- Relationships ---

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(SrlSessionMaterial::class, 'srl_learning_session_id');
    }

    // --- Query Scopes ---

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeOngoing(Builder $query): Builder
    {
        return $query->whereIn('status', ['planned', 'in_progress']);
    }

    // --- Helper untuk Mencatat Materi yang Dipelajari ---

    public function trackMaterial(
        Model $target,
        string $activityType = 'viewed',
        int $additionalSeconds = 0,
        bool $isCompleted = false,
        array $metadata = []
    ): SrlSessionMaterial {
        $material = $this->materials()->firstOrNew([
            'target_type' => $target->getMorphClass(),
            'target_id' => $target->getKey(),
        ]);

        if (! $material->exists) {
            $material->started_at = now();
            $material->duration_seconds = 0;
        }

        $material->activity_type = $activityType;
        $material->duration_seconds += max(0, $additionalSeconds);
        $material->is_completed = $material->is_completed || $isCompleted;
        $material->ended_at = now();

        if (! empty($metadata)) {
            $material->metadata = array_merge($material->metadata ?? [], $metadata);
        }

        $material->save();

        return $material;
    }
}
