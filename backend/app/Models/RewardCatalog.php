<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RewardCatalog extends Model
{
    use HasFactory;

    protected $table = 'rewards_catalog';

    protected $fillable = [
        'code',
        'name',
        'description',
        'reward_type',
        'reward_value',
        'quota',
        'remaining_quota',
        'cost_budget',
        'is_active',
    ];

    protected $casts = [
        'reward_value' => 'float',
        'quota' => 'integer',
        'remaining_quota' => 'integer',
        'cost_budget' => 'float',
        'is_active' => 'boolean',
    ];

    public function decisionLogs(): HasMany
    {
        return $this->hasMany(RewardDecisionLog::class, 'reward_id');
    }
}
