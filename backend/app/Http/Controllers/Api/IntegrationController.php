<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ExternalAchievement;
use App\Models\IntegrationLog;
use App\Models\SoulboundToken;
use App\Services\Gamification\GamificationService;
use App\Services\Blockchain\SoulboundTokenService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class IntegrationController extends Controller
{
    protected GamificationService $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * POST /api/integrations/achievements
     * Endpoint penerima callback eksternal dari modul AI SRL (Chintya)
     */
    public function receiveAchievement(Request $request)
    {
        $payload = $request->all();

        $validated = $request->validate([
            'external_reference' => 'required|string',
            'student_id'         => 'required',
            'achievement_type'   => 'required|string',
            'achievement_name'   => 'required|string',
            'description'        => 'nullable|string',
            'score'              => 'required|numeric|min:0|max:100',
            'completed_at'       => 'nullable|string',
        ]);

        $externalRef = trim($validated['external_reference']);

        // 1. Validasi idempotency / pencegahan duplikasi payload
        $existing = ExternalAchievement::where('external_reference', $externalRef)->first();
        if ($existing) {
            IntegrationLog::create([
                'external_reference' => $externalRef,
                'user_id'            => $existing->user_id,
                'source_system'      => 'AI-SRL-Engine',
                'endpoint'           => '/api/integrations/achievements',
                'request_payload'    => $payload,
                'status'             => 'DUPLICATE',
                'processing_result'  => "Request diabaikan karena external_reference '{$externalRef}' sudah pernah diproses sebelumnya.",
                'points_result'      => 0,
                'credential_status'  => 'ALREADY_EXISTS',
            ]);

            return response()->json([
                'success' => false,
                'status'  => 'duplicate',
                'message' => "Pencapaian dengan referensi {$externalRef} sudah pernah tercatat.",
                'data'    => $existing,
            ], 409);
        }

        // 2. Cari target mahasiswa di database
        $studentId = $validated['student_id'];
        $user = User::find($studentId);
        if (!$user) {
            $user = User::where('role', 'participant')->first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => "Mahasiswa dengan ID {$studentId} tidak ditemukan di sistem.",
            ], 404);
        }

        $score = (float) $validated['score'];
        $type = strtoupper($validated['achievement_type']);
        $completedAt = !empty($validated['completed_at'])
            ? Carbon::parse($validated['completed_at'])
            : Carbon::now();

        // 3. Tentukan perolehan poin berdasarkan tipe aktivitas dan passing grade
        // Microlearning completion: 30 pts (+20 pts bonus jika score >= 90)
        // Quiz: 20 pts
        // Challenge: 100 pts
        $points = 30;
        if (str_contains($type, 'QUIZ')) {
            $points = ($score >= 100) ? 50 : 20;
        } elseif (str_contains($type, 'CHALLENGE')) {
            $points = 100;
        } else {
            $points = ($score >= 90) ? 50 : 30;
        }

        DB::beginTransaction();
        try {
            // 4. Simpan ke external_achievements
            $achievement = ExternalAchievement::create([
                'external_reference' => $externalRef,
                'user_id'            => $user->id,
                'achievement_type'   => $type,
                'achievement_name'   => $validated['achievement_name'],
                'description'        => $validated['description'] ?? 'Pencapaian dari modul AI SRL',
                'score'              => $score,
                'points_awarded'     => $points,
                'completed_at'       => $completedAt,
            ]);

            // 5. Berikan poin dan evaluasi Tier serta Badge secara otomatis
            $pointsResult = $this->gamificationService->awardPoints(
                $user,
                $points,
                "Kelulusan AI SRL: {$validated['achievement_name']} (Skor: {$score})",
                'microlearning',
                $externalRef
            );

            // 6. Jika score memenuhi kriteria kredensial (score >= 80), buat draft kredensial PENDING untuk minting SBT
            $credentialStatus = 'NONE';
            $credentialId = null;

            if ($score >= 80) {
                $rawNum = rand(100, 999);
                $ticketCode = 'CERT-' . date('Y') . '-' . str_pad($rawNum, 4, '0', STR_PAD_LEFT);
                $tokenId = '#SBT-' . date('Y') . '-' . str_pad($rawNum, 4, '0', STR_PAD_LEFT);

                $userWallet = '0x' . substr(hash('sha256', $user->email . 'wallet_seed'), 0, 40);

                $sbt = SoulboundToken::create([
                    'user_id'           => $user->id,
                    'credential_code'   => $externalRef,
                    'ticket_code'       => $ticketCode,
                    'token_id'          => $tokenId,
                    'title'             => $validated['achievement_name'],
                    'issuer'            => 'KampusX Verified Authority & Academic Center',
                    'tx_hash'           => '0x' . hash('sha256', $externalRef . microtime(true)),
                    'contract_address'  => SoulboundTokenService::CONTRACT_ADDRESS,
                    'wallet_address'    => $userWallet,
                    'block_number'      => (string) rand(58200000, 58299999),
                    'standard'          => 'ERC-5192 (Soulbound / Non-Transferable)',
                    'cognitive_score'   => (int) $score,
                    'skill_category'    => 'Fullstack & Cloud Engineering',
                    'token_uri'         => 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/token-' . $rawNum . '.json',
                    'status'            => 'active',
                    'minting_status'    => 'PENDING', // Menunggu persetujuan Admin di Credential Management
                    'minted_at'         => null,
                ]);

                $credentialStatus = 'PENDING';
                $credentialId = $sbt->id;
            }

            // 7. Simpan log integrasi lengkap
            IntegrationLog::create([
                'external_reference' => $externalRef,
                'user_id'            => $user->id,
                'source_system'      => 'AI-SRL-Engine',
                'endpoint'           => '/api/integrations/achievements',
                'request_payload'    => $payload,
                'status'             => 'SUCCESS',
                'processing_result'  => "Berhasil memproses pencapaian. Poin: +{$points}, Tier Terkini: {$pointsResult['current_tier']}, Kredensial: {$credentialStatus}",
                'points_result'      => $points,
                'credential_status'  => $credentialStatus,
                'credential_id'      => $credentialId,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'processed',
                'message' => 'Integrasi AI SRL berhasil diproses. Poin gamifikasi dan kredensial PENDING telah dibuat.',
                'data'    => [
                    'external_reference' => $externalRef,
                    'student'            => [
                        'id'           => $user->id,
                        'name'         => $user->name,
                        'total_points' => $pointsResult['total_points'],
                        'tier'         => $pointsResult['current_tier'],
                        'tier_upgraded'=> $pointsResult['tier_upgraded'],
                    ],
                    'points_awarded'     => $points,
                    'unlocked_badges'    => $pointsResult['unlocked_badges'],
                    'credential'         => [
                        'id'             => $credentialId,
                        'status'         => $credentialStatus,
                        'note'           => 'Kredensial berstatus PENDING siap diterbitkan (Issue SBT) oleh Admin.'
                    ]
                ]
            ], 200);

        } catch (\Throwable $e) {
            DB::rollBack();

            IntegrationLog::create([
                'external_reference' => $externalRef,
                'user_id'            => $user->id ?? null,
                'source_system'      => 'AI-SRL-Engine',
                'endpoint'           => '/api/integrations/achievements',
                'request_payload'    => $payload,
                'status'             => 'FAILED',
                'processing_result'  => 'Error: ' . $e->getMessage(),
                'points_result'      => 0,
                'credential_status'  => 'FAILED',
            ]);

            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal memproses integrasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/integrations/logs
     * Riwayat log callback sistem eksternal AI SRL
     */
    public function logs(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);

        $logs = IntegrationLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Integration Logs berhasil dimuat.',
            'data'    => $logs->items(),
            'meta'    => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'total'        => $logs->total(),
            ]
        ], 200);
    }

    /**
     * POST /api/integrations/demo-trigger
     * Tombol Simulasi Callback AI SRL (Chintya)
     */
    public function demoTrigger(Request $request)
    {
        $studentId = $request->input('student_id');
        $user = null;

        if ($studentId) {
            $user = User::find($studentId);
        }

        if (!$user) {
            $user = User::where('email', 'part@kampusx.com')->first()
                ?: User::where('role', 'participant')->first();
        }

        $randomRef = 'SRL-' . date('Y') . '-' . rand(100, 999) . '-' . time();

        $payload = [
            'external_reference' => $randomRef,
            'student_id'         => $user ? $user->id : 2,
            'achievement_type'   => 'MICROLEARNING_COMPLETION',
            'achievement_name'   => 'Fullstack Microservices & Cloud Engineering',
            'description'        => 'Successfully completed the learning program with outstanding cognitive reflection.',
            'score'              => 95,
            'completed_at'       => Carbon::now()->toIso8601String(),
        ];

        $syntheticRequest = new Request($payload);
        return $this->receiveAchievement($syntheticRequest);
    }

    /**
     * POST /api/integrations/reset-demo
     * Reset status Budi Pratama (part@kampusx.com) ke kondisi awal 450 Poin (Tier: Silver)
     */
    public function resetDemo(Request $request)
    {
        $studentId = $request->input('student_id');
        $user = $studentId ? User::find($studentId) : User::where('email', 'part@kampusx.com')->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Mahasiswa tidak ditemukan.'
            ], 404);
        }

        $user->points = 450;
        $user->tier = 'Silver';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Poin mahasiswa {$user->name} berhasil di-reset ke 450 Poin (Tier: Silver)",
            'data'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'points' => 450,
                'tier'   => 'Silver'
            ]
        ], 200);
    }
}
