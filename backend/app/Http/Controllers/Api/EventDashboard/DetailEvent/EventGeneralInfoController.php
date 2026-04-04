<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Event;

class EventGeneralInfoController extends Controller
{
    /**
     * Mengambil data Event untuk form General Info (Method: GET)
     */
    public function index($eventId)
    {
        $event = Event::select('id', 'title', 'description', 'image_path') // Hapus slug jika tidak dipakai
            ->with([
                'categories' => function($query) {
                    $query->select('categories.id', 'categories.name');
                },
                'eventTypes' => function($query) { // Pastikan relasi ini ada di Model Event
                    $query->select('event_types.id', 'event_types.name');
                }
            ])
            ->where('id', $eventId)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'message' => 'Detail event berhasil diambil',
            'data' => [
                'title'         => $event->title,
                'description'   => $event->description,
                'banner'        => $event->banner_path ? url('storage/' . $event->banner_path) : null,

                // Menyesuaikan dengan response yang dibaca di useEffect React
                'tags_kategori' => $event->categories->map(function($cat) {
                    return [
                        'id'   => $cat->id,
                        'name' => $cat->name
                    ];
                }),

                // Menyesuaikan dengan response yang dibaca di useEffect React
                'event_types'   => $event->eventTypes->map(function($type) {
                    return [
                        'id'   => $type->id,
                        'name' => $type->name
                    ];
                })
            ]
        ]);
    }

    /**
     * Update data Event dari form General Info (Method: POST)
     */
    public function update(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        // Validasi Request yang dikirim dari React FormData
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'kategori_ids'       => 'nullable|array',
            'kategori_ids.*'     => 'nullable|exists:categories,id',
            'event_type_ids'     => 'nullable|array',
            'event_type_ids.*'   => 'nullable|exists:event_types,id',
            'banner'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048' // Max 2MB
        ]);

        try {
            return DB::transaction(function () use ($event, $validated, $request) {

                // 1. Update Tabel Utama (Events)
                $updateData = [
                    'title'       => $validated['title'],
                    'description' => $validated['description'] ?? null,
                ];

                // 2. Handle Upload Banner Jika Ada
                if ($request->hasFile('banner')) {
                    // Hapus banner lama jika ada
                    if ($event->banner_path && Storage::disk('public')->exists($event->banner_path)) {
                        Storage::disk('public')->delete($event->banner_path);
                    }

                    // Simpan banner baru
                    $path = $request->file('banner')->store('event-banners', 'public');
                    $updateData['banner_path'] = $path;
                }

                $event->update($updateData);

                // 3. Update Relasi Kategori (Many to Many)
                $categoryIds = $validated['kategori_ids'] ?? [];
                $event->categories()->sync($categoryIds);

                // 4. Update Relasi Event Types (Many to Many)
                $eventTypeIds = $validated['event_type_ids'] ?? [];
                // Sesuaikan nama relasi dengan yang ada di Model Event
                $event->eventTypes()->sync($eventTypeIds);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Informasi event berhasil diperbarui',
                ]);
            });

        } catch (\Exception $e) {
            Log::error("Update Event Error ID {$eventId}: " . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server saat mengupdate data.'
            ], 500);
        }
    }
}
