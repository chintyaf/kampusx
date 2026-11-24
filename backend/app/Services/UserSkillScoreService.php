<?php

namespace App\Services;

use App\Models\UserSkillScore;
use Illuminate\Support\Facades\DB;

/**
 * Menghitung ulang vektor skill seorang member (user_skill_scores)
 * dari dua sumber:
 *   1. Pembelajaran : learning_completions (lesson selesai) x lesson_skills
 *   2. Kehadiran    : attendance_logs (hadir di event)      x event_skills
 *
 * raw   = bobot_lesson + (EVENT_FACTOR x bobot_event)
 * score = min(1, raw / SCORE_CAP)          -> 0..1
 * level = ceil(score x 5)                  -> 1..5
 */
class UserSkillScoreService
{
    private const MODEL_VERSION = 'v2-learning-event';
    private const EVENT_FACTOR  = 0.5; // hadir di event dihitung lebih ringan daripada menyelesaikan lesson
    private const SCORE_CAP     = 5.0; // raw sebesar ini = skor penuh (1.0)

    public function recalculate(int $userId): void
    {
        $learning = $this->learningSignals($userId); // [skill_id => {raw, cnt}]
        $events   = $this->eventSignals($userId);    // [skill_id => {raw, cnt}]

        $skillIds = $learning->keys()->merge($events->keys())->unique();

        foreach ($skillIds as $skillId) {
            $lRaw = (float) ($learning[$skillId]->raw ?? 0);
            $eRaw = (float) ($events[$skillId]->raw ?? 0);

            $raw   = $lRaw + self::EVENT_FACTOR * $eRaw;
            $score = min(1.0, $raw / self::SCORE_CAP);

            if ($score <= 0) {
                continue;
            }

            UserSkillScore::updateOrCreate(
                ['user_id' => $userId, 'skill_id' => $skillId],
                [
                    'proficiency_score' => round($score, 5),
                    'proficiency_level' => max(1, (int) ceil($score * 5)),
                    'lessons_completed' => (int) ($learning[$skillId]->cnt ?? 0),
                    'events_attended'   => (int) ($events[$skillId]->cnt ?? 0),
                    'model_version'     => self::MODEL_VERSION,
                    'calculated_at'     => now(),
                ]
            );
        }
    }

    /** Sinyal dari lesson yang sudah diselesaikan. */
    private function learningSignals(int $userId)
    {
        return DB::table('learning_completions as lc')
            ->join('lesson_skills as ls', 'ls.lesson_id', '=', 'lc.lesson_id')
            ->where('lc.user_id', $userId)
            ->whereNotNull('lc.lesson_id')
            ->groupBy('ls.skill_id')
            ->selectRaw('ls.skill_id, SUM(ls.relevance_weight) as raw, COUNT(DISTINCT lc.lesson_id) as cnt')
            ->get()
            ->keyBy('skill_id');
    }

    /** Sinyal dari event yang benar-benar dihadiri (ada catatan di attendance_logs). */
    private function eventSignals(int $userId)
    {
        $eventIds = DB::table('attendance_logs as al')
            ->join('tickets as t', 't.id', '=', 'al.ticket_id')
            ->whereRaw('COALESCE(al.user_id, t.participant_id) = ?', [$userId])
            ->distinct()
            ->pluck('al.event_id');

        if ($eventIds->isEmpty()) {
            return collect();
        }

        return DB::table('event_skills')
            ->whereIn('event_id', $eventIds)
            ->groupBy('skill_id')
            ->selectRaw('skill_id, SUM(relevance_weight) as raw, COUNT(DISTINCT event_id) as cnt')
            ->get()
            ->keyBy('skill_id');
    }
}
