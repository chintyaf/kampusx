<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TalentProfile extends Model
{
    use HasFactory;

    protected $table = 'talent_profiles';

    protected $fillable = [
        'user_id',
        'headline',
        'campus',
        'major',
        'tier',
        'avatar_bg',
        'avatar_color',
        'bio',
        'wallet_address',
        'specialization',
        'modules_completed',
        'events_attended',
        'sbt_count',
        'is_public',
        'is_open_to_work',
    ];

    protected $casts = [
        'modules_completed' => 'integer',
        'events_attended'   => 'integer',
        'sbt_count'         => 'integer',
        'is_public'         => 'boolean',
        'is_open_to_work'   => 'boolean',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    /**
     * Relasi ke User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Talent Skills
     */
    public function skills(): HasMany
    {
        return $this->hasMany(TalentSkill::class, 'talent_profile_id');
    }

    /**
     * Relasi ke SBT Credentials
     */
    public function sbtCredentials(): HasMany
    {
        return $this->hasMany(SbtCredential::class, 'user_id', 'user_id');
    }

    /**
     * Latest SBT Credential
     */
    public function latestSbt(): HasOne
    {
        return $this->hasOne(SbtCredential::class, 'user_id', 'user_id')->latestOfMany('minted_at');
    }

    /**
     * Helper inisial nama
     */
    public function getInitialsAttribute(): string
    {
        $name = $this->user ? $this->user->name : 'KM';
        $words = preg_split('/\s+/', trim($name));
        $initials = '';
        foreach (array_slice($words, 0, 2) as $w) {
            $initials .= mb_substr($w, 0, 1);
        }
        return strtoupper($initials ?: 'KM');
    }
}
