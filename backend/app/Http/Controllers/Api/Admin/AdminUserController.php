<?php

namespace App\Http\Controllers\Api\Admin;

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
        $users = User::with('university')->orderBy('created_at', 'desc')->get();
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
            'university_id' => 'nullable|exists:institutions,id',
            'affiliation_valid_until' => 'nullable|date',
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
                'university_id' => $request->filled('university_id') ? $request->input('university_id') : null,
                'affiliation_valid_until' => $request->filled('affiliation_valid_until') ? $request->input('affiliation_valid_until') : null,
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
            'status_reason' => 'required_if:status,suspended,banned|nullable|string|max:255',
            'university_id' => 'nullable|exists:institutions,id',
            'affiliation_valid_until' => 'nullable|date',
            'is_verified' => 'required|boolean',
        ]);

        // Prevent logged-in admin from demoting or disabling themselves
        if (auth()->id() === $user->id) {
            if ($request->role !== 'admin' || $request->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak diperbolehkan mengubah peran atau menonaktifkan akun Admin Anda sendiri yang sedang digunakan.'
                ], 400);
            }
        }

        try {
            $statusReason = null;
            if ($request->status !== 'active') {
                $rawReason = $request->input('status_reason') ?? $request->input('reason');
                $reasonMap = [
                    'spam' => 'User melakukan spam',
                    'ticket_fraud' => 'Penipuan tiket',
                    'platform_violation' => 'Melanggar aturan platform',
                    'multi_account' => 'Membuat banyak akun (multi-account fraud)',
                ];
                $statusReason = $reasonMap[$rawReason] ?? $rawReason ?? $user->status_reason;
            }

            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'status' => $request->status,
                'status_reason' => $statusReason,
                'university_id' => $request->filled('university_id') ? $request->input('university_id') : null,
                'affiliation_valid_until' => $request->filled('affiliation_valid_until') ? $request->input('affiliation_valid_until') : null,
                'is_verified' => $request->is_verified,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $oldStatus = $user->status;
            $user->update($data);

            // Jika status berubah menjadi suspended atau banned, hapus token dan beri notifikasi
            if ($request->status !== $oldStatus && in_array($request->status, ['suspended', 'banned'])) {
                if ($request->status === 'suspended') {
                    $notificationMessage = 'PENTING: Akun Anda ditangguhkan (SUSPENDED) sementara oleh Admin Pusat.';
                    if ($statusReason) {
                        $notificationMessage .= ' Alasan penangguhan: ' . $statusReason . '.';
                    }
                    $notificationMessage .= ' Silakan hubungi dukungan pelanggan KampusX jika Anda merasa ini adalah kesalahan.';

                    $user->notify(new \App\Notifications\OperationalNotification(
                        'Keamanan Akun',
                        $notificationMessage,
                        'account_suspended'
                    ));
                } elseif ($request->status === 'banned') {
                    $notificationMessage = 'PERINGATAN: Akun Anda telah diblokir secara permanen (BANNED) dari platform KampusX.';
                    if ($statusReason) {
                        $notificationMessage .= ' Alasan pemblokiran: ' . $statusReason . '.';
                    }
                    $notificationMessage .= ' Tindakan ini bersifat final.';

                    $user->notify(new \App\Notifications\OperationalNotification(
                        'Keamanan Akun',
                        $notificationMessage,
                        'account_banned'
                    ));
                    $user->update(['is_verified' => false]);
                }

                // Membatalkan semua token jika akun di-suspend atau di-banned agar langsung ter-logout
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
