<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::with(['module.learningPath', 'questions.options'])
            ->withCount(['questions']);

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->boolean('all')) {
            $quizzes = $query->latest()->get();
        } else {
            $quizzes = $query
                ->latest()
                ->paginate($request->input('per_page', 50));
        }

        return response()->json([
            'success' => true,
            'message' => 'Quizzes retrieved successfully.',
            'data' => $quizzes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => ['required', 'exists:modules,id'],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'bloom_level' => ['nullable', 'string', 'max:50'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'passing_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_published' => ['sometimes', 'boolean'],
            'questions' => ['nullable', 'array'],
        ]);

        if (Quiz::where('module_id', $validated['module_id'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Module ini sudah memiliki kuis.',
            ], 422);
        }

        $quiz = DB::transaction(function () use ($validated) {
            $quiz = Quiz::create([
                'module_id' => $validated['module_id'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'bloom_level' => $validated['bloom_level'] ?? null,
                'time_limit_minutes' => $validated['time_limit_minutes'] ?? $validated['duration_minutes'] ?? null,
                'passing_score' => $validated['passing_score'] ?? 70.00,
                'is_published' => $validated['is_published'] ?? false,
            ]);

            if (!empty($validated['questions'])) {
                $this->syncQuestions($quiz, $validated['questions']);
            }

            return $quiz;
        });

        return response()->json([
            'success' => true,
            'message' => 'Quiz created successfully.',
            'data' => $quiz->load(['module.learningPath', 'questions.options']),
        ], 201);
    }

    public function show(string $id)
    {
        $quiz = Quiz::with([
            'module.learningPath',
            'questions.options',
        ])->withCount(['questions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Quiz retrieved successfully.',
            'data' => $quiz,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $quiz = Quiz::findOrFail($id);

        $validated = $request->validate([
            'module_id' => ['sometimes', 'required', 'exists:modules,id'],
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'bloom_level' => ['nullable', 'string', 'max:50'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'passing_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'is_published' => ['sometimes', 'boolean'],
            'questions' => ['nullable', 'array'],
        ]);

        $quiz = DB::transaction(function () use ($quiz, $validated) {
            $quizData = collect($validated)->only([
                'module_id',
                'title',
                'description',
                'bloom_level',
                'time_limit_minutes',
                'passing_score',
                'is_published',
            ])->toArray();

            if (isset($validated['duration_minutes']) && !isset($quizData['time_limit_minutes'])) {
                $quizData['time_limit_minutes'] = $validated['duration_minutes'];
            }

            $quiz->update($quizData);

            if (array_key_exists('questions', $validated)) {
                $this->syncQuestions($quiz, $validated['questions'] ?? []);
            }

            return $quiz;
        });

        return response()->json([
            'success' => true,
            'message' => 'Quiz updated successfully.',
            'data' => $quiz->fresh()->load([
                'module.learningPath',
                'questions.options',
            ]),
        ]);
    }

    public function destroy(string $id)
    {
        $quiz = Quiz::findOrFail($id);

        $quiz->delete();

        return response()->json([
            'success' => true,
            'message' => 'Quiz deleted successfully.',
        ]);
    }

    /**
     * Synchronize quiz questions and their options.
     */
    private function syncQuestions(Quiz $quiz, array $questions): void
    {
        $quiz->questions()->delete();

        $labels = ['A', 'B', 'C', 'D', 'E', 'F'];

        foreach ($questions as $qIndex => $qData) {
            $questionText = $qData['question_text'] ?? $qData['question'] ?? ('Pertanyaan ' . ($qIndex + 1));

            $question = $quiz->questions()->create([
                'question_text' => $questionText,
                'bloom_level' => $qData['bloom_level'] ?? null,
                'explanation' => $qData['explanation'] ?? null,
                'order_index' => $qData['order_index'] ?? ($qIndex + 1),
            ]);

            $options = $qData['options'] ?? [];
            $correctAnswer = $qData['correct_answer'] ?? $qData['answer'] ?? null;

            foreach ($options as $optIndex => $optData) {
                $defaultLabel = $labels[$optIndex] ?? chr(65 + $optIndex);

                if (is_string($optData)) {
                    $label = $defaultLabel;
                    $text = $optData;
                    $isCorrect = ($correctAnswer !== null && ((int)$correctAnswer === $optIndex || strcasecmp((string)$correctAnswer, $defaultLabel) === 0));
                } elseif (is_array($optData)) {
                    $label = $optData['option_label'] ?? $optData['label'] ?? $defaultLabel;
                    $text = $optData['option_text'] ?? $optData['text'] ?? '';
                    $isCorrect = (bool)($optData['is_correct'] ?? false);
                    if ($correctAnswer !== null && ((int)$correctAnswer === $optIndex || strcasecmp((string)$correctAnswer, (string)$label) === 0)) {
                        $isCorrect = true;
                    }
                } else {
                    continue;
                }

                $question->options()->create([
                    'option_label' => $label,
                    'option_text' => $text,
                    'is_correct' => $isCorrect,
                    'order_index' => is_array($optData) ? ($optData['order_index'] ?? ($optIndex + 1)) : ($optIndex + 1),
                ]);
            }
        }
    }
}
