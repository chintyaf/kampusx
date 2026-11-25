<?php

namespace App\Services;

use App\Models\LearningActivity;

class ActivityLogger
{
    public const TYPES = [
        'module_view', 'lesson_view', 'lesson_complete',
        'quiz_start', 'quiz_submit', 'remediation',
        'srl_goal_set', 'srl_reflection',
    ];

    public static function log(int $userId, string $type, array $opts = []): LearningActivity
    {
        return LearningActivity::create([
            'user_id'          => $userId,
            'activity_type'    => $type,
            'module_id'        => $opts['module_id'] ?? null,
            'target_type'      => $opts['target_type'] ?? null,   // 'lesson' | 'module' | 'quiz'
            'target_id'        => $opts['target_id'] ?? null,
            'duration_seconds' => $opts['duration'] ?? 0,
            'metadata'         => $opts['metadata'] ?? null,
            'occurred_at'      => $opts['occurred_at'] ?? now(),
        ]);
    }
}
