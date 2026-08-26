<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\SrlForethought;
use App\Models\SrlReflection;
use App\Models\PointTransaction;

class SrlApiController extends Controller
{
    /**
     * Get learning path progress of all enrolled modules for the user.
     */
    public function getProgress(Request $request)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $progressList = DB::table('user_learning_paths')
                ->where('user_id', $userId)
                ->get();

            $progressMap = [];
            foreach ($progressList as $p) {
                $progressMap[$p->learning_path_id] = [
                    'status' => $p->status,
                    'progress_percentage' => $p->progress_percentage
                ];
            }

            return response()->json([
                'success' => true,
                'progress' => $progressMap
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil progres SRL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SRL forethought planning and path progress for a specific module.
     */
    public function getStatus($moduleId)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $forethought = SrlForethought::where('user_id', $userId)
                ->where('learning_path_id', $moduleId)
                ->first();

            $progress = DB::table('user_learning_paths')
                ->where('user_id', $userId)
                ->where('learning_path_id', $moduleId)
                ->first();

            return response()->json([
                'success' => true,
                'is_planned' => !is_null($forethought),
                'goals' => $forethought,
                'progress' => $progress ? [
                    'status' => $progress->status,
                    'progress_percentage' => $progress->progress_percentage
                ] : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memeriksa status SRL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save/update the Forethought (planning) step for a module.
     */
    public function saveForethought(Request $request)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $request->validate([
                'moduleId' => 'required|integer',
                'learning_goals' => 'nullable|string',
                'estimated_time_minutes' => 'nullable|integer',
            ]);

            $moduleId = $request->input('moduleId');

            $forethought = SrlForethought::updateOrCreate(
                [
                    'user_id' => $userId,
                    'learning_path_id' => $moduleId,
                ],
                [
                    'learning_goals' => $request->input('learning_goals'),
                    'estimated_time_minutes' => $request->input('estimated_time_minutes', 0),
                ]
            );

            // Update status in user_learning_paths to 'in_progress' if not already completed
            $currentProgress = DB::table('user_learning_paths')
                ->where('user_id', $userId)
                ->where('learning_path_id', $moduleId)
                ->first();

            $statusToSet = ($currentProgress && $currentProgress->status === 'completed') ? 'completed' : 'in_progress';

            DB::table('user_learning_paths')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'learning_path_id' => $moduleId,
                ],
                [
                    'status' => $statusToSet,
                    'updated_at' => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Rencana belajar (Forethought) berhasil disimpan.',
                'goals' => $forethought
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan rencana belajar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save/update the Self-Reflection step and mark module as completed.
     */
    public function saveReflection(Request $request)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $request->validate([
                'moduleId' => 'required|integer',
                'reflection_note' => 'required|string',
                'understanding_level' => 'required|integer|min:1|max:5',
                'points_awarded' => 'nullable|integer',
            ]);

            $moduleId = $request->input('moduleId');

            // Resolve module ID inside database to link relations
            $dbModuleId = DB::table('modules')
                ->where('learning_path_id', $moduleId)
                ->orderBy('sequence_order', 'asc')
                ->value('id');

            if (!$dbModuleId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Modul data tidak ditemukan di database.'
                ], 404);
            }

            // Resolve first lesson ID associated with this module
            $lessonId = DB::table('lessons')
                ->where('module_id', $dbModuleId)
                ->orderBy('sequence_order', 'asc')
                ->value('id');

            if (!$lessonId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lesson data tidak ditemukan untuk modul ini.'
                ], 404);
            }

            // Save or Update reflection
            $reflection = SrlReflection::updateOrCreate(
                [
                    'user_id' => $userId,
                    'module_id' => $dbModuleId,
                ],
                [
                    'lesson_id' => $lessonId, // Storing matching lesson ID
                    'reflection_note' => $request->input('reflection_note'),
                    'understanding_level' => $request->input('understanding_level'),
                ]
            );

            // Complete the learning path
            DB::table('user_learning_paths')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'learning_path_id' => $moduleId,
                ],
                [
                    'status' => 'completed',
                    'progress_percentage' => 100,
                    'completed_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Award points
            $points = (int) $request->input('points_awarded', 0);
            if ($points > 0) {
                $exists = PointTransaction::where('user_id', $userId)
                    ->where('type', 'global')
                    ->where('description', 'like', "%Menyelesaikan modul Microlearning: $moduleId%")
                    ->exists();

                if (!$exists) {
                    PointTransaction::create([
                        'user_id' => $userId,
                        'amount' => $points,
                        'type' => 'global',
                        'description' => "Menyelesaikan modul Microlearning: $moduleId"
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Evaluasi diri dan refleksi (Self-Reflection) berhasil disimpan.',
                'reflection' => $reflection
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan refleksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
