<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Institution;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminInstitutionController extends Controller
{
    // Super Admin: Create Institution & Assign Initial Owner
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'type' => 'required|in:university,company,student_org,community',
            'description' => 'nullable|string',
            'owner_email' => 'required|email|exists:users,email',
        ]);

        try {
            DB::beginTransaction();

            // Membuat institusi baru
            $institution = Institution::create([
                'name' => $request->name,
                // Tambahkan random suffix agar tak bentrok slug
                'slug' => Str::slug($request->name) . '-' . uniqid(),
                'type' => $request->type,
                'description' => $request->description,
            ]);

            // Cari user
            $owner = User::where('email', $request->owner_email)->first();
            
            // Connect sebagai owner
            $institution->users()->attach($owner->id, ['role' => 'owner']);
            
            // Angkat global rolenya jadi organizer
            if (!in_array($owner->role, ['admin', 'organizer', 'committee'])) {
                $owner->update(['role' => 'organizer']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Institusi berhasil dibuat dan ditautkan ke ' . $owner->name,
                'data' => $institution
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $institutions = Institution::with('users')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'data' => $institutions
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'type' => 'required|in:university,company,student_org,community',
            'description' => 'nullable|string',
        ]);

        $institution = Institution::findOrFail($id);
        $institution->update([
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil Institusi berhasil diubah.'
        ]);
    }

    public function destroy($id)
    {
        $institution = Institution::findOrFail($id);

        // Cari acara yang memakai institution_id ini (melindungi referensi)
        $usedCount = DB::table('events')->where('institution_id', $id)->count();
        
        if ($usedCount > 0) {
            return response()->json([
                'success' => false, 
                'message' => "Gagal menghapus institusi: Institusi ini sedang tercatat menyelenggarakan {$usedCount} acara."
            ], 400);
        }

        $institution->delete();

        return response()->json([
            'success' => true,
            'message' => 'Institusi berhasil dicabut dan dihapus.'
        ]);
    }
}
