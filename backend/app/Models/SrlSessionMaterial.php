<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SrlSessionMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'srl_learning_session_id',
        'target_type',
        'target_id',
        'activity_type',
        'duration_seconds',
        'is_completed',
        'started_at',
        'ended_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'is_completed' => 'boolean',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    // --- Relationships ---

    public function session(): BelongsTo
    {
        return $this->belongsTo(SrlLearningSession::class, 'srl_learning_session_id');
    }

    /**
     * Mengambil model materi terkait (Lesson, Module, Quiz, dll.)
     */
    public function target(): MorphTo
    {
        return $this->morphTo();
    }
}
