<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SrlReflection extends Model
{
    use HasFactory;

    protected $table = 'srl_reflections';

    protected $fillable = [
        'enrollment_id',
        'reflection_type',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Tipe refleksi yang tersedia
    const TYPES = [
        'general',    // Refleksi umum
        'module',     // Refleksi per modul
        'lesson',     // Refleksi per lesson
        'weekly',     // Refleksi mingguan
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    /**
     * Fase 3 SRL ini milik satu Enrollment.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }
}

