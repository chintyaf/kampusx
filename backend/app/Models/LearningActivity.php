<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningActivity extends Model
{
    use HasFactory;

    protected $table = 'learning_activities';

    protected $fillable = [
        'enrollment_id',
        'module_id',
        'lesson_id',
        'activity_type',
        'start_time',
        'end_time',
        'duration_seconds',
        'progress',
        'completed_at',
    ];

    protected $casts = [
        'start_time'       => 'datetime',
        'end_time'         => 'datetime',
        'completed_at'     => 'datetime',
        'duration_seconds' => 'integer',
        'progress'         => 'decimal:2',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    // Jenis aktivitas yang bisa dicatat (Fase 2 SRL: Performance Phase)
    const TYPES = [
        'view_lesson',      // Mulai membuka lesson
        'complete_lesson',  // Menyelesaikan lesson
        'quiz_start',       // Mulai kuis
        'quiz_submit',      // Mengumpulkan jawaban kuis
        'module_start',     // Mulai modul
        'module_complete',  // Menyelesaikan modul
        'path_enroll',      // Mendaftar ke learning path
        'path_complete',    // Menyelesaikan learning path
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    // ----------------------------------------------------------------
    // Accessors
    // ----------------------------------------------------------------

    /**
     * Hitung durasi belajar dalam menit (rounded).
     */
    public function getDurationMinutesAttribute(): int
    {
        return $this->duration_seconds ? (int) ceil($this->duration_seconds / 60) : 0;
    }

    /**
     * Apakah aktivitas ini sudah selesai.
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->completed_at !== null;
    }
}

