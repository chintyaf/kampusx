<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventTypeController extends Controller
{
    public function index()
    {
        $eventType = EventType::select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar tipe event berhasil diambil',
            'data'    => $eventType
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:150|unique:event_types,name']);
        $type = EventType::create(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Tipe event dibuat', 'data' => $type], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:150|unique:event_types,name,'.$id]);
        $type = EventType::findOrFail($id);
        $type->update(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Tipe event diperbarui', 'data' => $type], 200);
    }

    public function destroy($id)
    {
        // Cek pemakaian
        $usedCount = DB::table('event_types_event')->where('event_types_id', $id)->count();
        if ($usedCount > 0) {
            return response()->json(['success' => false, 'message' => 'Gagal! Tipe event ini sedang dipakai oleh ' . $usedCount . ' acara.'], 400);
        }

        $type = EventType::findOrFail($id);
        $type->delete();
        return response()->json(['success' => true, 'message' => 'Tipe event berhasil dihapus'], 200);
    }
}
