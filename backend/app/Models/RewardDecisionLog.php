<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RewardDecisionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'reward_id',
        'selected_arm',
        'algorithm',
        'context_used',
        'thompson_samples',
        'disco_constraints',
        'decision_reason',
        'allocation_status',
        'decided_at',
    ];

    protected $casts = [
        'context_used' => 'array',
        'thompson_samples' => 'array',
        'disco_constraints' => 'array',
        'decided_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(RewardCatalog::class, 'reward_id');
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(RewardFeedback::class, 'decision_log_id');
    }
}
