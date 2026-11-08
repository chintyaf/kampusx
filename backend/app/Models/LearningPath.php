<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningPath extends Model
{
    use HasFactory;

    protected $table = 'learning_paths';

    protected $fillable = [
        'created_by',
        'event_id',
        'title',
        'description',
        'category',
        'categories',
        'thumbnail',
        'status',
    ];

    protected $casts = [
        'categories' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class, 'learning_path_id')->orderBy('order_index', 'asc');
    }

    public function lessons(): HasManyThrough
    {
        return $this->hasManyThrough(Lesson::class, Module::class, 'learning_path_id', 'module_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'learning_path_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments', 'learning_path_id', 'user_id')
            ->withPivot(['status', 'enrolled_at', 'completed_at', 'last_accessed_at'])
            ->withTimestamps();
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail) {
            return null;
        }

        if (str_starts_with($this->thumbnail, 'http://') || str_starts_with($this->thumbnail, 'https://')) {
            return $this->thumbnail;
        }

        return url('storage/' . ltrim($this->thumbnail, '/'));
    }
}

