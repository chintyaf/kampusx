<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LearningCompletion extends Model
{
    use HasFactory;

    protected $table = 'learning_completions';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'module_id',
        'learning_path_id',
        'score',
        'metadata',
        'completed_at',
    ];

    protected $casts = [
        'score'        => 'decimal:2',
        'metadata'     => 'array',
        'completed_at' => 'datetime',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

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

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'learning_path_id');
    }

    public function userBadges(): HasMany
    {
        return $this->hasMany(LmsUserBadge::class, 'completion_id');
    }

    public function userCertificate(): HasOne
    {
        return $this->hasOne(LmsUserCertificate::class, 'completion_id');
    }
}
