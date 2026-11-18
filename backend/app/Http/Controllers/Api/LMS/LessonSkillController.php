<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\LessonSkill;
use App\Models\Lesson;
use App\Models\Skill;
use Illuminate\Http\Request;

class LessonSkillController extends Controller
{
    /**
     * List semua relasi lesson-skill.
     * Filter by lesson_id atau skill_id via query string.
     */
    public function index(Request $request)
    {
        $query = LessonSkill::with(['lesson:id,title,module_id', 'skill:id,name,category']);

        if ($request->filled('lesson_id')) {
            $query->where('lesson_id', $request->lesson_id);
        }

        if ($request->filled('skill_id')) {
            $query->where('skill_id', $request->skill_id);
        }

        $lessonSkills = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Lesson skills retrieved successfully.',
            'data'    => $lessonSkills,
        ]);
    }

    /**
     * Tambah satu relasi lesson → skill.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lesson_id'        => ['required', 'exists:lessons,id'],
            'skill_id'         => ['required', 'exists:skills,id'],
            'relevance_weight' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        // Cegah duplikat
        $existing = LessonSkill::where('lesson_id', $validated['lesson_id'])
            ->where('skill_id', $validated['skill_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Skill sudah ditambahkan ke lesson ini.',
                'data'    => $existing->load(['lesson:id,title', 'skill:id,name']),
            ], 409);
        }

        $lessonSkill = LessonSkill::create([
            'lesson_id'        => $validated['lesson_id'],
            'skill_id'         => $validated['skill_id'],
            'relevance_weight' => $validated['relevance_weight'] ?? 1.00,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil ditambahkan ke lesson.',
            'data'    => $lessonSkill->load(['lesson:id,title', 'skill:id,name']),
        ], 201);
    }

    /**
     * Detail satu relasi lesson-skill berdasarkan ID pivot.
     */
    public function show(string $id)
    {
        $lessonSkill = LessonSkill::with(['lesson:id,title,module_id', 'skill:id,name,category'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Lesson skill retrieved successfully.',
            'data'    => $lessonSkill,
        ]);
    }

    /**
     * Update relevance_weight pada relasi lesson-skill.
     */
    public function update(Request $request, string $id)
    {
        $lessonSkill = LessonSkill::findOrFail($id);

        $validated = $request->validate([
            'relevance_weight' => ['required', 'numeric', 'min:0', 'max:1'],
        ]);

        $lessonSkill->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Relevance weight updated successfully.',
            'data'    => $lessonSkill->fresh()->load(['lesson:id,title', 'skill:id,name']),
        ]);
    }

    /**
     * Hapus relasi lesson-skill (detach skill dari lesson).
     */
    public function destroy(string $id)
    {
        $lessonSkill = LessonSkill::findOrFail($id);
        $lessonSkill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil dihapus dari lesson.',
        ]);
    }
}
