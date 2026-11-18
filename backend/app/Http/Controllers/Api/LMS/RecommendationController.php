<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Recommendation;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $query = Recommendation::with(['user:id,name,email']);

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('content_type')) {
            $query->where('content_type', $request->content_type);
        }

        $recommendations = $query->orderBy('rank_position', 'asc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Recommendations retrieved successfully.',
            'data'    => $recommendations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'       => ['required', 'exists:users,id'],
            'content_type'  => ['required', 'string', 'max:50'],
            'content_id'    => ['required', 'integer'],
            'cbf_score'     => ['nullable', 'numeric'],
            'cf_score'      => ['nullable', 'numeric'],
            'score'         => ['required', 'numeric'],
            'rank_position' => ['required', 'integer', 'min:1'],
        ]);

        $recommendation = Recommendation::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Recommendation saved successfully.',
            'data'    => $recommendation,
        ], 201);
    }

    public function show(string $id)
    {
        $recommendation = Recommendation::with(['user:id,name,email'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Recommendation retrieved successfully.',
            'data'    => $recommendation,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $recommendation = Recommendation::findOrFail($id);

        $validated = $request->validate([
            'score'         => ['sometimes', 'required', 'numeric'],
            'rank_position' => ['sometimes', 'required', 'integer', 'min:1'],
            'cbf_score'     => ['nullable', 'numeric'],
            'cf_score'      => ['nullable', 'numeric'],
        ]);

        $recommendation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Recommendation updated successfully.',
            'data'    => $recommendation->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $recommendation = Recommendation::findOrFail($id);
        $recommendation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Recommendation deleted successfully.',
        ]);
    }
}
