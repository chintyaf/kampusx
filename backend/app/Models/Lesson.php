<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;

    protected $table = 'lessons';

    protected $fillable = [
        'module_id',
        'title',
        'type',
        'content',
        'summary',
        'order_index',
        'duration_minutes',
        'xp',
        'video_url',
        'attachments',
        'status',
    ];

    protected $casts = [
        'attachments' => 'array',
        'order_index' => 'integer',
        'duration_minutes' => 'integer',
        'xp' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'lesson_skills', 'lesson_id', 'skill_id')
            ->withPivot('relevance_weight')
            ->withTimestamps();
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'lesson_id');
    }
}

