<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;

class PublicSkillController extends Controller
{
    public function index()
    {
        $skills = Skill::select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $skills,
        ]);
    }
}
