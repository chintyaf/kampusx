<?php

namespace App\Http\Controllers\Api\EventDas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class EventDetailController extends Controller
{
    public function getGeneralInfo($eventId)
    {
        $event = Event::select('id', 'title', 'slug', 'description')
            ->with(['categories' => function($query) {
                $query->select('categories.id', 'categories.name');
            }])
            ->where('id', $eventId)
            ->firstOrFail();

        // 3. Gunakan helper url() atau config('app.url') agar lebih dinamis dibanding hardcode domain
        return response()->json([
            'status' => 'success',
            'message' => 'Detail event berhasil diambil',
            'data' => [
                'title'    => $event->title,
                'slug'     => $event->slug,
                'description'      => $event->description,
                'selectedKategori'  => $event->categories->map(function($cat) {
                    return [
                        'id'   => $cat->id,
                        'nama' => $cat->name
                    ];
                }),
                'full_url'       => url("/events/{$event->slug}")
            ]
        ]);
    }

    public function updateGeneralInfo(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:events,slug,' . $eventId,
            'description' => 'nullable|string',
            'categories'  => 'nullable|array',
            'categories.*'=> 'exists:categories,id'
        ]);

        try {
            return \DB::transaction(function () use ($event, $validated) {

                $event->update([
                    'title'       => $validated['title'],
                    'slug'        => $validated['slug'] ?? $event->slug,
                    'description' => $validated['description'] ?? null,
                ]);

                // 4. Update Relasi Kategori
                // Jika categories tidak dikirim atau null, kosongkan relasi (sync array kosong)
                $categoryIds = $validated['categories'] ?? [];
                $event->categories()->sync($categoryIds);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Informasi event berhasil diperbarui',
                ]);
            });

        } catch (\Exception $e) {
            \Log::error("Update Event Error ID {$eventId}: " . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);
        }
    }

    public function getLocation($eventId) {
        // 1. Cari event berdasarkan ID (findOrFail akan otomatis memunculkan 404 jika ID tidak ada)
        $event = Event::with('locationDetail')->findOrFail($eventId);
        $location = $event->locationDetail;

        // 2. Format data lokasi sesuai kebutuhan Anda
        $data = [
            'type' => $location->type,
            'platform' => $location->platform,
            'meeting_link' => $location->meeting_link, // Sesuaikan dengan nama kolom offline Anda
            'online_instruction' => $location->online_instruction, // Sesuaikan dengan nama kolom offline Anda
            'online_quota' => $location->online_quota, // Sesuaikan dengan nama kolom offline Anda
        ];

        // 3. Kembalikan data (contoh berupa JSON)
        return response()->json([
            'status' => "sucesss",
            'data' => $data
        ]);
    }

    public function setLocation(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        // Validasi langsung menggunakan nama field dari frontend
        $validated = $request->validate([
            'type'               => 'required|in:online,offline,hybrid',

            // Online
            'platform'           => 'nullable|string',
            'meeting_link'       => 'required_if:type,online,hybrid|nullable|url',
            'online_instruction' => 'nullable|string',

            // Offline
            'location'           => 'required_if:type,offline,hybrid|nullable|string',
            'location_detail'    => 'nullable|string',
            'maps_url'           => 'nullable|url',
            'offline_instruction' => 'nullable|string',

            // 1. Tangkap boolean dari frontend
            'is_online_quota_unlimited'  => 'nullable|boolean',
            'is_offline_quota_unlimited' => 'nullable|boolean',

            // Pengaturan Kuota
            'online_quota'       => 'nullable|integer|min:0',
            'offline_quota'      => 'nullable|integer|min:0',
        ], [
            'online_quota.required_if' => 'Kuota online wajib diisi jika tidak unlimited.',
            'offline_quota.required_if' => 'Kuota offline wajib diisi jika tidak unlimited.'
        ]);

        // Bersihkan data yang tidak relevan jika tipenya bukan hybrid
        if ($validated['type'] === 'online') {
            $validated['is_offline_quota_unlimited'] = false;
            $validated['offline_quota'] = null;
        } elseif ($validated['type'] === 'offline') {
            $validated['is_online_quota_unlimited'] = false;
            $validated['online_quota'] = null;
        }

        // Terapkan logika unlimited Anda
        $validated['online_quota'] = ($validated['is_online_quota_unlimited'] ?? false) ? null : ($validated['online_quota'] ?? null);

        $validated['offline_quota'] = ($validated['is_offline_quota_unlimited'] ?? false) ? null : ($validated['offline_quota'] ?? null);

        try {
            return \DB::transaction(function () use ($event, $validated) {
                $event->locationDetail()->updateOrCreate(
                    ['event_id' => $event->id],
                    $validated
                );

                return response()->json(['status' => 'success', 'message' => 'Lokasi berhasil diperbarui']);
            });
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
