<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    /**
     * Store a newly created user in the database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,organizer,committee,participant',
            'status' => 'required|in:active,suspended,banned',
            'is_verified' => 'required|boolean',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->status,
                'is_verified' => $request->is_verified,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User berhasil ditambahkan.',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user in the database.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,organizer,committee,participant',
            'status' => 'required|in:active,suspended,banned',
            'is_verified' => 'required|boolean',
        ]);

        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'status' => $request->status,
                'is_verified' => $request->is_verified,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            // If the user's status is changed to banned, revoke all active sessions/tokens
            if ($request->status === 'banned') {
                $user->tokens()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Data user berhasil diperbarui.',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user from the database.
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent logged-in admin from deleting themselves
            if (auth()->id() === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak diperbolehkan menghapus akun Anda sendiri yang sedang digunakan.'
                ], 400);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus dari sistem.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage()
            ], 500);
        }
    }
}
