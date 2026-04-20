<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::select('id', 'name')->get();
        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil',
            'data'    => $categories
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:100|unique:categories,name']);
        $cat = Category::create(['name' => $request->name]);
        
        return response()->json(['success' => true, 'message' => 'Kategori dibuat', 'data' => $cat], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:100|unique:categories,name,'.$id]);
        $cat = Category::findOrFail($id);
        $cat->update(['name' => $request->name]);
        
        return response()->json(['success' => true, 'message' => 'Kategori diperbarui', 'data' => $cat], 200);
    }

    public function destroy($id)
    {
        // Cek apakah masih ada event yang memakai kategori ini
        $usedCount = DB::table('event_categories')->where('category_id', $id)->count();
        if ($usedCount > 0) {
            return response()->json(['success' => false, 'message' => 'Gagal! Kategori ini sedang dipakai oleh ' . $usedCount . ' acara.'], 400);
        }

        $cat = Category::findOrFail($id);
        $cat->delete();
        
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus'], 200);
    }
}
