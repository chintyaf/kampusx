<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\ReadinessPrediction;
use Illuminate\Http\Request;

class ReadinessPredictionController extends Controller
{
    public function index(Request $request)
    {
        $query = ReadinessPrediction::with(['user:id,name,email', 'quizAttempt:id,score,status']);

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('readiness_level')) {
            $query->where('readiness_level', $request->readiness_level);
        }

        $predictions = $query->latest('predicted_at')->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Readiness predictions retrieved successfully.',
            'data'    => $predictions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'         => ['required', 'exists:users,id'],
            'quiz_attempt_id' => ['nullable', 'exists:quiz_attempts,id'],
            'model_version'   => ['required', 'string', 'max:100'],
            'readiness_score' => ['required', 'numeric', 'min:0', 'max:1'],
            'readiness_level' => ['required', 'in:belum_siap,cukup_siap,siap'],
            'predicted_at'    => ['nullable', 'date'],
        ]);

        $validated['predicted_at'] = $validated['predicted_at'] ?? now();

        $prediction = ReadinessPrediction::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Readiness prediction saved successfully.',
            'data'    => $prediction,
        ], 201);
    }

    public function show(string $id)
    {
        $prediction = ReadinessPrediction::with(['user:id,name,email', 'quizAttempt'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Readiness prediction retrieved successfully.',
            'data'    => $prediction,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $prediction = ReadinessPrediction::findOrFail($id);

        $validated = $request->validate([
            'readiness_score' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1'],
            'readiness_level' => ['sometimes', 'required', 'in:belum_siap,cukup_siap,siap'],
            'model_version'   => ['sometimes', 'required', 'string', 'max:100'],
            'predicted_at'    => ['nullable', 'date'],
        ]);

        $prediction->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Readiness prediction updated successfully.',
            'data'    => $prediction->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $prediction = ReadinessPrediction::findOrFail($id);
        $prediction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Readiness prediction deleted successfully.',
        ]);
    }
}
