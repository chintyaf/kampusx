<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\LearningActivity;
use App\Services\Lms\LearningDataService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LearningActivityController extends Controller
{
    public function __construct(private readonly LearningDataService $learningDataService)
    {
    }

    public function index(Request $request)
    {
        $query = LearningActivity::where('user_id', $request->user()->id);

        if ($request->filled('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->target_type);
        }

        if ($request->filled('target_id')) {
            $query->where('target_id', $request->target_id);
        }

        $activities = $query->latest('occurred_at')->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Learning activities retrieved successfully.',
            'data'    => $activities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'activity_type'    => ['required', 'string', 'max:50'],
            'target_type'      => ['nullable', 'string', 'max:100'],
            'target_id'        => ['nullable', 'integer'],
            'metadata'         => ['nullable', 'array'],
            'occurred_at'      => ['nullable', 'date'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $activity = LearningActivity::create([
            'user_id'          => $request->user()->id,
            'activity_type'    => $validated['activity_type'],
            'target_type'      => $validated['target_type'] ?? null,
            'target_id'        => $validated['target_id'] ?? null,
            'metadata'         => $validated['metadata'] ?? null,
            'occurred_at'      => isset($validated['occurred_at']) ? Carbon::parse($validated['occurred_at']) : now(),
            'duration_seconds' => $validated['duration_seconds'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Learning activity recorded successfully.',
            'data'    => $activity,
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $activity = LearningActivity::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Learning activity retrieved successfully.',
            'data'    => $activity,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $activity = LearningActivity::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'metadata'         => ['nullable', 'array'],
            'occurred_at'      => ['nullable', 'date'],
        ]);

        $activity->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Learning activity updated successfully.',
            'data'    => $activity->fresh(),
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $activity = LearningActivity::where('user_id', $request->user()->id)->findOrFail($id);
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Learning activity deleted successfully.',
        ]);
    }
}
