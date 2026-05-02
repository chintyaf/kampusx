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
    public function index($eventId)
    {
        $stations = EventStation::where('event_id', $eventId)->get(
            ['id', 'name', 'access_code', 'is_active']
        );

        return response()->json([
            'status' => 'success',
            'data' => $stations
        ]);
    }

    /**
     * Menyimpan station baru.
     */
    public function store(Request $request, $eventId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Generate kode unik
        do {
            $accessCode = strtoupper(Str::random(6));
        } while (EventStation::where('access_code', $accessCode)->exists());

        $station = EventStation::create([
            'event_id' => $eventId,
            'name' => $request->name,
            'access_code' => $accessCode,
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
    public function update(Request $request, $eventId, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $station = EventStation::where('id', $id)
            ->where('event_id', $eventId)
            ->firstOrFail();

        $station->update([
            'name' => $request->name,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Data station berhasil diperbarui.',
            'data' => $station
        ]);
    }

    /**
     * Menghapus data station.
     */
    public function destroy($eventId, $id)
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
