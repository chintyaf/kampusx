<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobSearchSkill extends Model
{
    protected $fillable = [
        'job_search_id',
        'skill_id',
        'importance_weight',
        'required_level',
        'is_mandatory',
    ];

    protected $casts = [
        'importance_weight' => 'float',
        'required_level'    => 'integer',
        'is_mandatory'      => 'boolean',
    ];

    public function jobSearch(): BelongsTo
    {
        return $this->belongsTo(JobSearch::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
