<?php

namespace App\Models;

use App\Models\User;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkillScore extends Model
{
    protected $table = 'user_skill_scores';

    protected $fillable = [
        'user_id',
        'skill_id',
        'score',
        'lesson_count',
        'quiz_avg',
        'event_count',
        'last_evidence_at',
        'computed_at',
    ];

    protected $casts = [
        'score' => 'decimal:5',
        'lesson_count' => 'integer',
        'quiz_avg' => 'decimal:2',
        'event_count' => 'integer',
        'last_evidence_at' => 'datetime',
        'computed_at' => 'datetime',
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
