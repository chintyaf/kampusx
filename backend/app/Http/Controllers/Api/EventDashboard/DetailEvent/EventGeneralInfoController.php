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
        $event = Event::select('id', 'title', 'description', 'image_path', 'timezone', 'checkin_window_start', 'checkin_window_end') // Hapus slug jika tidak dipakai
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
                'timezone'      => $event->timezone,
                'checkin_window_start' => $event->checkin_window_start,
                'checkin_window_end'   => $event->checkin_window_end,

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
            'timezone'           => 'required|timezone',
            'checkin_window_start' => 'nullable|integer|min:0',
            'checkin_window_end'   => 'nullable|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($event, $validated, $request) {

                // 1. Update Tabel Utama (Events)
                $updateData = [
                    'title'       => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'timezone'    => $validated['timezone'],
                    'checkin_window_start' => $validated['checkin_window_start'] ?? 30,
                    'checkin_window_end'   => $validated['checkin_window_end'] ?? 0,
                ];

                if ($request->hasFile('banner')) {
                    // 1. Ambil data event untuk cek file lama
                    if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
                        Storage::disk('public')->delete($event->image_path);
                    }

                    // 2. Simpan file baru di folder event-banners dengan nama unik
                    $extension = $request->file('banner')->getClientOriginalExtension();
                    $fileName = "banner_{$event->id}_" . time() . "_" . uniqid() . ".{$extension}";
                    $path = $request->file('banner')->storeAs("event-banners", $fileName, 'public');

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
            });

            // Kirim notifikasi setelah DB transaction selesai untuk mencegah long transaction lock
            $notified = false;
            try {
                $notified = $event->notifyParticipantsOfUpdate();
            } catch (\Exception $ne) {
                Log::warning("Gagal mengirim notifikasi update event ID {$eventId}: " . $ne->getMessage());
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Informasi event berhasil diperbarui',
                'notified_participants' => $notified,
            ]);

        } catch (\Exception $e) {
            Log::error("Update Event Error ID {$eventId}: " . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server saat mengupdate data.'
            ], 500);
        }
    }
}
