<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\SrlForethought;
use Illuminate\Http\Request;

class SrlForethoughtController extends Controller
{
    public function index(Request $request)
    {
        $query = SrlForethought::with(['enrollment.user:id,name,email']);

        if ($request->filled('enrollment_id')) {
            $query->where('enrollment_id', $request->enrollment_id);
        }

        $forethoughts = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'SRL Forethoughts retrieved successfully.',
            'data'    => $forethoughts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => ['required', 'exists:enrollments,id'],
            'goal'          => ['required', 'string'],
            'plan'          => ['required', 'string'],
            'motivation'    => ['nullable', 'string'],
        ]);

        $forethought = SrlForethought::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'SRL Forethought created successfully.',
            'data'    => $forethought->load('enrollment'),
        ], 201);
    }

    public function show(string $id)
    {
        $forethought = SrlForethought::with(['enrollment.user:id,name,email', 'enrollment.learningPath:id,title'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'SRL Forethought retrieved successfully.',
            'data'    => $forethought,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $forethought = SrlForethought::findOrFail($id);

        $validated = $request->validate([
            'goal'       => ['sometimes', 'required', 'string'],
            'plan'       => ['sometimes', 'required', 'string'],
            'motivation' => ['nullable', 'string'],
        ]);

        $forethought->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'SRL Forethought updated successfully.',
            'data'    => $forethought->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $forethought = SrlForethought::findOrFail($id);
        $forethought->delete();

        return response()->json([
            'success' => true,
            'message' => 'SRL Forethought deleted successfully.',
        ]);
    }
}
