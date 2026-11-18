<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonSkill extends Pivot
{
    protected $table = 'lesson_skills';

    // Aktifkan auto-increment ID agar bisa findOrFail($id) di controller
    public $incrementing = true;

    // Aktifkan timestamps (created_at / updated_at)
    public $timestamps = true;

    protected $fillable = [
        'lesson_id',
        'skill_id',
        'relevance_weight',
    ];

    protected $casts = [
        'relevance_weight' => 'decimal:2',
        'lesson_id'        => 'integer',
        'skill_id'         => 'integer',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class, 'skill_id');
    }
}
