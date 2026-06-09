<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activities = [
            [
                'name' => 'Check-in Kehadiran',
                'slug' => 'check_in',
                'points_rewarded' => 50,
                'type' => 'local',
                'description' => 'Poin lokal untuk check-in kehadiran di event.',
                'is_active' => true,
            ],
            [
                'name' => 'Tanya Jawab (Ask Question)',
                'slug' => 'ask_question',
                'points_rewarded' => 10,
                'type' => 'local',
                'description' => 'Poin lokal untuk mengajukan pertanyaan di event.',
                'is_active' => true,
            ],
            [
                'name' => 'Kunjungan Booth (Booth Visit)',
                'slug' => 'booth_visit',
                'points_rewarded' => 15,
                'type' => 'local',
                'description' => 'Poin lokal untuk mengunjungi stan/booth.',
                'is_active' => true,
            ],
        ];

        foreach ($activities as $activity) {
            Activity::updateOrCreate(
                ['slug' => $activity['slug']],
                $activity
            );
        }
    }
}
