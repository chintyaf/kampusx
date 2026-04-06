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
                'banner'        => $event->image_path ? url('storage/' . $event->image_path ) : null,

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
            'banner'             => $request->hasFile('banner')
                            ? 'image|mimes:jpeg,png,jpg,webp|max:2048'
                            : 'nullable',
        ]);

        try {
            return DB::transaction(function () use ($event, $validated, $request) {

                // 1. Update Tabel Utama (Events)
                $updateData = [
                    'title'       => $validated['title'],
                    'description' => $validated['description'] ?? null,
                ];

              // Di dalam method update(Request $request, $eventId)
                if ($request->hasFile('banner')) {
                    // 1. Ambil data event untuk cek file lama
                    // Pastikan menggunakan kolom yang konsisten (image_path)
                    if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
                        Storage::disk('public')->delete($event->image_path);
                    }

                    // 2. Simpan file baru dengan path berdasarkan eventId
                    // Opsi A: Folder berdasarkan eventId, nama file random (Direkomendasikan)
                    // $path = $request->file('banner')->store("events/{$event->id}/banner", 'public');

                    // /* Opsi B: Jika ingin nama filenya juga mengandung ID, misal: banner_123.jpg
                    $extension = $request->file('banner')->getClientOriginalExtension();
                    $fileName = "banner_" . time() . "." . $extension;
                    $path = $request->file('banner')->storeAs("events/{$event->id}", $fileName, 'public');


                    $updateData['image_path'] = $path;
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
