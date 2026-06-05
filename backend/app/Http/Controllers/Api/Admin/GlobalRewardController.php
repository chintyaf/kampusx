<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GlobalRewardController extends Controller
{
    /**
     * Display a listing of global rewards.
     */
    public function index()
    {
        $rewards = Reward::whereNull('event_id')
            ->where('type', 'global')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rewards
        ], 200);
    }

    /**
     * Store a newly created global reward in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'points_cost' => 'required|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'limit_per_user' => 'nullable|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'reward_type' => 'required|in:physical,digital',
            'is_active' => 'boolean',
        ]);

        try {
            $data = $request->only([
                'title', 'description', 'points_cost', 'stock', 
                'limit_per_user', 'reward_type'
            ]);
            
            // Force strict instructions
            $data['event_id'] = null;
            $data['type'] = 'global';
            $data['is_active'] = $request->input('is_active', true);

            // Handle image upload
            if ($request->hasFile('image')) {
                $extension = $request->file('image')->getClientOriginalExtension();
                $fileName = "reward_" . time() . "_" . uniqid() . "." . $extension;
                $path = $request->file('image')->storeAs("rewards", $fileName, 'public');
                $data['image_path'] = $path;
            }

            $reward = Reward::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Reward global berhasil dibuat.',
                'data' => $reward
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat reward global: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified global reward.
     */
    public function show($id)
    {
        try {
            // Retrieve only if it's a global reward
            $reward = Reward::whereNull('event_id')
                ->where('type', 'global')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $reward
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reward global tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * Update the specified global reward in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            // Retrieve only if it's a global reward
            $reward = Reward::whereNull('event_id')
                ->where('type', 'global')
                ->findOrFail($id);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reward global tidak ditemukan.'
            ], 404);
        }

        $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'points_cost' => 'required|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'limit_per_user' => 'nullable|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'reward_type' => 'required|in:physical,digital',
            'is_active' => 'boolean',
        ]);

        try {
            $data = $request->only([
                'title', 'description', 'points_cost', 'stock', 
                'limit_per_user', 'reward_type'
            ]);

            // Force strict instructions
            $data['event_id'] = null;
            $data['type'] = 'global';
            if ($request->has('is_active')) {
                $data['is_active'] = $request->input('is_active');
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($reward->image_path && Storage::disk('public')->exists($reward->image_path)) {
                    Storage::disk('public')->delete($reward->image_path);
                }

                $extension = $request->file('image')->getClientOriginalExtension();
                $fileName = "reward_" . time() . "_" . uniqid() . "." . $extension;
                $path = $request->file('image')->storeAs("rewards", $fileName, 'public');
                $data['image_path'] = $path;
            }

            $reward->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Reward global berhasil diperbarui.',
                'data' => $reward
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui reward global: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified global reward from storage.
     */
    public function destroy($id)
    {
        try {
            $reward = Reward::whereNull('event_id')
                ->where('type', 'global')
                ->findOrFail($id);

            // Delete image file if exists
            if ($reward->image_path && Storage::disk('public')->exists($reward->image_path)) {
                Storage::disk('public')->delete($reward->image_path);
            }

            $reward->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reward global berhasil dihapus.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reward global tidak ditemukan atau gagal dihapus.'
            ], 404);
        }
    }
}
