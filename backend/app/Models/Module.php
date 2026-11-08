<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $table = 'modules';

    protected $fillable = [
        'learning_path_id',
        'title',
        'description',
        'learning_outcomes',
        'difficulty_level',
        'order_index',
        'status',
    ];

    protected $casts = [
        'learning_outcomes' => 'array',
        'order_index' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'learning_path_id');
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'module_id')->orderBy('order_index', 'asc');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'module_id');
    }
}

