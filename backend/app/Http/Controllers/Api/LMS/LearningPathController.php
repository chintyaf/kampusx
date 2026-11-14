<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LearningPathController extends Controller
{
    /**
     * Display a listing of learning paths.
     */
    public function index(Request $request)
    {
        $query = LearningPath::with(['creator', 'event'])
            ->withCount(['modules', 'enrollments']);

        // Search by title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $learningPaths = $query
            ->latest()
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'status' => 'success',
            'message' => 'Learning paths retrieved successfully.',
            'data' => $learningPaths,
        ], 200);
    }

    /**
     * Store a newly created learning path.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'created_by' => ['required', 'exists:users,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
        ]);

        // Upload thumbnail
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')
                ->store('learning-paths', 'public');
        }

        $learningPath = LearningPath::create($validated);

        $learningPath->load(['creator', 'event']);

        return response()->json([
            'success' => true,
            'message' => 'Learning path created successfully.',
            'data' => $learningPath,
        ], 201);
    }

    /**
     * Display the specified learning path.
     */
    public function show(string $id)
    {
        $learningPath = LearningPath::with([
            'creator',
            'event',
            'modules.lessons',
            'enrollments'
        ])
            ->withCount(['modules', 'enrollments'])
            ->find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning path not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Learning path retrieved successfully.',
            'data' => $learningPath,
        ], 200);
    }

    /**
     * Update the specified learning path.
     */
    public function update(Request $request, string $id)
    {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning path not found.',
            ], 404);
        }

        $validated = $request->validate([
            'created_by' => ['sometimes', 'required', 'exists:users,id'],
            'event_id' => ['sometimes', 'nullable', 'exists:events,id'],
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'categories' => ['sometimes', 'nullable', 'array'],
            'categories.*' => ['string'],
            'thumbnail' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_thumbnail' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'required', Rule::in(['draft', 'published', 'archived'])],
        ]);

        // Remove existing thumbnail if requested
        if ($request->boolean('remove_thumbnail') && $learningPath->thumbnail) {
            if (!str_starts_with($learningPath->thumbnail, 'http://') &&
                !str_starts_with($learningPath->thumbnail, 'https://')) {
                Storage::disk('public')->delete($learningPath->thumbnail);
            }

            $validated['thumbnail'] = null;
        }

        unset($validated['remove_thumbnail']);

        // Replace thumbnail
        if ($request->hasFile('thumbnail')) {
            if ($learningPath->thumbnail &&
                !str_starts_with($learningPath->thumbnail, 'http://') &&
                !str_starts_with($learningPath->thumbnail, 'https://')) {
                Storage::disk('public')->delete($learningPath->thumbnail);
            }

            $validated['thumbnail'] = $request->file('thumbnail')
                ->store('learning-paths', 'public');
        }

        $learningPath->update($validated);

        $learningPath->load(['creator', 'event']);

        return response()->json([
            'success' => true,
            'message' => 'Learning path updated successfully.',
            'data' => $learningPath,
        ], 200);
    }

    /**
     * Remove the specified learning path.
     */
    public function destroy(string $id)
    {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning path not found.',
            ], 404);
        }

        // Delete thumbnail
        if ($learningPath->thumbnail &&
            !str_starts_with($learningPath->thumbnail, 'http://') &&
            !str_starts_with($learningPath->thumbnail, 'https://')) {
            Storage::disk('public')->delete($learningPath->thumbnail);
        }

        $learningPath->delete();

        return response()->json([
            'success' => true,
            'message' => 'Learning path deleted successfully.',
        ], 200);
    }
}
