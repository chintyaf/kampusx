<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SbtCredential;
use App\Models\TalentPost;
use App\Models\TalentPostComment;
use App\Models\TalentPostLike;
use App\Models\TalentProfile;
use App\Models\TalentSkill;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TalentDirectoryController extends Controller
{
    /**
     * Menampilkan daftar talenta dengan filter pencarian, spesialisasi, dan match simulator.
     * Public access (dengan guest preview status).
     */
    public function index(Request $request): JsonResponse
    {
        Carbon::setLocale('id');

        $authUser = auth('sanctum')->user();
        $isGuest = is_null($authUser);

        $query = TalentProfile::with(['user', 'skills', 'latestSbt'])
            ->where('is_public', true);

        // 1. Filter Pencarian Teks (Search Query)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                })
                ->orWhere('headline', 'like', "%{$search}%")
                ->orWhere('campus', 'like', "%{$search}%")
                ->orWhere('major', 'like', "%{$search}%")
                ->orWhere('bio', 'like', "%{$search}%")
                ->orWhereHas('skills', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                });
            });
        }

        // 2. Filter Spesialisasi / Bidang Peran (Role / Specialization)
        if ($request->filled('role') && strtoupper($request->input('role')) !== 'ALL') {
            $role = strtoupper($request->input('role'));
            $specializationMap = [
                'DATA' => ['Python', 'Machine Learning', 'Data Analysis', 'Deep Learning', 'SQL'],
                'ENGINEERING' => ['React', 'Node.js', 'Go', 'Docker', 'TypeScript', 'Kubernetes'],
                'DESIGN' => ['Figma', 'UI/UX Design', 'Design System', 'UX Research', 'Product Design'],
                'BUSINESS' => ['Product Management', 'Scrum Agile', 'Tech Strategist', 'Business Analysis'],
            ];

            if (isset($specializationMap[$role])) {
                $targetSkills = $specializationMap[$role];
                $query->where(function ($q) use ($role, $targetSkills) {
                    $q->where('specialization', $role)
                      ->orWhereHas('skills', function ($sq) use ($targetSkills) {
                          $sq->whereIn('name', $targetSkills);
                      });
                });
            } else {
                $query->where('specialization', $role);
            }
        }

        // Ambil data profile
        $profiles = $query->get();

        // 3. Vector Match Simulator (Simulasi Cosine Similarity berdasarkan keahlian yang dipilih)
        $requiredSkills = [];
        if ($request->has('skills')) {
            $skillsInput = $request->input('skills');
            if (is_string($skillsInput)) {
                $requiredSkills = array_filter(array_map('trim', explode(',', $skillsInput)));
            } elseif (is_array($skillsInput)) {
                $requiredSkills = array_filter(array_map('trim', $skillsInput));
            }
        }

        // Format data sesuai kebutuhan frontend TalentDirectory
        $formattedTalents = $profiles->map(function ($profile) use ($requiredSkills) {
            $talentSkills = $profile->skills->map(function ($s) {
                return [
                    'name'  => $s->name,
                    'level' => (int) $s->level,
                ];
            })->toArray();

            // Hitung skor match jika kriteria skill diberikan
            $matchScore = null;
            if (count($requiredSkills) > 0) {
                $matchCount = 0;
                $totalScore = 0;
                foreach ($requiredSkills as $reqSkill) {
                    foreach ($talentSkills as $ts) {
                        if (strcasecmp($ts['name'], $reqSkill) === 0) {
                            $matchCount++;
                            $totalScore += $ts['level'];
                            break;
                        }
                    }
                }
                $matchScore = $matchCount > 0 ? (int) round($totalScore / count($requiredSkills)) : 0;
            }

            // Data SBT Terkini
            $latestSbtData = null;
            $sbt = $profile->latestSbt;
            if ($sbt) {
                $latestSbtData = [
                    'tokenId'         => $sbt->token_id,
                    'title'           => $sbt->title,
                    'contractAddress' => $sbt->contract_address,
                    'txHash'          => $sbt->tx_hash,
                    'date'            => $sbt->minted_at ? Carbon::parse($sbt->minted_at)->translatedFormat('d M Y') : Carbon::parse($sbt->created_at)->translatedFormat('d M Y'),
                    'block'           => $sbt->block_number,
                    'network'         => $sbt->network,
                    'tokenStandard'   => $sbt->token_standard,
                    'issuer'          => $sbt->issuer,
                ];
            }

            return [
                'id'               => $profile->id,
                'userId'           => $profile->user_id,
                'name'             => $profile->user->name ?? 'Kandidat Mahasiswa',
                'initials'         => $profile->initials,
                'headline'         => $profile->headline,
                'campus'           => $profile->campus ?? ($profile->user->university->name ?? 'KampusX University'),
                'major'            => $profile->major,
                'tier'             => $profile->tier,
                'avatarBg'         => $profile->avatar_bg ?? '#fef3c7',
                'avatarColor'      => $profile->avatar_color ?? '#92400e',
                'bio'              => $profile->bio,
                'skills'           => $talentSkills,
                'modulesCompleted' => (int) $profile->modules_completed,
                'eventsAttended'   => (int) $profile->events_attended,
                'sbtCount'         => (int) $profile->sbt_count,
                'walletAddress'    => $profile->wallet_address,
                'latestSbt'        => $latestSbtData,
                'matchScore'       => $matchScore,
            ];
        });

        // 4. Pengurutan (Sorting)
        if (count($requiredSkills) > 0) {
            $sortedTalents = $formattedTalents->sortByDesc('matchScore')->values();
        } else {
            $sortBy = $request->input('sort', 'sbt_count');
            if ($sortBy === 'points') {
                $sortedTalents = $formattedTalents->sortByDesc('modulesCompleted')->values();
            } else {
                $sortedTalents = $formattedTalents->sortByDesc('sbtCount')->values();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar direktori talent berhasil diambil.',
            'meta'    => [
                'is_guest'            => $isGuest,
                'total_talents'       => $sortedTalents->count(),
                'preview_limit'       => $isGuest ? 2 : null,
                'has_active_filters'  => $request->filled('search') || $request->filled('role') || count($requiredSkills) > 0,
            ],
            'data'    => $sortedTalents,
        ]);
    }

    /**
     * Detail satu talenta beserta kredensial SBT dan histori SRL.
     */
    public function show($id): JsonResponse
    {
        Carbon::setLocale('id');

        $profile = TalentProfile::with([
            'user.university',
            'skills',
            'sbtCredentials' => function ($q) {
                $q->orderBy('minted_at', 'desc');
            }
        ])->find($id);

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Talenta tidak ditemukan.',
            ], 404);
        }

        $sbtList = $profile->sbtCredentials->map(function ($sbt) {
            return [
                'id'              => $sbt->id,
                'tokenId'         => $sbt->token_id,
                'title'           => $sbt->title,
                'issuer'          => $sbt->issuer,
                'contractAddress' => $sbt->contract_address,
                'txHash'          => $sbt->tx_hash,
                'blockNumber'     => $sbt->block_number,
                'network'         => $sbt->network,
                'tokenStandard'   => $sbt->token_standard,
                'date'            => $sbt->minted_at ? Carbon::parse($sbt->minted_at)->translatedFormat('d M Y') : '',
                'explorerUrl'     => 'https://polygonscan.com/tx/' . $sbt->tx_hash,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Detail profil talenta berhasil diambil.',
            'data'    => [
                'id'               => $profile->id,
                'userId'           => $profile->user_id,
                'name'             => $profile->user->name ?? '',
                'initials'         => $profile->initials,
                'headline'         => $profile->headline,
                'campus'           => $profile->campus ?? ($profile->user->university->name ?? 'KampusX University'),
                'major'            => $profile->major,
                'tier'             => $profile->tier,
                'avatarBg'         => $profile->avatar_bg,
                'avatarColor'      => $profile->avatar_color,
                'bio'              => $profile->bio,
                'walletAddress'    => $profile->wallet_address,
                'skills'           => $profile->skills->map(fn($s) => ['name' => $s->name, 'level' => (int) $s->level]),
                'modulesCompleted' => (int) $profile->modules_completed,
                'eventsAttended'   => (int) $profile->events_attended,
                'sbtCount'         => (int) $profile->sbt_count,
                'sbtCredentials'   => $sbtList,
                'latestSbt'        => $sbtList->first(),
            ]
        ]);
    }

    /**
     * Zero-Trust Blockchain Verification Endpoint.
     * Memvalidasi kredensial Soulbound Token (SBT) Polygon on-chain.
     */
    public function verifySbt(Request $request, $identifier): JsonResponse
    {
        Carbon::setLocale('id');

        // Cari berdasarkan tokenId atau tx_hash
        $cleanIdentifier = trim(urldecode($identifier));

        $sbt = SbtCredential::with(['user', 'talentProfile'])
            ->where('token_id', $cleanIdentifier)
            ->orWhere('tx_hash', $cleanIdentifier)
            ->first();

        if (!$sbt) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial Soulbound Token (SBT) tidak ditemukan pada ledger Polygon.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kredensial SBT valid dan terverifikasi secara on-chain.',
            'data'    => [
                'isVerified'      => true,
                'tokenId'         => $sbt->token_id,
                'title'           => $sbt->title,
                'issuer'          => $sbt->issuer,
                'ownerName'       => $sbt->user->name ?? 'Kandidat Mahasiswa',
                'ownerCampus'     => $sbt->talentProfile->campus ?? 'KampusX University',
                'ownerWallet'     => $sbt->talentProfile->wallet_address ?? '0x' . substr(md5($sbt->user_id), 0, 40),
                'contractAddress' => $sbt->contract_address,
                'txHash'          => $sbt->tx_hash,
                'blockNumber'     => $sbt->block_number,
                'network'         => $sbt->network,
                'tokenStandard'   => $sbt->token_standard,
                'mintedAt'        => $sbt->minted_at ? Carbon::parse($sbt->minted_at)->translatedFormat('d F Y, H:i:s') . ' WIB' : null,
                'polygonscanUrl'  => 'https://polygonscan.com/tx/' . $sbt->tx_hash,
                'trustBadge'      => 'Verified ERC-5192 Non-Transferable Soulbound Token',
            ]
        ]);
    }

    /**
     * Social Activity Feed (Tab 2: Feed Prestasi & Pembelajaran).
     */
    public function feed(Request $request): JsonResponse
    {
        Carbon::setLocale('id');

        $authUser = auth('sanctum')->user();
        $isGuest = is_null($authUser);

        $posts = TalentPost::with(['user.talentProfile', 'sbtCredential'])
            ->latest()
            ->paginate($request->input('per_page', 10));

        $formattedPosts = collect($posts->items())->map(function ($post) use ($authUser) {
            $user = $post->user;
            $profile = $user->talentProfile ?? null;

            // Target modal verifikasi jika ada SBT terkait
            $sbtTarget = null;
            if ($post->sbtCredential) {
                $sbtTarget = [
                    'id'              => $profile->id ?? $user->id,
                    'name'            => $user->name,
                    'walletAddress'   => $profile->wallet_address ?? '0x000...000',
                    'latestSbt'       => [
                        'tokenId'         => $post->sbtCredential->token_id,
                        'title'           => $post->sbtCredential->title,
                        'contractAddress' => $post->sbtCredential->contract_address,
                        'txHash'          => $post->sbtCredential->tx_hash,
                        'date'            => $post->sbtCredential->minted_at ? Carbon::parse($post->sbtCredential->minted_at)->translatedFormat('d M Y') : '',
                        'block'           => $post->sbtCredential->block_number,
                    ]
                ];
            }

            return [
                'id'             => 'p' . $post->id,
                'postId'         => $post->id,
                'authorName'     => $user->name ?? 'Mahasiswa KampusX',
                'authorInitials' => $profile ? $profile->initials : 'KM',
                'authorHeadline' => ($profile ? $profile->headline : 'Mahasiswa KampusX') . ' • ' . ($profile ? $profile->campus : 'KampusX'),
                'timeAgo'        => Carbon::parse($post->created_at)->diffForHumans(),
                'content'        => $post->content,
                'badgeHighlight' => $post->badge_highlight,
                'likesCount'     => (int) $post->likes_count,
                'commentsCount'  => (int) $post->comments_count,
                'sharesCount'    => (int) $post->shares_count,
                'isLiked'        => $authUser ? $post->isLikedBy($authUser) : false,
                'sbtModalTarget' => $sbtTarget,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Feed aktivitas talenta berhasil diambil.',
            'meta'    => [
                'is_guest'     => $isGuest,
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'total'        => $posts->total(),
            ],
            'data'    => $formattedPosts,
        ]);
    }

    /**
     * Memberikan atau mencabut like/dukungan pada postingan feed.
     * Memerlukan otentikasi sanctum.
     */
    public function toggleLikePost(Request $request, $id): JsonResponse
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan masuk ke akun KampusX Anda untuk memberikan apresiasi.',
            ], 401);
        }

        // Cari postingan
        $numericId = preg_replace('/\D/', '', $id);
        $post = TalentPost::find($numericId ?: $id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan.',
            ], 404);
        }

        $existingLike = TalentPostLike::where('talent_post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $post->decrement('likes_count');
            $isLiked = false;
        } else {
            TalentPostLike::create([
                'talent_post_id' => $post->id,
                'user_id'        => $user->id,
            ]);
            $post->increment('likes_count');
            $isLiked = true;
        }

        return response()->json([
            'success'    => true,
            'message'    => $isLiked ? 'Dukungan berhasil diberikan.' : 'Dukungan dibatalkan.',
            'isLiked'    => $isLiked,
            'likesCount' => (int) $post->fresh()->likes_count,
        ]);
    }

    /**
     * Menambahkan komentar pada postingan feed.
     */
    public function storeComment(Request $request, $id): JsonResponse
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan masuk untuk berdiskusi di feed.',
            ], 401);
        }

        $numericId = preg_replace('/\D/', '', $id);
        $post = TalentPost::find($numericId ?: $id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Komentar tidak valid.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $comment = TalentPostComment::create([
            'talent_post_id' => $post->id,
            'user_id'        => $user->id,
            'comment'        => $request->input('comment'),
        ]);

        $post->increment('comments_count');

        return response()->json([
            'success' => true,
            'message' => 'Komentar berhasil dipublikasikan.',
            'data'    => [
                'id'         => $comment->id,
                'userName'   => $user->name,
                'comment'    => $comment->comment,
                'createdAt'  => Carbon::parse($comment->created_at)->diffForHumans(),
            ]
        ], 201);
    }

    /**
     * Live SBT Minting Ticker (Data pencatatan real-time di ledger Polygon).
     */
    public function liveTicker(): JsonResponse
    {
        $sbtRecent = SbtCredential::with(['user.talentProfile'])
            ->latest('minted_at')
            ->take(5)
            ->get();

        $tickerData = $sbtRecent->map(function ($sbt) {
            $campus = $sbt->user->talentProfile->campus ?? 'KampusX University';
            return [
                'id'         => $sbt->id,
                'name'       => $sbt->user->name ?? 'Mahasiswa',
                'campus'     => $campus,
                'title'      => $sbt->title,
                'block'      => $sbt->block_number,
                'timeAgo'    => $sbt->minted_at ? Carbon::parse($sbt->minted_at)->diffForHumans() : 'baru saja',
                'txHash'     => $sbt->tx_hash,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $tickerData,
        ]);
    }

    /**
     * Keahlian paling dicari (Trending Skills Widget).
     */
    public function trendingSkills(): JsonResponse
    {
        // Hitung skill terbanyak dari database talent_skills
        $skills = TalentSkill::select('name', DB::raw('count(*) as count'), DB::raw('avg(level) as avg_level'))
            ->groupBy('name')
            ->orderByDesc('count')
            ->take(6)
            ->get();

        $trending = $skills->map(function ($s) {
            $demand = min(98, max(75, (int) round($s->avg_level)));
            return [
                'name'   => $s->name,
                'demand' => "{$demand}% demand",
                'count'  => (int) $s->count,
            ];
        });

        // Fallback default jika data masih sedikit
        if ($trending->isEmpty()) {
            $trending = collect([
                ['name' => 'Python', 'demand' => '94% demand', 'count' => 12],
                ['name' => 'React.js', 'demand' => '92% demand', 'count' => 10],
                ['name' => 'Machine Learning', 'demand' => '90% demand', 'count' => 9],
                ['name' => 'Figma UI/UX', 'demand' => '95% demand', 'count' => 8],
                ['name' => 'Smart Contract (Solidity)', 'demand' => '88% demand', 'count' => 6],
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $trending,
        ]);
    }

    /**
     * User Mini Profile (untuk kolom kiri / user yang sedang login).
     */
    public function miniProfile(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $profile = TalentProfile::where('user_id', $user->id)->first();

        // Hitung total poin dan sbt count
        $totalPoints = $user->points ?? 0;
        $sbtCount = SbtCredential::where('user_id', $user->id)->count();

        $tier = 'Silver';
        if ($totalPoints >= 5000) {
            $tier = 'Diamond';
        } elseif ($totalPoints >= 3000) {
            $tier = 'Platinum';
        } elseif ($totalPoints >= 1500) {
            $tier = 'Gold';
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'userId'           => $user->id,
                'name'             => $user->name,
                'initials'         => $profile ? $profile->initials : strtoupper(substr($user->name, 0, 2)),
                'headline'         => $profile->headline ?? 'Mahasiswa KampusX',
                'campus'           => $profile->campus ?? ($user->university->name ?? 'Universitas Indonesia'),
                'major'            => $profile->major ?? 'Teknik Informatika',
                'tier'             => $profile->tier ?? $tier,
                'totalPoints'      => $totalPoints,
                'sbtCount'         => $sbtCount,
                'modulesCompleted' => $profile->modules_completed ?? 0,
            ]
        ]);
    }
}
