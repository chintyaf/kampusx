<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $table = 'quiz_attempts';

    protected $fillable = [
        'user_id',
        'quiz_id',
        'attempt_number',
        'score',
        'started_at',
        'completed_at',
        'status',
    ];

    protected $casts = [
        'score'          => 'decimal:2',
        'attempt_number' => 'integer',
        'started_at'     => 'datetime',
        'completed_at'   => 'datetime',
        'created_at'     => 'datetime',
        'updated_at'     => 'datetime',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class, 'attempt_id');
    }

    public function readinessPrediction(): HasOne
    {
        return $this->hasOne(ReadinessPrediction::class, 'quiz_attempt_id');
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    public function getIsPastAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getPassedAttribute(): bool
    {
        $passingScore = $this->quiz?->passing_score ?? 70.00;
        return (float) $this->score >= (float) $passingScore;
    }
}

