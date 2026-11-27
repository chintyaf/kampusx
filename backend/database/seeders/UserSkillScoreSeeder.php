<?php

namespace Database\Seeders;

use App\Models\JobMatching\UserSkillScore;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSkillScoreSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/user-skill/user_skill_scores.csv');

        if (!file_exists($path)) {
            $this->command->error("CSV file not found: {$path}");
            return;
        }

        $file = fopen($path, 'r');

        // Ambil header CSV.
        $headers = fgetcsv($file);

        while (($row = fgetcsv($file)) !== false) {
            $data = array_combine($headers, $row);

            UserSkillScore::updateOrCreate(
                [
                    'user_id' => $data['user_id'],
                    'skill_id' => $data['skill_id'],
                ],
                [
                    'score' => $data['score'],
                    'lesson_count' => $data['lesson_count'] ?? 0,
                    'quiz_avg' => $data['quiz_avg'] ?: null,
                    'event_count' => $data['event_count'] ?? 0,
                    'last_evidence_at' => $data['last_evidence_at'] ?: null,
                    'computed_at' => now(),
                ]
            );
        }

        fclose($file);

        $this->command->info('User skill scores seeded successfully.');
    }
}
