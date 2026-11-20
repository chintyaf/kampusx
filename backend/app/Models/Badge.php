<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'criteria',
        'icon',
        'points_requirement',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'points_requirement' => 'integer',
    ];

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_badges', 'badge_id', 'user_id')
                    ->withPivot('unlocked_at')
                    ->withTimestamps();
    }
}
