<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MicrolearningSeeder extends Seeder
{
    public function run(): void
    {
        $orgId = 3; // Organizer KampusX
        $userId = 2; // Participant KampusX

        // 1. Seed learning paths
        $path1Id = DB::table('learning_paths')->insertGetId([
            'organizer_id' => $orgId,
            'title' => 'Pengenalan Design Thinking untuk Pemula',
            'thumbnail' => 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80',
            'category' => 'Design',
            'description' => 'Belajar konsep dasar design thinking untuk memecahkan masalah kompleks.',
            'difficulty_level' => 'beginner',
            'points_reward' => 50,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $path2Id = DB::table('learning_paths')->insertGetId([
            'organizer_id' => $orgId,
            'title' => 'Teknik Presentasi yang Memukau Audiens',
            'thumbnail' => 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
            'category' => 'Speaking',
            'description' => 'Kuasai teknik berbicara di depan umum dan presentasi profesional.',
            'difficulty_level' => 'intermediate',
            'points_reward' => 75,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $path3Id = DB::table('learning_paths')->insertGetId([
            'organizer_id' => $orgId,
            'title' => 'Dasar-dasar Kepemimpinan Tim Efektif',
            'thumbnail' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
            'category' => 'Leadership',
            'description' => 'Panduan praktis memimpin tim kerja dan mencapai tujuan bersama.',
            'difficulty_level' => 'beginner',
            'points_reward' => 100,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $path4Id = DB::table('learning_paths')->insertGetId([
            'organizer_id' => $orgId,
            'title' => 'Deep Work: Fokus Tanpa Distraksi Digital',
            'thumbnail' => 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80',
            'category' => 'Productivity',
            'description' => 'Meningkatkan fokus dan produktivitas di tengah gempuran distraksi.',
            'difficulty_level' => 'beginner',
            'points_reward' => 40,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Seed modules
        $mod1Id = DB::table('modules')->insertGetId([
            'learning_path_id' => $path1Id,
            'title' => 'Dasar Design Thinking',
            'sequence_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $mod2Id = DB::table('modules')->insertGetId([
            'learning_path_id' => $path2Id,
            'title' => 'Persiapan Presentasi',
            'sequence_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $mod3Id = DB::table('modules')->insertGetId([
            'learning_path_id' => $path3Id,
            'title' => 'Komunikasi Pemimpin',
            'sequence_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $mod4Id = DB::table('modules')->insertGetId([
            'learning_path_id' => $path4Id,
            'title' => 'Membangun Kebiasaan Fokus',
            'sequence_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Seed lessons
        $lessons1 = [];
        for ($i = 1; $i <= 4; $i++) {
            $lessons1[] = DB::table('lessons')->insertGetId([
                'module_id' => $mod1Id,
                'title' => "Pelajaran Design Thinking $i",
                'sequence_order' => $i,
                'estimated_duration_minutes' => 3,
                'content_type' => 'article',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $lessons2 = [];
        for ($i = 1; $i <= 6; $i++) {
            $lessons2[] = DB::table('lessons')->insertGetId([
                'module_id' => $mod2Id,
                'title' => "Pelajaran Public Speaking $i",
                'sequence_order' => $i,
                'estimated_duration_minutes' => 3,
                'content_type' => $i === 3 ? 'video' : 'article',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $lessons3 = [];
        for ($i = 1; $i <= 5; $i++) {
            $lessons3[] = DB::table('lessons')->insertGetId([
                'module_id' => $mod3Id,
                'title' => "Pelajaran Leadership $i",
                'sequence_order' => $i,
                'estimated_duration_minutes' => 3,
                'content_type' => 'article',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $lessons4 = [];
        for ($i = 1; $i <= 3; $i++) {
            $lessons4[] = DB::table('lessons')->insertGetId([
                'module_id' => $mod4Id,
                'title' => "Pelajaran Productivity $i",
                'sequence_order' => $i,
                'estimated_duration_minutes' => 3,
                'content_type' => 'article',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Seed user progress (user_learning_paths)
        DB::table('user_learning_paths')->insert([
            'user_id' => $userId,
            'learning_path_id' => $path1Id,
            'status' => 'enrolled',
            'progress_percentage' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_learning_paths')->insert([
            'user_id' => $userId,
            'learning_path_id' => $path2Id,
            'status' => 'in_progress',
            'progress_percentage' => 60,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_learning_paths')->insert([
            'user_id' => $userId,
            'learning_path_id' => $path3Id,
            'status' => 'completed',
            'progress_percentage' => 100,
            'completed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_learning_paths')->insert([
            'user_id' => $userId,
            'learning_path_id' => $path4Id,
            'status' => 'enrolled',
            'progress_percentage' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Seed completions
        for ($i = 0; $i < 4; $i++) {
            DB::table('user_lesson_completions')->insert([
                'user_id' => $userId,
                'lesson_id' => $lessons2[$i],
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        for ($i = 0; $i < 5; $i++) {
            DB::table('user_lesson_completions')->insert([
                'user_id' => $userId,
                'lesson_id' => $lessons3[$i],
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
