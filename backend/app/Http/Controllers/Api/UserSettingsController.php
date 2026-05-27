<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class UserSettingsController extends Controller
{
    /**
     * Get current user profile settings.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user()->load(['university', 'categories']);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update user profile settings (name, phone, university, avatar, interests).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'university_id' => 'nullable|exists:institutions,id',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // max 2MB
            'category_ids' => 'nullable|string' // usually sent as JSON string in form-data
        ]);

        // Handle Avatar Upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_path = $path;
        }

        // Update Basic Info
        $user->name = $validatedData['name'];
        if (isset($validatedData['phone'])) {
            $user->phone = $validatedData['phone'];
        }
        if (isset($validatedData['university_id'])) {
            $user->university_id = $validatedData['university_id'];
        }

        $user->save();

        // Update Interests (Categories)
        if ($request->filled('category_ids')) {
            $categoryIds = json_decode($validatedData['category_ids'], true);
            if (is_array($categoryIds)) {
                $user->categories()->sync($categoryIds);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user->load(['university', 'categories'])
        ]);
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Check if current password matches
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak sesuai.'
            ], 400);
        }

        // Update to new password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah.'
        ]);
    }
}
