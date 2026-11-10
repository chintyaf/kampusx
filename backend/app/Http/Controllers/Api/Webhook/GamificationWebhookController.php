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
            $currentRank = User::where('points', '>', $user->points)->count() + 1;

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Validasi modul AI SRL berhasil! Global Points ditambahkan dan Tier berhasil dihitung ulang.',
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
                    'skill_category' => $validated['skill_category'] ?? 'General Competency'
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
}
