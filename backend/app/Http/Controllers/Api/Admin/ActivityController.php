<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ActivityController extends Controller
{
    /**
     * Display a listing of activities.
     */
    public function index()
    {
        $activities = Activity::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $activities
        ], 200);
    }

    /**
     * Store a newly created activity in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'slug' => 'required|string|max:100|unique:activities,slug',
            'points_rewarded' => 'required|integer',
            'type' => 'required|in:global,local',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            $activity = Activity::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'points_rewarded' => $request->points_rewarded,
                'type' => $request->type,
                'description' => $request->description,
                'is_active' => $request->input('is_active', true),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Aktivitas berhasil dibuat.',
                'data' => $activity
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat aktivitas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified activity.
     */
    public function show($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $activity
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Aktivitas tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * Update the specified activity in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $activity = Activity::findOrFail($id);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Aktivitas tidak ditemukan.'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:150',
            'slug' => [
                'required',
                'string',
                'max:100',
                Rule::unique('activities', 'slug')->ignore($activity->id),
            ],
            'points_rewarded' => 'required|integer',
            'type' => 'required|in:global,local',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            $activity->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'points_rewarded' => $request->points_rewarded,
                'type' => $request->type,
                'description' => $request->description,
                'is_active' => $request->input('is_active', $activity->is_active),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Aktivitas berhasil diperbarui.',
                'data' => $activity
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui aktivitas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified activity from storage.
     */
    public function destroy($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->delete();
            return response()->json([
                'success' => true,
                'message' => 'Aktivitas berhasil dihapus.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Aktivitas tidak ditemukan atau gagal dihapus: ' . $e->getMessage()
            ], 500);
        }
    }
}
