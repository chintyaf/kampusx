<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GenAIContentController extends Controller
{
    /**
     * Store generated Module, Lessons, and Quizzes.
     * POST /api/ai/generate-module
     */
    public function storeModule(Request $request)
    {
        // Mendukung payload baik dengan wrapper 'ai_result' maupun flat
        $input = $request->all();
        $learningPathId = $input['learning_path_id'] ?? null;

        $aiResult = $input['ai_result'] ?? $input['module'] ?? $input;

        // Validasi input
        $request->validate([
            'learning_path_id' => 'required|exists:learning_paths,id',
        ]);

        if (empty($aiResult['title'])) {
            throw ValidationException::withMessages([
                'title' => 'Judul module (title) wajib diisi.',
            ]);
        }

        $lessons = $aiResult['lessons'] ?? [];
        if (!is_array($lessons) || count($lessons) === 0) {
            throw ValidationException::withMessages([
                'lessons' => 'Daftar lessons wajib berupa array dan minimal memiliki 1 lesson.',
            ]);
        }

        // Validasi opsi dan jawaban kuis untuk semua lesson
        $this->validateCorrectAnswers($lessons);

        $result = DB::transaction(function () use ($learningPathId, $aiResult, $lessons) {
            // Hitung order_index modul
            $maxOrder = DB::table('modules')
                ->where('learning_path_id', $learningPathId)
                ->max('order_index') ?? 0;
            $moduleOrder = $aiResult['order_index'] ?? ($maxOrder + 1);

            // 1. Simpan Module
            $moduleId = DB::table('modules')->insertGetId([
                'learning_path_id'  => $learningPathId,
                'title'             => $aiResult['title'],
                'description'       => $aiResult['description'] ?? null,
                'learning_outcomes' => isset($aiResult['learning_outcomes']) ? json_encode($aiResult['learning_outcomes']) : null,
                'difficulty_level'  => $aiResult['difficulty_level'] ?? 'beginner',
                'order_index'       => $moduleOrder,
                'status'            => $aiResult['status'] ?? 'published',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            $createdLessons = [];

            // 2. Simpan setiap Lesson beserta Kuis-nya
            foreach ($lessons as $index => $lessonData) {
                $createdLessons[] = $this->saveLessonRecord(
                    $moduleId,
                    $lessonData,
                    $index + 1
                );
            }

            return [
                'module_id' => $moduleId,
                'lessons'   => $createdLessons,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Generated Module, Lessons, dan Quiz berhasil disimpan.',
            'data'    => $result,
        ], 201);
    }

    /**
     * Store one generated Lesson and its Quiz into an existing Module.
     * POST /api/modules/{module}/ai/generate-lesson
     */
    public function storeLesson(Request $request, $moduleId)
    {
        // Cek keberadaan module
        $module = DB::table('modules')->where('id', $moduleId)->first();
        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Module tidak ditemukan.',
            ], 404);
        }

        // Dukung payload di dalam 'ai_result', 'lesson', atau flat
        $lessonData = $request->input('ai_result') ?? $request->input('lesson') ?? $request->all();

        if (empty($lessonData['title'])) {
            throw ValidationException::withMessages([
                'title' => 'Judul lesson (title) wajib diisi.',
            ]);
        }

        // Validasi quiz
        $this->validateCorrectAnswers([$lessonData]);

        $result = DB::transaction(function () use ($moduleId, $lessonData) {
            $fallbackOrder = (DB::table('lessons')->where('module_id', $moduleId)->max('order_index') ?? 0) + 1;
            return $this->saveLessonRecord($moduleId, $lessonData, $fallbackOrder);
        });

        return response()->json([
            'success' => true,
            'message' => 'Generated Lesson dan Quiz berhasil disimpan ke dalam Module.',
            'data'    => [
                'module_id' => (int) $moduleId,
                'lesson'    => $result,
            ],
        ], 201);
    }

    /**
     * Helper privat untuk menyimpan Lesson, Quiz, Questions, dan Options.
     * Tidak dinamai storeLesson untuk menghindari bentrok nama method di PHP.
     */
    private function saveLessonRecord($moduleId, array $data, int $fallbackOrder = 1): array
    {
        // Susun lampiran jika AI menyertakan data tambahan (learning_objectives, reflection_question)
        $attachments = [];
        if (!empty($data['learning_objectives'])) {
            $attachments['learning_objectives'] = $data['learning_objectives'];
        }
        if (!empty($data['reflection_question'])) {
            $attachments['reflection_question'] = $data['reflection_question'];
        }

        // Susun konten materi
        $content = $data['content'] ?? $data['body'] ?? $data['materi'] ?? '';
        if (!empty($data['reflection_question']) && !str_contains($content, $data['reflection_question'])) {
            $content .= "\n\n### Pertanyaan Refleksi\n" . $data['reflection_question'];
        }

        $orderIndex = $data['order_index'] ?? $fallbackOrder;

        // 1. Buat Lesson di database (sesuai kolom aktual tabel 'lessons')
        $lessonId = DB::table('lessons')->insertGetId([
            'module_id'        => $moduleId,
            'title'            => $data['title'],
            'type'             => $data['type'] ?? 'article',
            'content'          => $content,
            'summary'          => $data['summary'] ?? null,
            'order_index'      => $orderIndex,
            'duration_minutes' => $data['duration_minutes'] ?? $data['duration'] ?? 10,
            'xp'               => $data['xp'] ?? 25,
            'video_url'        => $data['video_url'] ?? null,
            'attachments'      => count($attachments) > 0 ? json_encode($attachments) : null,
            'status'           => $data['status'] ?? 'published',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // 2. Buat Quiz milik Lesson (sesuai kolom aktual tabel 'quizzes')
        $quizData = $data['quiz'] ?? [];
        $quizTitle = is_array($quizData) && isset($quizData['title'])
            ? $quizData['title']
            : ('Quiz - ' . $data['title']);

        $quizId = DB::table('quizzes')->insertGetId([
            'module_id'          => $moduleId,
            'lesson_id'          => $lessonId,
            'title'              => $quizTitle,
            'description'        => is_array($quizData) ? ($quizData['description'] ?? null) : null,
            'bloom_level'        => is_array($quizData) ? ($quizData['bloom_level'] ?? null) : null,
            'time_limit_minutes' => is_array($quizData) ? ($quizData['time_limit_minutes'] ?? null) : null,
            'passing_score'      => is_array($quizData) ? ($quizData['passing_score'] ?? 70.00) : 70.00,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);

        // 3. Normalisasi daftar pertanyaan quiz
        $questionsList = [];
        if (is_array($quizData)) {
            if (isset($quizData['questions']) && is_array($quizData['questions'])) {
                $questionsList = $quizData['questions'];
            } elseif (array_is_list($quizData) && count($quizData) > 0 && is_array($quizData[0])) {
                $questionsList = $quizData;
            }
        }

        $labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        $createdQuestions = [];

        // 4. Simpan Quiz Questions & Options
        foreach ($questionsList as $qIndex => $questionData) {
            $questionText = $questionData['question_text'] ?? $questionData['question'] ?? ('Pertanyaan ' . ($qIndex + 1));
            $correctAnswer = $questionData['correct_answer'] ?? null;
            $rawOptions = $questionData['options'] ?? [];

            // Insert ke tabel 'quiz_questions'
            $questionId = DB::table('quiz_questions')->insertGetId([
                'quiz_id'       => $quizId,
                'question_text' => $questionText,
                'bloom_level'   => $questionData['bloom_level'] ?? null,
                'explanation'   => $questionData['explanation'] ?? null,
                'order_index'   => $questionData['order_index'] ?? ($qIndex + 1),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $parsedOptions = [];
            $optCounter = 0;

            // Handle options format: asosiatif ['A' => '..'], sequential ['..'], atau array of object
            foreach ($rawOptions as $key => $optionVal) {
                $defaultLabel = $labels[$optCounter] ?? chr(65 + $optCounter);

                if (is_string($key) && !is_numeric($key)) {
                    // Format: "options": {"A": "Pilihan A", "B": "Pilihan B"}
                    $label = strtoupper(trim($key));
                    $text = is_array($optionVal) ? ($optionVal['text'] ?? $optionVal['option_text'] ?? '') : (string) $optionVal;
                    $isCorrect = ($correctAnswer !== null && strcasecmp((string) $label, (string) $correctAnswer) === 0);
                } elseif (is_array($optionVal)) {
                    // Format: "options": [{"label": "A", "text": "...", "is_correct": true}]
                    $label = $optionVal['option_label'] ?? $optionVal['label'] ?? $defaultLabel;
                    $text = $optionVal['option_text'] ?? $optionVal['text'] ?? '';
                    $isCorrect = (bool) ($optionVal['is_correct'] ?? false);
                    if ($correctAnswer !== null) {
                        if (
                            strcasecmp((string) $label, (string) $correctAnswer) === 0 ||
                            strcasecmp(trim($text), trim((string) $correctAnswer)) === 0
                        ) {
                            $isCorrect = true;
                        }
                    }
                } else {
                    // Format: "options": ["Pilihan 1", "Pilihan 2"]
                    $label = $defaultLabel;
                    $text = (string) $optionVal;
                    $isCorrect = false;

                    if ($correctAnswer !== null) {
                        if (
                            strcasecmp((string) $label, (string) $correctAnswer) === 0 ||
                            strcasecmp(trim($text), trim((string) $correctAnswer)) === 0 ||
                            (string) $optCounter === (string) $correctAnswer ||
                            (string) ($optCounter + 1) === (string) $correctAnswer
                        ) {
                            $isCorrect = true;
                        }
                    }
                }

                $parsedOptions[] = [
                    'question_id'  => $questionId,
                    'option_label' => $label,
                    'option_text'  => $text,
                    'is_correct'   => $isCorrect,
                    'order_index'  => $optCounter + 1,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];

                $optCounter++;
            }

            // Simpan ke tabel 'question_options'
            foreach ($parsedOptions as $opt) {
                DB::table('question_options')->insert($opt);
            }

            $createdQuestions[] = [
                'question_id'   => $questionId,
                'question_text' => $questionText,
                'options_count' => count($parsedOptions),
            ];
        }

        return [
            'lesson_id' => $lessonId,
            'title'     => $data['title'],
            'quiz_id'   => $quizId,
            'questions' => $createdQuestions,
        ];
    }

    /**
     * Memastikan correct_answer sesuai dengan salah satu option yang tersedia.
     */
    private function validateCorrectAnswers(array $lessons): void
    {
        $labels = ['A', 'B', 'C', 'D', 'E', 'F'];

        foreach ($lessons as $lessonIndex => $lesson) {
            $quiz = $lesson['quiz'] ?? [];

            // Ambil daftar pertanyaan
            $questions = [];
            if (is_array($quiz)) {
                if (isset($quiz['questions']) && is_array($quiz['questions'])) {
                    $questions = $quiz['questions'];
                } elseif (array_is_list($quiz) && count($quiz) > 0 && is_array($quiz[0])) {
                    $questions = $quiz;
                }
            }

            if (empty($questions)) {
                throw ValidationException::withMessages([
                    "lessons.{$lessonIndex}.quiz" => 'Setiap lesson harus memiliki minimal 1 pertanyaan quiz.',
                ]);
            }

            foreach ($questions as $qIndex => $question) {
                $options = $question['options'] ?? [];
                $correctAnswer = $question['correct_answer'] ?? null;

                if (!is_array($options) || count($options) < 2) {
                    throw ValidationException::withMessages([
                        "lessons.{$lessonIndex}.quiz.{$qIndex}.options" => 'Pertanyaan harus memiliki minimal 2 pilihan jawaban (options).',
                    ]);
                }

                // Cek apakah correct_answer cocok dengan salah satu option
                $matched = false;
                $idx = 0;

                foreach ($options as $key => $optVal) {
                    $label = is_string($key) && !is_numeric($key)
                        ? strtoupper(trim($key))
                        : ($labels[$idx] ?? chr(65 + $idx));

                    $text = is_array($optVal)
                        ? ($optVal['text'] ?? $optVal['option_text'] ?? '')
                        : (string) $optVal;

                    $hasIsCorrectFlag = is_array($optVal) && !empty($optVal['is_correct']);

                    if ($correctAnswer !== null) {
                        if (
                            strcasecmp((string) $label, (string) $correctAnswer) === 0 ||
                            strcasecmp(trim($text), trim((string) $correctAnswer)) === 0 ||
                            (string) $idx === (string) $correctAnswer ||
                            (string) ($idx + 1) === (string) $correctAnswer
                        ) {
                            $matched = true;
                            break;
                        }
                    } elseif ($hasIsCorrectFlag) {
                        $matched = true;
                        break;
                    }

                    $idx++;
                }

                if (!$matched) {
                    $qText = $question['question_text'] ?? $question['question'] ?? "Pertanyaan #" . ($qIndex + 1);
                    throw ValidationException::withMessages([
                        "lessons.{$lessonIndex}.quiz.{$qIndex}.correct_answer" => "Jawaban benar ('{$correctAnswer}') pada pertanyaan '{$qText}' tidak cocok dengan pilihan options manapun.",
                    ]);
                }
            }
        }
    }
}
