<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;

class PublicSkillController extends Controller
{
    public function index()
    {
        $skills = Skill::select('id', 'name', 'category')
            ->withCount([
                'userSkillScores as matched_candidates_count' => fn ($q) => $q->where('score', '>', 0),
            ])
            ->orderByDesc('matched_candidates_count')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $skills,
        ]);
    }
}
