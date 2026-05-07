<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EventStation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class EventStationController extends Controller
{
    /**
     * Menampilkan daftar station (pos) untuk suatu event.
     */
    public function index(int $eventId)
    {
        $stations = EventStation::where('event_id', $eventId)->get(
            ['id', 'name', 'description', 'is_active']
        );

        return response()->json([
            'status' => 'success',
            'data' => $stations
        ]);
    }

    /**
     * Menyimpan station baru.
     */
    public function store(Request $request, int $eventId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'string|max:255',
            'is_active' => 'boolean',
        ]);

        $station = EventStation::create([
            'event_id' => $eventId,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Data station berhasil ditambahkan.',
            'data' => $station
        ], 201);
    }

    /**
     * Memperbarui data station. (Edit)
     */
    public function update(Request $request, int $eventId, int $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'string|max:255',
            'is_active' => 'boolean',
        ]);

        $station = EventStation::where('id', $id)
            ->where('event_id', $eventId)
            ->firstOrFail();

        $station->update([
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Data station berhasil diperbarui.',
        ]);
    }

    /**
     * Menghapus data station.
     */
    public function destroy(int $eventId, int $id)
    {
        $station = EventStation::where('id', $id)
            ->where('event_id', $eventId)
            ->firstOrFail();

        $station->delete();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Data station berhasil dihapus.'
        ]);
    }
}
