<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\LearningPath;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModuleController extends Controller
{
    /**
     * Display a listing of modules.
     */
    public function index(Request $request)
    {
        $query = Module::with(['learningPath'])
            ->withCount(['lessons', 'quizzes']);

        // Filter by Learning Path
        if ($request->filled('learning_path_id')) {
            $query->where('learning_path_id', $request->learning_path_id);
        }

        // Search by title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by difficulty level
        if ($request->filled('difficulty_level')) {
            $query->where('difficulty_level', $request->difficulty_level);
        }

        $modules = $query
            ->orderBy('order_index', 'asc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Modules retrieved successfully.',
            'data' => $modules,
        ], 200);
    }

    /**
     * Store a newly created module.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'learning_path_id' => [
                'required',
                'exists:learning_paths,id'
            ],
            'title' => [
                'required',
                'string',
                'max:200'
            ],
            'description' => [
                'nullable',
                'string'
            ],
            'learning_outcomes' => [
                'nullable',
                'array'
            ],
            'learning_outcomes.*' => [
                'string'
            ],
            'difficulty_level' => [
                'nullable',
                Rule::in(['beginner', 'intermediate', 'advanced'])
            ],
            'order_index' => [
                'nullable',
                'integer',
                'min:1'
            ],
            'status' => [
                'nullable',
                Rule::in(['draft', 'published'])
            ],
        ]);

        // Create module
        $module = Module::create($validated);

        $module->load('learningPath');

        return response()->json([
            'success' => true,
            'message' => 'Module created successfully.',
            'data' => $module,
        ], 201);
    }

    /**
     * Display the specified module.
     */
    public function show(string $id)
    {
        $module = Module::with([
            'learningPath',
            'lessons',
            'quizzes'
        ])
            ->withCount(['lessons', 'quizzes'])
            ->find($id);

        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Module not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Module retrieved successfully.',
            'data' => $module,
        ], 200);
    }

    /**
     * Update the specified module.
     */
    public function update(Request $request, string $id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Module not found.',
            ], 404);
        }

        $validated = $request->validate([
            'learning_path_id' => [
                'sometimes',
                'required',
                'exists:learning_paths,id'
            ],
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:200'
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string'
            ],
            'learning_outcomes' => [
                'sometimes',
                'nullable',
                'array'
            ],
            'learning_outcomes.*' => [
                'string'
            ],
            'difficulty_level' => [
                'sometimes',
                'required',
                Rule::in(['beginner', 'intermediate', 'advanced'])
            ],
            'order_index' => [
                'sometimes',
                'required',
                'integer',
                'min:1'
            ],
            'status' => [
                'sometimes',
                'required',
                Rule::in(['draft', 'published'])
            ],
        ]);

        $module->update($validated);

        $module->load('learningPath');

        return response()->json([
            'success' => true,
            'message' => 'Module updated successfully.',
            'data' => $module,
        ], 200);
    }

    /**
     * Remove the specified module.
     */
    public function destroy(string $id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Module not found.',
            ], 404);
        }

        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Module deleted successfully.',
        ], 200);
    }
}
