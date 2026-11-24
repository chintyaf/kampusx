<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Controller untuk mengelola Webhook Gamifikasi & AI SRL Trigger
 * Sesuai Flow 1: Integrasi Modul AI Self-Regulated Learning (SRL).
 */
class GamificationWebhookController extends Controller
{
    /**
     * POST /api/webhook/srl-graduated
     * Menerima payload passing grade dari modul AI SRL.
     */
    public function srlGraduated(Request $request)
    {
        $validated = $request->validate([
            'user_id'        => 'required|exists:users,id',
            'modul_id'       => 'required|string',
            'score'          => 'required|numeric|min:0|max:100',
            'status_lulus'   => 'required|boolean',
            'student_name'   => 'nullable|string',
            'skill_category' => 'nullable|string',
        ]);

        $score = (float) $validated['score'];
        $isGraduated = filter_var($validated['status_lulus'], FILTER_VALIDATE_BOOLEAN);

        // Validasi passing grade (Passing grade minimal 80)
        if (!$isGraduated || $score < 80) {
            return response()->json([
                'success' => false,
                'status'  => 'rejected',
                'message' => 'Mahasiswa belum memenuhi passing grade kelulusan modul SRL (minimal 80/100). Poin gamifikasi tidak ditambahkan.',
                'data'    => [
                    'user_id'      => $validated['user_id'],
                    'modul_id'     => $validated['modul_id'],
                    'score'        => $score,
                    'status_lulus' => $isGraduated,
                ]
            ], 422);
        }

        DB::beginTransaction();
        try {
            /** @var User $user */
            $user = User::lockForUpdate()->findOrFail($validated['user_id']);

            // Skema pemberian poin gamifikasi berjenjang berdasarkan skor AI SRL:
            // Skor 90 - 100: 500 Poin (High Distinction)
            // Skor 80 - 89 : 300 Poin (Standard Passing)
            $awardedPoints = ($score >= 90) ? 500 : 300;
            $moduleName = $validated['skill_category'] 
                ? "{$validated['skill_category']} ({$validated['modul_id']})"
                : $validated['modul_id'];

            $result = $user->addPoints(
                $awardedPoints,
                "Bonus Kelulusan Modul AI SRL: {$moduleName} (Skor: {$score})",
                null,
                null
            );

            // Hitung ranking terkini user
            $currentRank = User::where('role', 'participant')->where('points', '>', $user->points)->count() + 1;

            // Eksekusi Step 7: Otomatisasi Minting Soulbound Token (ERC-5192) ke Polygon Ledger
            $sbtService = app(\App\Services\Blockchain\SoulboundTokenService::class);
            $sbtTitle = 'Certified Specialist: ' . ($validated['skill_category'] ?? 'Self-Regulated Learning Mastery');
            $sbtReceipt = $sbtService->mintSoulboundToken([
                'user_id'        => $user->id,
                'modul_id'       => $validated['modul_id'],
                'score'          => $score,
                'status_lulus'   => true,
                'student_name'   => $user->name,
                'wallet_address' => '0x' . substr(hash('sha256', $user->email . 'wallet'), 0, 40),
                'title'          => $sbtTitle,
                'skill_category' => $validated['skill_category'] ?? 'Artificial Intelligence'
            ]);

            // Sinkronkan ke tabel soulbound_tokens database
            \App\Models\SoulboundToken::updateOrCreate(
                ['user_id' => $user->id, 'title' => $sbtTitle],
                [
                    'ticket_code'      => $sbtReceipt['ticketCode'],
                    'token_id'         => $sbtReceipt['tokenId'],
                    'issuer'           => 'KampusX Verified Credentials & Pedagogy Center',
                    'tx_hash'          => $sbtReceipt['txHash'],
                    'contract_address' => \App\Services\Blockchain\SoulboundTokenService::CONTRACT_ADDRESS,
                    'wallet_address'   => $sbtReceipt['studentWallet'],
                    'block_number'     => $sbtReceipt['blockNumber'],
                    'standard'         => 'ERC-5192 (Soulbound / Non-Transferable)',
                    'cognitive_score'  => $score,
                    'skill_category'   => $validated['skill_category'] ?? 'Artificial Intelligence',
                    'token_uri'        => $sbtReceipt['tokenURI'] ?? 'ipfs://token.json',
                    'status'           => 'Success',
                    'minted_at'        => now(),
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Validasi modul AI SRL berhasil! Global Points ditambahkan, Tier diperbarui, dan Soulbound Token diterbitkan.',
                'data'    => [
                    'user_id'        => $user->id,
                    'student_name'   => $user->name,
                    'email'          => $user->email,
                    'modul_id'       => $validated['modul_id'],
                    'score'          => $score,
                    'points_awarded' => $result['points_awarded'],
                    'total_points'   => $result['total_points'],
                    'previous_tier'  => $result['previous_tier'],
                    'current_tier'   => $result['current_tier'],
                    'tier_upgraded'  => $result['tier_upgraded'],
                    'current_rank'   => $currentRank,
                    'skill_category' => $validated['skill_category'] ?? 'General Competency',
                    'sbt'            => [
                        'token_id'        => $sbtReceipt['tokenId'],
                        'title'           => $sbtReceipt['title'],
                        'tx_hash'         => $sbtReceipt['txHash'],
                        'standard'        => 'ERC-5192 (Soulbound Token)',
                        'block_number'    => $sbtReceipt['blockNumber'],
                        'network'         => 'Polygon POS Amoy Testnet',
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal memproses webhook kelulusan AI SRL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/webhook/add-instant-points
     * Manual adjustment poin untuk demo/admin — hanya bisa diakses admin atau localhost.
     * Setiap penambahan wajib menyertakan alasan untuk audit trail.
     */
    public function addInstantPoints(Request $request)
    {
        // Guard: hanya admin atau request dari localhost
        $actingUser = $request->user();
        $isLocalhost = in_array($request->ip(), ['127.0.0.1', '::1', 'localhost']);
        if (!$isLocalhost && (!$actingUser || $actingUser->role !== 'admin')) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak. Hanya admin yang dapat melakukan manual adjustment.'], 403);
        }

        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'points'  => 'required|integer|min:1|max:5000',
            'reason'  => 'required|string|min:5',
        ]);

        $userId = $request->input('user_id');
        $amount = (int) $request->input('points');
        $reason = $request->input('reason');

        $user = $userId ? \App\Models\User::find($userId) : null;
        if (!$user) {
            $user = $actingUser ?? \App\Models\User::where('role', 'participant')
                ->whereIn('email', ['2372016@maranatha.ac.id', 'part@kampusx.com'])->first();
        }

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        $result = $user->addPoints($amount, "Manual Adjustment: {$reason}");
        $newRank = \App\Models\User::where('role', 'participant')->where('points', '>', $user->points)->count() + 1;

        // Audit trail
        \Illuminate\Support\Facades\Log::info('Manual point adjustment by admin', [
            'acting_user'   => $actingUser?->id ?? 'system/localhost',
            'target_user'   => $user->id,
            'amount'        => $amount,
            'reason'        => $reason,
            'new_total'     => $result['total_points'],
            'tier_change'   => $result['tier_upgraded'] ? "{$result['previous_tier']} → {$result['current_tier']}" : 'no change',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Berhasil menambahkan {$amount} Global Points ke akun {$user->name}!",
            'data'    => [
                'user_id'       => $user->id,
                'user_name'     => $user->name,
                'points_added'  => $result['points_awarded'],
                'total_points'  => $result['total_points'],
                'previous_tier' => $result['previous_tier'],
                'current_tier'  => $result['current_tier'],
                'tier_upgraded' => $result['tier_upgraded'],
                'rank'          => $newRank,
                'adjusted_by'   => $actingUser?->email ?? 'localhost',
                'reason'        => $reason,
            ],
        ], 200);
    }

    /**
     * POST /api/webhook/reset-demo
     * Reset status demo user ke kondisi awal (Silver Tier, 2450 Poin) untuk rehearsal / demo baru.
     */
    public function resetDemo(Request $request)
    {
        $emails = ['2372016@maranatha.ac.id', 'part@kampusx.com'];
        $updated = [];
        foreach ($emails as $email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->points = 2450;
                $user->tier = 'Silver';
                $user->save();
                $updated[] = "{$user->name} ({$email})";
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status demo user berhasil di-reset ke Silver Tier (2.450 Poin)!',
            'data'    => [
                'users'        => $updated,
                'initial_tier' => 'Silver',
                'points'       => 2450
            ]
        ], 200);
    }
}
