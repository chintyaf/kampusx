<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobMatching\UserSkillScore;
use Illuminate\Support\Facades\DB;

class UserSkillScoreService
{
    public function calculate(User $user): void
    {
        DB::transaction(function () use ($user) {

            // Ambil skill dari seluruh sertifikat yang diterbitkan.
            $certificates = $user->lmsUserCertificates()
                ->where('status', 'issued')
                ->with('learningPath.modules.lessons.skills')
                ->get();

            $skillData = [];

            foreach ($certificates as $certificate) {
                foreach ($certificate->learningPath->modules as $module) {
                    foreach ($module->lessons as $lesson) {
                        foreach ($lesson->skills as $skill) {

                            $id = $skill->id;

                            if (!isset($skillData[$id])) {
                                $skillData[$id] = [
                                    'lesson_ids' => [],
                                    'last_evidence_at' => null,
                                ];
                            }

                            $skillData[$id]['lesson_ids'][$lesson->id] = true;

                            if (
                                !$skillData[$id]['last_evidence_at'] ||
                                $certificate->issued_at > $skillData[$id]['last_evidence_at']
                            ) {
                                $skillData[$id]['last_evidence_at'] =
                                    $certificate->issued_at;
                            }
                        }
                    }
                }
            }

            // Simpan hasil perhitungan.
            foreach ($skillData as $skillId => $data) {
                UserSkillScore::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'skill_id' => $skillId,
                    ],
                    [
                        'score' => 1.00000,
                        'lesson_count' => count($data['lesson_ids']),
                        'quiz_avg' => null,
                        'event_count' => 0,
                        'last_evidence_at' => $data['last_evidence_at'],
                        'computed_at' => now(),
                    ]
                );
            }
        });
    }
}
