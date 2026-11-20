<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardFeedback extends Model
{
    use HasFactory;

    protected $table = 'reward_feedbacks';

    protected $fillable = [
        'decision_log_id',
        'user_id',
        'action',
        'is_converted',
        'feedback_at',
    ];

    protected $casts = [
        'is_converted' => 'boolean',
        'feedback_at' => 'datetime',
    ];

    public function decisionLog(): BelongsTo
    {
        return $this->belongsTo(RewardDecisionLog::class, 'decision_log_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
