<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EventStation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Event;

class EventStationController extends Controller
{
    /**
     * Menampilkan daftar station (pos) untuk suatu event.
     */
    public function index(int $eventId)
    {
        $stations = EventStation::where('event_id', $eventId)->get(
            ['id', 'name', 'description', 'photo_path', 'is_active']
        );


        $event = \App\Models\Event::findOrFail($eventId);

        if (!$event->pos_pin) {
            // 2. Persiapkan array data utama (Gunakan nama $eventData)
            $pin = strtoupper(\Illuminate\Support\Str::random(6));
            while (Event::where('pos_pin', $pin)->exists()) {
                $pin = strtoupper(\Illuminate\Support\Str::random(6));
            }
            $event->update(['pos_pin' => $pin]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stations,
            'pos_pin' => $event->pos_pin,
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'start_date' => $event->start_date ? $event->start_date->format('Y-m-d H:i:s') : null,
                'end_date' => $event->end_date ? $event->end_date->format('Y-m-d H:i:s') : null,
                'timezone' => $event->timezone,
                'location_type' => $event->locationDetail->type ?? 'offline'
            ]
        ]);
    }

    /**
     * Menyimpan station baru.
     */
    public function store(Request $request, int $eventId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('stations', 'public');
        }

        $station = EventStation::create([
            'event_id' => $eventId,
            'name' => $request->name,
            'description' => $request->description,
            'photo_path' => $photoPath,
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
            'description' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $station = EventStation::where('id', $id)
            ->where('event_id', $eventId)
            ->firstOrFail();

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ];

        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($station->photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($station->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('stations', 'public');
        }

        $station->update($data);

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
    public function destroy(int $eventId, int $id)
    {
        $station = EventStation::where('id', $id)
            ->where('event_id', $eventId)
            ->firstOrFail();

        if ($station->photo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($station->photo_path);
        }

        $station->delete();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Data station berhasil dihapus.'
        ]);
    }


    
}
