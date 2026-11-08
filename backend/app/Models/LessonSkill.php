<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class LessonSkill extends Pivot
{
    protected $table = 'lesson_skills';

    protected $fillable = [
        'lesson_id',
        'skill_id',
        'relevance_weight',
    ];

    protected $casts = [
        'relevance_weight' => 'decimal:2',
    ];
}

