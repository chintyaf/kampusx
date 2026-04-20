<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Institution;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class InstitutionMemberController extends Controller
{
    private function verifyAccess($institutionId, $userId) 
    {
        // Hanya Owner atau Admin (Event Creator) institusi yg boleh add/remove
        $pivot = DB::table('institution_user')
            ->where('institution_id', $institutionId)
            ->where('user_id', $userId)
            ->first();
            
        if (!$pivot || !in_array($pivot->role, ['owner', 'admin'])) {
            abort(403, 'Akses Ditolak. Anda bukan pengurus/tim inti institusi ini.');
        }
        return $pivot;
    }

    public function index(Request $request, $id)
    {
        $this->verifyAccess($id, $request->user()->id);
        
        $institution = Institution::with('users')->findOrFail($id);
        
        return response()->json([
            'data' => $institution->users
        ]);
    }

    public function store(Request $request, $id)
    {
        $this->verifyAccess($id, $request->user()->id);

        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:admin,member'
        ]);

        $institution = Institution::findOrFail($id);
        $user = User::where('email', $request->email)->first();

        // Check if already in
        $exists = DB::table('institution_user')
            ->where('institution_id', $id)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'User (Email) tersebut sudah terdaftar di tim institusi ini'], 400);
        }

        $institution->users()->attach($user->id, ['role' => $request->role]);

        // Promote to organizer globally if assigned as event creator (admin institusi)
        if ($request->role === 'admin' && !in_array($user->role, ['admin', 'organizer', 'committee'])) {
            $user->update(['role' => 'organizer']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Staff berhasil ditunjuk & ditambahkan sebagai ' . $request->role
        ]);
    }

    public function destroy(Request $request, $id, $userId)
    {
        $this->verifyAccess($id, $request->user()->id);

        $institution = Institution::findOrFail($id);
        
        // Prevent owner from deleting themselves quickly
        $pivot = DB::table('institution_user')->where('institution_id', $id)->where('user_id', $userId)->first();
        if ($pivot && $pivot->role === 'owner') {
             return response()->json(['message' => 'Tidak bisa mencabut akses Owner utama institusi'], 400);
        }

        $institution->users()->detach($userId);

        return response()->json([
            'success' => true,
            'message' => 'Akses perwakilan staff berhasil dicabut.'
        ]);
    }
}
