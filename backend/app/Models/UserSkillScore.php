<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkillScore extends Model
{
    protected $fillable = [
        'user_id',
        'skill_id',
        'proficiency_score',
        'proficiency_level',
        'lessons_completed',
        'quizzes_taken',
        'events_attended',
        'avg_quiz_score',
        'evidence',
        'model_version',
        'calculated_at',
    ];

    protected $casts = [
        'proficiency_score' => 'float',
        'proficiency_level' => 'integer',
        'lessons_completed' => 'integer',
        'quizzes_taken'     => 'integer',
        'events_attended'   => 'integer',
        'avg_quiz_score'    => 'float',
        'evidence'          => 'array',
        'calculated_at'     => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
