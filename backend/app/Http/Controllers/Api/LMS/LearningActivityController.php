<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\LearningActivity;
use Illuminate\Http\Request;

class LearningActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = LearningActivity::with(['module:id,title', 'lesson:id,title']);

        if ($request->filled('enrollment_id')) {
            $query->where('enrollment_id', $request->enrollment_id);
        }

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('lesson_id')) {
            $query->where('lesson_id', $request->lesson_id);
        }

        if ($request->filled('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        $activities = $query->latest('start_time')->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Learning activities retrieved successfully.',
            'data'    => $activities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id'    => ['required', 'exists:enrollments,id'],
            'module_id'        => ['nullable', 'exists:modules,id'],
            'lesson_id'        => ['nullable', 'exists:lessons,id'],
            'activity_type'    => ['required', 'string', 'max:50'],
            'start_time'       => ['required', 'date'],
            'end_time'         => ['nullable', 'date', 'after_or_equal:start_time'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'progress'         => ['nullable', 'numeric', 'min:0', 'max:100'],
            'completed_at'     => ['nullable', 'date'],
        ]);

        $activity = LearningActivity::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Learning activity recorded successfully.',
            'data'    => $activity,
        ], 201);
    }

    public function show(string $id)
    {
        $activity = LearningActivity::with([
            'enrollment.user:id,name,email',
            'module:id,title',
            'lesson:id,title',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Learning activity retrieved successfully.',
            'data'    => $activity,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $activity = LearningActivity::findOrFail($id);

        $validated = $request->validate([
            'end_time'         => ['nullable', 'date'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'progress'         => ['nullable', 'numeric', 'min:0', 'max:100'],
            'completed_at'     => ['nullable', 'date'],
        ]);

        $activity->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Learning activity updated successfully.',
            'data'    => $activity->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $activity = LearningActivity::findOrFail($id);
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Learning activity deleted successfully.',
        ]);
    }
}
