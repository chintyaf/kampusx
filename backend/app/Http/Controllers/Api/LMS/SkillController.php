<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $query = Skill::withCount('lessons');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $skills = $query->orderBy('name')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Skills retrieved successfully.',
            'data'    => $skills,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:150', 'unique:skills,name'],
            'description' => ['nullable', 'string'],
            'category'    => ['nullable', 'string', 'max:100'],
        ]);

        $skill = Skill::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Skill created successfully.',
            'data'    => $skill,
        ], 201);
    }

    public function show(string $id)
    {
        $skill = Skill::withCount('lessons')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Skill retrieved successfully.',
            'data'    => $skill,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $skill = Skill::findOrFail($id);

        $validated = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:150', 'unique:skills,name,' . $id],
            'description' => ['nullable', 'string'],
            'category'    => ['nullable', 'string', 'max:100'],
        ]);

        $skill->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Skill updated successfully.',
            'data'    => $skill->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $skill = Skill::findOrFail($id);
        $skill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skill deleted successfully.',
        ]);
    }
}
