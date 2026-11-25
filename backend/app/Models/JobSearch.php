<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobSearch extends Model
{
    protected $fillable = [
        'recruiter_name',
        'recruiter_email',
        'company_name',
        'access_token_hash',
        'event_id',
        'title',
        'description',
        'needed_count',
        'min_similarity',
        'status',
        'last_matched_at',
    ];

    protected $hidden = ['access_token_hash'];

    protected $casts = [
        'needed_count'    => 'integer',
        'min_similarity'  => 'float',
        'last_matched_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** Baris-baris vektor kebutuhan (skill + bobot). */
    public function searchSkills(): HasMany
    {
        return $this->hasMany(JobSearchSkill::class);
    }

    /** Akses langsung ke master skill beserta bobotnya. */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_search_skills')
            ->withPivot(['importance_weight', 'required_level', 'is_mandatory'])
            ->withTimestamps();
    }

    public function shortlists(): HasMany
    {
        return $this->hasMany(JobShortlist::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /** Cari pencarian berdasarkan token rahasia milik recruiter (guest). */
    public function scopeForToken(Builder $query, string $token): Builder
    {
        return $query->where('access_token_hash', hash('sha256', $token));
    }
}
