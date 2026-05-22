<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PersonalizationController extends Controller
{
    /**
     * Menyimpan pilihan kategori minat user.
     */
    public function saveInterests(Request $request)
    {
        $request->validate([
            'category_ids' => 'required|array|min:3',
            'category_ids.*' => 'exists:categories,id'
        ]);

        $user = $request->user();
        
        // Sync akan menghapus yang lama dan memasukkan yang baru
        $user->categories()->sync($request->category_ids);

        return response()->json([
            'success' => true,
            'message' => 'Minat profil berhasil diperbarui!'
        ], 200);
    }
}
