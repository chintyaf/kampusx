<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadinessPrediction extends Model
{
    use HasFactory;

    protected $table = 'readiness_predictions';

    protected $fillable = [
        'user_id',
        'quiz_attempt_id',
        'model_version',
        'readiness_score',
        'readiness_level',
        'predicted_at',
    ];

    protected $casts = [
        'readiness_score' => 'decimal:5',
        'predicted_at'    => 'datetime',
        'created_at'      => 'datetime',
        'updated_at'      => 'datetime',
    ];

    // Level kesiapan belajar (output AI Random Forest)
    const LEVELS = [
        'belum_siap' => 'Belum Siap',
        'cukup_siap' => 'Cukup Siap',
        'siap'       => 'Siap',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function quizAttempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    /**
     * Konversi readiness_score (0-1) ke persentase (0-100).
     */
    public function getReadinessPercentAttribute(): float
    {
        return round((float) $this->readiness_score * 100, 1);
    }

    /**
     * Label level dalam Bahasa Indonesia.
     */
    public function getReadinessLabelAttribute(): string
    {
        return self::LEVELS[$this->readiness_level] ?? $this->readiness_level;
    }
}

