<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::with(['module.learningPath'])
            ->withCount(['questions']);

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $quizzes = $query
            ->latest()
            ->paginate($request->input('per_page', 10));

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
            'passing_score' => ['required', 'integer', 'min:0', 'max:100'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts' => ['nullable', 'integer', 'min:1'],
            'xp' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['draft', 'published'])],
        ]);

        $quiz = Quiz::create([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'passing_score' => $validated['passing_score'],
            'duration_minutes' => $validated['duration_minutes'] ?? null,
            'max_attempts' => $validated['max_attempts'] ?? null,
            'xp' => $validated['xp'] ?? 0,
            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quiz created successfully.',
            'data' => $quiz->load(['module.learningPath', 'questions']),
        ], 201);
    }

    public function show(string $id)
    {
        $quiz = Quiz::with([
            'module.learningPath',
            'questions' => function ($query) {
                $query->orderBy('order_index');
            },
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
            'passing_score' => ['sometimes', 'required', 'integer', 'min:0', 'max:100'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts' => ['nullable', 'integer', 'min:1'],
            'xp' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
        ]);

        $quiz->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Quiz updated successfully.',
            'data' => $quiz->fresh()->load([
                'module.learningPath',
                'questions',
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
}
