<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SrlForethought extends Model
{
    use HasFactory;

    protected $table = 'srl_forethoughts';

    protected $fillable = [
        'enrollment_id',
        'goal',
        'plan',
        'motivation',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    /**
     * Fase 1 SRL ini milik satu Enrollment.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }

    /**
     * Shortcut ke User melalui Enrollment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')
            ->through('enrollment');
    }
}

