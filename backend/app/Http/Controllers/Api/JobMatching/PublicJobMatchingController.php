<?php

namespace App\Http\Controllers\Api\JobMatching;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use App\Services\JobMatching\JobMatchingSimilarityService;
use Illuminate\Http\Request;

class PublicJobMatchingController extends Controller
{
    public function __construct(
        protected JobMatchingSimilarityService $cosineService
    ) {}

    public function search(Request $request)
    {
        $data = $request->validate([
            'required_skills' => 'required|array|min:1',
            'required_skills.*' => 'required|integer|exists:skills,id',
        ]);

        $jobVector = collect($data['required_skills'])
            ->unique()
            ->mapWithKeys(fn ($id) => [$id => 1.0])
            ->toArray();

        $skills = Skill::all()->keyBy('id');

        $results = User::whereHas('userSkillScores')
            ->with('userSkillScores')
            ->get()
            ->map(function ($user) use ($jobVector, $skills) {

                $memberVector = $user->userSkillScores
                    ->pluck('score', 'skill_id')
                    ->map(fn ($score) => (float) $score)
                    ->toArray();

                $matched = [];
                $otherSkills = [];

                foreach ($memberVector as $skillId => $score) {

                    // Abaikan skill dengan score 0
                    if ($score <= 0) {
                        continue;
                    }

                    $skillName = $skills[$skillId]->name ?? null;

                    if (!$skillName) {
                        continue;
                    }

                    if (array_key_exists($skillId, $jobVector)) {
                        $matched[] = [
                            'id' => $skillId,
                            'name' => $skillName,
                            'score' => $score,
                        ];
                    } else {
                        $otherSkills[] = [
                            'id' => $skillId,
                            'name' => $skillName,
                            'score' => $score,
                        ];
                    }
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,

                    'match_score' => $this->cosineService->calculate(
                        $memberVector,
                        $jobVector
                    ),

                    'matched_skills' => $matched,
                    'other_skills' => $otherSkills,
                ];
            })

            // Hanya tampilkan Member yang memiliki skill relevan
            ->filter(fn ($user) => count($user['matched_skills']) > 0)

            ->sortByDesc('match_score')
            ->values();

        return response()->json([
            'total_members' => $results->count(),
            'highest_match_score' => $results->first()['match_score'] ?? 0,
            'results' => $results,
        ]);
    }
}
