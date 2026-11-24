<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\SrlReflection;
use Illuminate\Http\Request;

class SrlReflectionController extends Controller
{
    public function index(Request $request)
    {
        $query = SrlReflection::with(['enrollment.user:id,name,email']);

        if ($request->filled('enrollment_id')) {
            $query->where('enrollment_id', $request->enrollment_id);
        }

        if ($request->filled('reflection_type')) {
            $query->where('reflection_type', $request->reflection_type);
        }

        $reflections = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'SRL Reflections retrieved successfully.',
            'data'    => $reflections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id'   => ['required', 'exists:enrollments,id'],
            'reflection_type' => ['nullable', 'string', 'max:50'],
            'content'         => ['required', 'string'],
        ]);

        $reflection = SrlReflection::create([
            'enrollment_id'   => $validated['enrollment_id'],
            'reflection_type' => $validated['reflection_type'] ?? 'general',
            'content'         => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'SRL Reflection created successfully.',
            'data'    => $reflection->load('enrollment'),
        ], 201);
    }

    public function show(string $id)
    {
        $reflection = SrlReflection::with(['enrollment.user:id,name,email', 'enrollment.learningPath:id,title'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'SRL Reflection retrieved successfully.',
            'data'    => $reflection,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $reflection = SrlReflection::findOrFail($id);

        $validated = $request->validate([
            'reflection_type' => ['sometimes', 'nullable', 'string', 'max:50'],
            'content'         => ['sometimes', 'required', 'string'],
        ]);

        $reflection->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'SRL Reflection updated successfully.',
            'data'    => $reflection->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $reflection = SrlReflection::findOrFail($id);
        $reflection->delete();

        return response()->json([
            'success' => true,
            'message' => 'SRL Reflection deleted successfully.',
        ]);
    }
}
