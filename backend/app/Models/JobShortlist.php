<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobShortlist extends Model
{
    protected $fillable = [
        'job_search_id',
        'user_id',
        'status',
        'contacted_at',
        'note',
        'cosine_similarity',
        'skill_coverage',
        'matched_skills',
        'missing_skills',
        'model_version',
        'snapshot_at',
    ];

    protected $casts = [
        'cosine_similarity' => 'float',
        'skill_coverage'    => 'float',
        'matched_skills'    => 'array',
        'missing_skills'    => 'array',
        'contacted_at'      => 'datetime',
        'snapshot_at'       => 'datetime',
    ];

    public function jobSearch(): BelongsTo
    {
        return $this->belongsTo(JobSearch::class);
    }

    /** Member yang di-shortlist. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
