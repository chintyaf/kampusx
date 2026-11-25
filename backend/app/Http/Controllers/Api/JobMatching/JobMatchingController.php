<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Models\JobSearch;
use App\Models\JobShortlist;
use App\Models\MemberJobProfile;
use App\Models\User;
use App\Models\UserSkillScore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobMatchingController extends Controller
{
    private const MODEL_VERSION = 'cosine-v1';
    private const TOP_N = 10;

    /**
     * POST /job-searches
     * Recruiter (guest) membuat pencarian + skill yang dibutuhkan (vektor kebutuhan).
     * Response berisi access_token (hanya ditampilkan sekali) untuk mengakses pencarian ini.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recruiter_name'             => ['required', 'string', 'max:150'],
            'recruiter_email'            => ['required', 'email', 'max:150'],
            'company_name'               => ['nullable', 'string', 'max:200'],
            'title'                      => ['required', 'string', 'max:200'],
            'description'                => ['nullable', 'string'],
            'event_id'                   => ['nullable', 'exists:events,id'],
            'needed_count'               => ['nullable', 'integer', 'min:1'],
            'min_similarity'             => ['nullable', 'numeric', 'between:0,1'],
            'skills'                     => ['required', 'array', 'min:1'],
            'skills.*.skill_id'          => ['required', 'distinct', 'exists:skills,id'],
            'skills.*.importance_weight' => ['nullable', 'numeric', 'between:0,1'],
            'skills.*.required_level'    => ['nullable', 'integer', 'between:1,5'],
            'skills.*.is_mandatory'      => ['nullable', 'boolean'],
        ]);

        $token = Str::random(64);

        $search = DB::transaction(function () use ($data, $token) {
            $search = JobSearch::create([
                'recruiter_name'    => $data['recruiter_name'],
                'recruiter_email'   => $data['recruiter_email'],
                'company_name'      => $data['company_name'] ?? null,
                'access_token_hash' => hash('sha256', $token),
                'event_id'       => $data['event_id'] ?? null,
                'title'          => $data['title'],
                'description'    => $data['description'] ?? null,
                'needed_count'   => $data['needed_count'] ?? 1,
                'min_similarity' => $data['min_similarity'] ?? 0.5,
                'status'         => 'active',
            ]);

            $search->searchSkills()->createMany(
                array_map(fn ($s) => [
                    'skill_id'          => $s['skill_id'],
                    'importance_weight' => $s['importance_weight'] ?? 1,
                    'required_level'    => $s['required_level'] ?? 1,
                    'is_mandatory'      => $s['is_mandatory'] ?? false,
                ], $data['skills'])
            );

            return $search;
        });

        return response()->json(['id' => $search->id, 'access_token' => $token], 201);
    }

    /**
     * GET /job-searches/{id}/match
     * Hitung cosine similarity on-the-fly, kembalikan top N sebagai JSON.
     * Hasil TIDAK disimpan ke database.
     */
    public function match(Request $request, int $id): JsonResponse
    {
        $search  = $this->findOwnedSearch($request, $id);
        $matches = $this->computeMatches($search, $search->min_similarity);

        $search->update(['last_matched_at' => now()]);

        return response()->json([
            'search'        => ['id' => $search->id, 'title' => $search->title],
            'model_version' => self::MODEL_VERSION,
            'total'         => count($matches),
            'matches'       => array_slice($matches, 0, self::TOP_N),
        ]);
    }

    /**
     * POST /job-searches/{id}/shortlist
     * Simpan kandidat pilihan recruiter + snapshot skornya.
     * Skor dihitung ulang di server, tidak mengambil dari client.
     */
    public function shortlist(Request $request, int $id): JsonResponse
    {
        $search = $this->findOwnedSearch($request, $id);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'status'  => ['nullable', 'in:shortlisted,contacted,rejected'],
            'note'    => ['nullable', 'string'],
        ]);

        $match = $this->computeMatches($search, 0.0, (int) $data['user_id'])[0] ?? null;
        abort_if(! $match, 422, 'Member tidak ditemukan atau tidak dapat dicari.');

        $status = $data['status'] ?? 'shortlisted';
        $now    = now();

        JobShortlist::updateOrCreate(
            ['job_search_id' => $search->id, 'user_id' => $match['user_id']],
            [
                'status'            => $status,
                'contacted_at'      => $status === 'contacted' ? $now : null,
                'note'              => $data['note'] ?? null,
                'cosine_similarity' => $match['cosine_similarity'],
                'skill_coverage'    => $match['skill_coverage'],
                'matched_skills'    => $match['matched_skills'],
                'missing_skills'    => $match['missing_skills'],
                'model_version'     => self::MODEL_VERSION,
                'snapshot_at'       => $now,
            ]
        );

        return response()->json(['message' => 'Kandidat disimpan.', 'candidate' => $match]);
    }

    /**
     * GET /job-searches/{id}/shortlists
     */
    public function shortlists(Request $request, int $id): JsonResponse
    {
        $search = $this->findOwnedSearch($request, $id);

        $rows = $search->shortlists()
            ->with('user:id,name')
            ->orderByDesc('cosine_similarity')
            ->get();

        return response()->json($rows);
    }

    // ------------------------------------------------------------------

    /**
     * Recruiter adalah guest, jadi akses dicek lewat token rahasia
     * (header X-Search-Token atau query ?token=). Token salah/tidak ada -> 404.
     */
    private function findOwnedSearch(Request $request, int $id): JobSearch
    {
        $token = (string) ($request->header('X-Search-Token') ?? $request->query('token', ''));
        abort_if($token === '', 404);

        return JobSearch::forToken($token)->findOrFail($id);
    }

    /**
     * Inti perhitungan: cosine(user_vector, kebutuhan_vector).
     * Vektor kebutuhan: importance_weight per skill.
     * Vektor member: proficiency_score per skill (seluruh skill, bukan hanya yang diminta,
     * supaya norma vektor member benar).
     */
    private function computeMatches(JobSearch $search, float $minSimilarity = 0.0, ?int $onlyUserId = null): array
    {
        $required = $search->searchSkills()->get()->keyBy('skill_id');

        $jobNormSq = $required->sum(fn ($r) => $r->importance_weight ** 2);
        if ($jobNormSq <= 0) {
            return [];
        }
        $jobNorm = sqrt($jobNormSq);

        // Kandidat: member yang opt-in dan punya minimal satu skill yang diminta
        $candidateQuery = UserSkillScore::query()
            ->whereIn('user_id', MemberJobProfile::discoverable()->select('user_id'))
            ->whereIn('skill_id', $required->keys()->all())
            ->where('proficiency_score', '>', 0);

        if ($onlyUserId) {
            $candidateQuery->where('user_id', $onlyUserId);
        }

        $candidateIds = $candidateQuery->distinct()->pluck('user_id');
        if ($candidateIds->isEmpty()) {
            return [];
        }

        $scores = UserSkillScore::query()
            ->whereIn('user_id', $candidateIds)
            ->get(['user_id', 'skill_id', 'proficiency_score', 'proficiency_level'])
            ->groupBy('user_id');

        $names = User::whereIn('id', $candidateIds)->pluck('name', 'id');

        $results = [];

        foreach ($scores as $userId => $rows) {
            $bySkill    = $rows->keyBy('skill_id');
            $userNormSq = $rows->sum(fn ($r) => $r->proficiency_score ** 2);
            if ($userNormSq <= 0) {
                continue;
            }

            $dot = 0.0;
            $matched = [];
            $missing = [];
            $mandatoryMissing = false;

            foreach ($required as $skillId => $req) {
                $row   = $bySkill->get($skillId);
                $score = $row ? $row->proficiency_score : 0.0;
                $dot  += $score * $req->importance_weight;

                $meetsLevel = $row && $row->proficiency_level >= $req->required_level;

                if ($meetsLevel) {
                    $matched[] = [
                        'skill_id'        => $skillId,
                        'user_score'      => round($score, 4),
                        'required_weight' => $req->importance_weight,
                    ];
                } else {
                    $missing[] = [
                        'skill_id'       => $skillId,
                        'user_score'     => round($score, 4),
                        'required_level' => $req->required_level,
                        'is_mandatory'   => $req->is_mandatory,
                    ];
                    if ($req->is_mandatory) {
                        $mandatoryMissing = true;
                    }
                }
            }

            // Skill wajib tidak terpenuhi -> tidak dimunculkan
            if ($mandatoryMissing) {
                continue;
            }

            $cosine = $dot / (sqrt($userNormSq) * $jobNorm);
            if ($cosine < $minSimilarity) {
                continue;
            }

            $results[] = [
                'user_id'           => (int) $userId,
                'name'              => $names[$userId] ?? null,
                'cosine_similarity' => round($cosine, 5),
                'skill_coverage'    => round(count($matched) / $required->count() * 100, 2),
                'matched_skills'    => $matched,
                'missing_skills'    => $missing,
            ];
        }

        usort($results, fn ($a, $b) => $b['cosine_similarity'] <=> $a['cosine_similarity']);

        foreach ($results as $i => &$r) {
            $r['rank_position'] = $i + 1;
        }
        unset($r);

        return $results;
    }
}
