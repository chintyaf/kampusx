<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Skill extends Model
{
    use HasFactory;

    protected $table = 'skills';

    protected $fillable = [
        'name',
        'description',
        'category',
    ];

    public function lessons(): BelongsToMany
    {
        return $this->belongsToMany(Lesson::class, 'lesson_skills', 'skill_id', 'lesson_id')
            ->withPivot('relevance_weight')
            ->withTimestamps();
    }

    public function userSkillScores(): HasMany
    {
        return $this->hasMany(UserSkillScore::class, 'skill_id');
    }
}

