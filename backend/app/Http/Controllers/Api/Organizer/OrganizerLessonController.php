<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Skill;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuestionOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrganizerLessonController extends Controller
{
    /**
     * Daftar Lesson dalam satu Modul.
     */
    public function index(Request $request, $moduleId)
    {
        $module = Module::find($moduleId);
        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        $lessons = Lesson::where('module_id', $moduleId)
            ->with(['skills', 'quizzes'])
            ->orderBy('order_index', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar lesson berhasil dimuat.',
            'data' => $lessons,
        ], 200);
    }

    /**
     * Buat Lesson baru dalam Modul.
     */
    public function store(Request $request, $moduleId)
    {
        $module = Module::with('learningPath')->find($moduleId);
        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $module->learningPath && $module->learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menambah lesson pada modul ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'type' => 'nullable|string|max:50',
            'format' => 'nullable|string|max:50',
            'content' => 'nullable|string',
            'body' => 'nullable|string',
            'summary' => 'nullable|string',
            'order_index' => 'nullable|integer',
            'duration_minutes' => 'nullable|integer',
            'duration' => 'nullable|integer',
            'xp' => 'nullable|integer',
            'video_url' => 'nullable|string|max:500',
            'attachments' => 'nullable',
            'status' => 'nullable|in:draft,published',
            'skills' => 'nullable|array',
            'quiz' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        DB::beginTransaction();
        try {
            $data = [
                'module_id' => $module->id,
                'title' => $validated['title'],
                'type' => $validated['type'] ?? $validated['format'] ?? 'article',
                'content' => $validated['content'] ?? $validated['body'] ?? null,
                'summary' => $validated['summary'] ?? null,
                'duration_minutes' => $validated['duration_minutes'] ?? $validated['duration'] ?? 5,
                'xp' => $validated['xp'] ?? 25,
                'video_url' => $validated['video_url'] ?? null,
                'status' => $validated['status'] ?? 'published',
            ];

            // Order index otomatis
            if (isset($validated['order_index'])) {
                $data['order_index'] = $validated['order_index'];
            } else {
                $maxOrder = Lesson::where('module_id', $moduleId)->max('order_index') ?? 0;
                $data['order_index'] = $maxOrder + 1;
            }

            if (isset($validated['attachments'])) {
                $data['attachments'] = is_string($validated['attachments'])
                    ? json_decode($validated['attachments'], true)
                    : $validated['attachments'];
            }

            $lesson = Lesson::create($data);

            // Sinkronisasi Skill jika disediakan
            if (!empty($validated['skills'])) {
                $this->syncSkills($lesson, $validated['skills']);
            }

            // Simpan quiz jika disediakan
            if (!empty($validated['quiz'])) {
                $this->saveQuizForLesson($lesson, $validated['quiz']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lesson berhasil dibuat.',
                'data' => $lesson->load(['skills', 'quizzes.questions.options']),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Tampilkan detail Lesson beserta skills dan quiz.
     */
    public function show(Request $request, $id)
    {
        $lesson = Lesson::with([
            'module.learningPath:id,title,created_by',
            'skills',
            'quizzes.questions.options',
        ])->find($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail lesson berhasil dimuat.',
            'data' => $lesson,
        ], 200);
    }

    /**
     * Perbarui data Lesson.
     */
    public function update(Request $request, $id)
    {
        $lesson = Lesson::with('module.learningPath')->find($id);
        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        $learningPath = $lesson->module?->learningPath;
        if ($user->role !== 'admin' && $learningPath && $learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengubah lesson ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:200',
            'type' => 'nullable|string|max:50',
            'format' => 'nullable|string|max:50',
            'content' => 'nullable|string',
            'body' => 'nullable|string',
            'summary' => 'nullable|string',
            'order_index' => 'nullable|integer',
            'duration_minutes' => 'nullable|integer',
            'duration' => 'nullable|integer',
            'xp' => 'nullable|integer',
            'video_url' => 'nullable|string|max:500',
            'attachments' => 'nullable',
            'status' => 'nullable|in:draft,published',
            'skills' => 'nullable|array',
            'quiz' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        DB::beginTransaction();
        try {
            $data = [];
            if (isset($validated['title'])) $data['title'] = $validated['title'];
            if (isset($validated['type'])) $data['type'] = $validated['type'];
            elseif (isset($validated['format'])) $data['type'] = $validated['format'];
            if (array_key_exists('content', $validated)) $data['content'] = $validated['content'];
            elseif (array_key_exists('body', $validated)) $data['content'] = $validated['body'];
            if (array_key_exists('summary', $validated)) $data['summary'] = $validated['summary'];
            if (isset($validated['order_index'])) $data['order_index'] = $validated['order_index'];
            if (isset($validated['duration_minutes'])) $data['duration_minutes'] = $validated['duration_minutes'];
            elseif (isset($validated['duration'])) $data['duration_minutes'] = $validated['duration'];
            if (isset($validated['xp'])) $data['xp'] = $validated['xp'];
            if (array_key_exists('video_url', $validated)) $data['video_url'] = $validated['video_url'];
            if (isset($validated['status'])) $data['status'] = $validated['status'];

            if (array_key_exists('attachments', $validated)) {
                $data['attachments'] = is_string($validated['attachments'])
                    ? json_decode($validated['attachments'], true)
                    : $validated['attachments'];
            }

            $lesson->update($data);

            // Sinkronisasi Skill jika ada di payload
            if (array_key_exists('skills', $validated)) {
                $this->syncSkills($lesson, $validated['skills'] ?? []);
            }

            // Simpan quiz jika ada di payload
            if (array_key_exists('quiz', $validated)) {
                $this->saveQuizForLesson($lesson, $validated['quiz'] ?? []);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lesson berhasil diperbarui.',
                'data' => $lesson->fresh(['skills', 'quizzes.questions.options']),
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus Lesson.
     */
    public function destroy(Request $request, $id)
    {
        $lesson = Lesson::with('module.learningPath')->find($id);
        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        $learningPath = $lesson->module?->learningPath;
        if ($user->role !== 'admin' && $learningPath && $learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk menghapus lesson ini.',
            ], 403);
        }

        $lesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lesson berhasil dihapus.',
        ], 200);
    }

    /**
     * Urutkan ulang Lesson dalam Modul.
     */
    public function reorder(Request $request, $moduleId)
    {
        $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|exists:lessons,id',
            'lessons.*.order_index' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->lessons as $item) {
                Lesson::where('id', $item['id'])
                    ->where('module_id', $moduleId)
                    ->update(['order_index' => $item['order_index']]);
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Urutan lesson berhasil diperbarui.',
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah urutan lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper: Sinkronisasi relasi Skill pada Lesson.
     */
    private function syncSkills(Lesson $lesson, array $skills)
    {
        $syncData = [];
        foreach ($skills as $skillItem) {
            if (is_array($skillItem)) {
                $skillName = $skillItem['name'] ?? null;
                $weight = $skillItem['weight'] ?? $skillItem['relevance_weight'] ?? 1.00;
            } else {
                $skillName = (string)$skillItem;
                $weight = 1.00;
            }

            if ($skillName) {
                $skill = Skill::firstOrCreate(['name' => trim($skillName)]);
                $syncData[$skill->id] = ['relevance_weight' => $weight];
            }
        }

        $lesson->skills()->sync($syncData);
    }

    /**
     * Helper: Simpan atau perbarui Quiz & Questions untuk Lesson.
     */
    private function saveQuizForLesson(Lesson $lesson, array $quizData)
    {
        if (empty($quizData)) return;

        $quiz = Quiz::firstOrNew([
            'lesson_id' => $lesson->id,
        ]);

        $quiz->module_id = $lesson->module_id;
        $quiz->title = $quizData['title'] ?? ($lesson->title . ' - Kuis');
        $quiz->description = $quizData['description'] ?? null;
        $quiz->passing_score = $quizData['passing_score'] ?? $quizData['passScore'] ?? 70.00;
        $quiz->time_limit_minutes = $quizData['time_limit_minutes'] ?? $quizData['timeLimit'] ?? null;
        $quiz->save();

        if (isset($quizData['questions']) && is_array($quizData['questions'])) {
            // Hapus pertanyaan lama untuk disinkron ulang
            $quiz->questions()->delete();

            foreach ($quizData['questions'] as $qIndex => $qItem) {
                $question = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question_text' => $qItem['question_text'] ?? $qItem['text'] ?? ('Pertanyaan ' . ($qIndex + 1)),
                    'bloom_level' => $qItem['bloom_level'] ?? null,
                    'explanation' => $qItem['explanation'] ?? null,
                    'order_index' => $qIndex + 1,
                ]);

                if (!empty($qItem['options']) && is_array($qItem['options'])) {
                    $labels = ['A', 'B', 'C', 'D', 'E'];
                    foreach ($qItem['options'] as $optIndex => $optItem) {
                        $label = $optItem['label'] ?? $labels[$optIndex] ?? chr(65 + $optIndex);
                        $text = is_array($optItem) ? ($optItem['text'] ?? $optItem['option_text'] ?? '') : (string)$optItem;
                        $isCorrect = is_array($optItem) ? (bool)($optItem['is_correct'] ?? $optItem['isCorrect'] ?? false) : false;

                        QuestionOption::create([
                            'question_id' => $question->id,
                            'option_label' => $label,
                            'option_text' => $text,
                            'is_correct' => $isCorrect,
                            'order_index' => $optIndex + 1,
                        ]);
                    }
                }
            }
        }
    }
}

