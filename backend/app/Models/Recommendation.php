<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Recommendation extends Model
{
    use HasFactory;

    protected $table = 'recommendations';

    protected $fillable = [
        'user_id',
        'content_type',
        'content_id',
        'cbf_score',
        'cf_score',
        'score',
        'rank_position',
    ];

    protected $casts = [
        'cbf_score'     => 'decimal:6',
        'cf_score'      => 'decimal:6',
        'score'         => 'decimal:6',
        'rank_position' => 'integer',
        'content_id'    => 'integer',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    // Tipe konten yang dapat direkomendasikan oleh Hybrid Engine
    const CONTENT_TYPES = [
        'learning_path',
        'module',
        'lesson',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Resolve konten yang direkomendasikan secara dinamis berdasarkan content_type.
     * Gunakan: $recommendation->content
     */
    public function content()
    {
        return match ($this->content_type) {
            'learning_path' => $this->belongsTo(LearningPath::class, 'content_id'),
            'module'        => $this->belongsTo(Module::class, 'content_id'),
            'lesson'        => $this->belongsTo(Lesson::class, 'content_id'),
            default         => null,
        };
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    /**
     * Skor akhir dalam persentase (0-100).
     */
    public function getScorePercentAttribute(): float
    {
        return round((float) $this->score * 100, 2);
    }

    /**
     * Label content_type yang lebih ramah baca.
     */
    public function getContentTypeLabelAttribute(): string
    {
        return match ($this->content_type) {
            'learning_path' => 'Learning Path',
            'module'        => 'Module',
            'lesson'        => 'Lesson',
            default         => ucfirst(str_replace('_', ' ', $this->content_type)),
        };
    }
}

