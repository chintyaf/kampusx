<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class LMSSeeder extends Seeder
{
    public function run(): void
    {
        $basePath = database_path('seeders/data/lms');

        DB::transaction(function () use ($basePath) {
            $now = Carbon::now();

            // 1. Seed Users (jika users.csv ada & dibutuhkan oleh created_by pada learning_paths)
            if (file_exists("{$basePath}/users.csv")) {
                $this->seedUsers("{$basePath}/users.csv", $now);
            }

            // 2. Seed Skills
            $this->seedSkills("{$basePath}/skills_seed.csv", $now);

            // 3. Seed Learning Paths
            $this->seedLearningPaths("{$basePath}/learning_paths.csv", $now);

            // 4. Seed Modules
            $this->seedModules("{$basePath}/modules.csv", $now);

            // 5. Seed Lessons
            $this->seedLessons("{$basePath}/lessons.csv", $now);

            // 6. Seed Lesson Skills (Pivot)
            $this->seedLessonSkills("{$basePath}/lesson_skills.csv", $now);

            // 7. Seed Quizzes
            $this->seedQuizzes("{$basePath}/quizzes.csv", $now);

            // 8. Seed Quiz Questions
            $this->seedQuizQuestions("{$basePath}/quiz_questions.csv", $now);

            // 9. Seed Question Options
            $this->seedQuestionOptions("{$basePath}/question_options.csv", $now);
        });
    }

    private function seedUsers(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'name' => $row['name'] ?? 'User',
                'email' => $row['email'],
                'password' => isset($row['password']) && !str_starts_with($row['password'], '$2y$')
                    ? Hash::make($row['password'])
                    : ($row['password'] ?? Hash::make('password')),
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
                DB::table('users')->updateOrInsert(['id' => $data['id']], $data);
            } else {
                DB::table('users')->updateOrInsert(['email' => $data['email']], $data);
            }
        }
    }

    private function seedSkills(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'name' => $row['name'],
                'description' => $row['description'] ?? null,
                'category' => $row['category'] ?? null,
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
                DB::table('skills')->updateOrInsert(['id' => $data['id']], $data);
            } else {
                DB::table('skills')->updateOrInsert(['name' => $data['name']], $data);
            }
        }
    }

    private function seedLearningPaths(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);
        $fallbackUserId = DB::table('users')->value('id');

        foreach ($rows as $row) {
            $status = $row['status'] ?? 'draft';
            $publishedAt = $row['published_at'] ?? ($status === 'published' ? $now : null);

            $data = [
                'created_by' => !empty($row['created_by']) ? (int) $row['created_by'] : $fallbackUserId,
                'event_id' => !empty($row['event_id']) ? (int) $row['event_id'] : null,
                'title' => $row['title'],
                'slug' => $row['slug'] ?? Str::slug($row['title']),
                'description' => $row['description'] ?? null,
                'category' => $row['category'] ?? null,
                'categories' => $this->normalizeJson($row['categories'] ?? null),
                'thumbnail' => $row['thumbnail'] ?? null,
                'status' => $status,
                'published_at' => $publishedAt,
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
                DB::table('learning_paths')->updateOrInsert(['id' => $data['id']], $data);
            } else {
                DB::table('learning_paths')->updateOrInsert(['slug' => $data['slug']], $data);
            }
        }
    }

    private function seedModules(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'learning_path_id' => (int) $row['learning_path_id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? null,
                'learning_outcomes' => $this->normalizeJson($row['learning_outcomes'] ?? null),
                'difficulty_level' => $row['difficulty_level'] ?? 'beginner',
                'order_index' => isset($row['order_index']) ? (int) $row['order_index'] : 1,
                'status' => $row['status'] ?? 'draft',
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
                DB::table('modules')->updateOrInsert(['id' => $data['id']], $data);
            } else {
                DB::table('modules')->updateOrInsert(
                    [
                        'learning_path_id' => $data['learning_path_id'],
                        'title' => $data['title'],
                    ],
                    $data
                );
            }
        }
    }

    private function seedLessons(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'module_id' => (int) $row['module_id'],
                'title' => $row['title'],
                'type' => $row['type'] ?? 'article',
                'content' => $row['content'] ?? null,
                'summary' => $row['summary'] ?? null,
                'order_index' => isset($row['order_index']) ? (int) $row['order_index'] : 1,
                'duration_minutes' => isset($row['duration_minutes']) ? (int) $row['duration_minutes'] : 0,
                'xp' => isset($row['xp']) ? (int) $row['xp'] : 0,
                'video_url' => $row['video_url'] ?? null,
                'attachments' => $this->normalizeJson($row['attachments'] ?? null),
                'status' => $row['status'] ?? 'published',
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
                DB::table('lessons')->updateOrInsert(['id' => $data['id']], $data);
            } else {
                DB::table('lessons')->updateOrInsert(
                    [
                        'module_id' => $data['module_id'],
                        'title' => $data['title'],
                    ],
                    $data
                );
            }
        }
    }

    private function seedLessonSkills(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            // Mendukung pencarian skill berdasarkan skill_id atau skill_name
            $skillId = !empty($row['skill_id'])
                ? (int) $row['skill_id']
                : DB::table('skills')->where('name', $row['skill_name'] ?? '')->value('id');

            if (!$skillId) {
                continue;
            }

            $lessonId = (int) $row['lesson_id'];

            DB::table('lesson_skills')->updateOrInsert(
                [
                    'lesson_id' => $lessonId,
                    'skill_id' => $skillId,
                ],
                [
                    'relevance_weight' => isset($row['relevance_weight']) ? (float) $row['relevance_weight'] : 1.00,
                    'created_at' => $row['created_at'] ?? $now,
                    'updated_at' => $row['updated_at'] ?? $now,
                ]
            );
        }
    }

    private function seedQuizzes(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'module_id' => (int) $row['module_id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? null,
                'bloom_level' => $row['bloom_level'] ?? null,
                'time_limit_minutes' => isset($row['time_limit_minutes']) ? (int) $row['time_limit_minutes'] : null,
                'passing_score' => isset($row['passing_score']) ? (float) $row['passing_score'] : 70.00,
                'is_published' => $this->toBoolean($row['is_published'] ?? false),
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
            }

            // Unique constraint pada module_id
            DB::table('quizzes')->updateOrInsert(
                ['module_id' => $data['module_id']],
                $data
            );
        }
    }

    private function seedQuizQuestions(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'quiz_id' => (int) $row['quiz_id'],
                'question_text' => $row['question_text'],
                'bloom_level' => $row['bloom_level'] ?? null,
                'explanation' => $row['explanation'] ?? null,
                'order_index' => isset($row['order_index']) ? (int) $row['order_index'] : 1,
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
            }

            // Unique constraint pada ['quiz_id', 'order_index']
            DB::table('quiz_questions')->updateOrInsert(
                [
                    'quiz_id' => $data['quiz_id'],
                    'order_index' => $data['order_index'],
                ],
                $data
            );
        }
    }

    private function seedQuestionOptions(string $filePath, Carbon $now): void
    {
        $rows = $this->readCsv($filePath);

        foreach ($rows as $row) {
            $data = [
                'question_id' => (int) $row['question_id'],
                'option_label' => strtoupper(trim($row['option_label'])),
                'option_text' => $row['option_text'],
                'is_correct' => $this->toBoolean($row['is_correct'] ?? false),
                'order_index' => isset($row['order_index']) ? (int) $row['order_index'] : 1,
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];

            if (!empty($row['id'])) {
                $data['id'] = (int) $row['id'];
            }

            // Unique constraint pada ['question_id', 'option_label']
            DB::table('question_options')->updateOrInsert(
                [
                    'question_id' => $data['question_id'],
                    'option_label' => $data['option_label'],
                ],
                $data
            );
        }
    }

    /**
     * Helper untuk membaca file CSV menjadi array asosiatif.
     */
    private function readCsv(string $filePath): array
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            throw new RuntimeException("File CSV tidak ditemukan atau tidak dapat dibaca: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            throw new RuntimeException("Gagal membuka file CSV: {$filePath}");
        }

        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);
            return [];
        }

        // Bersihkan BOM UTF-8 jika CSV diekspor dari Excel
        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
        $header = array_map('trim', $header);

        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            // Lewati baris kosong
            if ($data === [null] || count(array_filter($data, fn ($v) => $v !== null && $v !== '')) === 0) {
                continue;
            }

            $row = [];
            foreach ($header as $index => $column) {
                $value = $data[$index] ?? null;
                $value = is_string($value) ? trim($value) : $value;

                // Konversi string kosong atau teks 'NULL' menjadi null sesungguhnya
                if ($value === '' || strtoupper((string) $value) === 'NULL') {
                    $value = null;
                }

                $row[$column] = $value;
            }

            $rows[] = $row;
        }

        fclose($handle);
        return $rows;
    }

    /**
     * Memastikan string kolom JSON valid (baik sudah format JSON maupun dipisah koma).
     */
    private function normalizeJson(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        json_decode($value);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $value;
        }

        // Fallback jika di CSV ditulis dipisah koma, misal: "PHP,Laravel,Backend"
        $items = array_values(array_filter(array_map('trim', explode(',', $value))));
        return json_encode($items, JSON_UNESCAPED_UNICODE);
    }

    /**
     * Konversi nilai CSV ('1', 'true', 'yes') ke boolean PHP.
     */
    private function toBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'y'], true);
    }
}