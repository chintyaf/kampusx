<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class EventDashboardController extends Controller
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

    public function getOverview($eventId)
    {
        $event = Event::with(['categories', 'institution', 'locationDetail', 'organizer'])->findOrFail($eventId);

        $locationText = 'Belum diatur';
        if ($event->locationDetail) {
            if ($event->locationDetail->type === 'online') {
                $locationText = "Online (" . ($event->locationDetail->platform ?? 'Platform tidak diketahui') . ")";
            } else {
                $locationText = $event->locationDetail->location_name ?? 'Lokasi Offline';
            }
        }

        $now = now();
        $isPublished = in_array($event->status, ['published', 'ongoing', 'archived', 'completed']);
        
        $timeline = [
            [
                'label' => 'Draft',
                'date' => $event->created_at ? $event->created_at->format('d M Y') : 'Baru dibuat',
                'status' => 'done'
            ],
            [
                'label' => 'Published',
                'date' => $isPublished ? 'Sudah Live' : 'Menunggu',
                'status' => $isPublished ? 'done' : 'pending'
            ]
        ];

        $isRegActive = $isPublished && $event->start_date && $now->lt($event->start_date);
        $timeline[] = [
            'label' => 'Registrasi',
            'date' => $isPublished && $event->start_date ? 'Dibuka' : 'Terkunci',
            'status' => $isRegActive ? 'active' : ($isPublished && $event->start_date && $now->gt($event->start_date) ? 'done' : 'pending')
        ];

        $isStarted = $event->start_date && $now->gte($event->start_date);
        $timeline[] = [
            'label' => 'Hari Acara',
            'date' => $event->start_date ? $event->start_date->format('d M Y') : 'Belum diatur',
            'status' => $isStarted ? ($event->end_date && $now->gt($event->end_date) ? 'done' : 'active') : 'pending'
        ];

        $isEnded = $event->end_date && $now->gt($event->end_date);
        $timeline[] = [
            'label' => 'Selesai',
            'date' => $event->end_date ? $event->end_date->format('d M Y') : 'Belum diatur',
            'status' => $isEnded ? 'done' : 'pending'
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => $event->title,
                'startDate' => $event->start_date ? $event->start_date->format('d M Y, H:i') : null,
                'endDate' => $event->end_date ? $event->end_date->format('d M Y, H:i') : null,
                'location' => $locationText,
                'organizer' => $event->organizer->name ?? null,
                'institution' => $event->institution->name ?? 'Independen / Umum',
                'categories' => $event->categories->pluck('name'),
                'status' => $event->status,
                'timeline' => $timeline,
            ]
        ]);
    }

    public function getStatus($eventId)
    {
        // Cari event, jika tidak ada langsung 404
        $event = Event::select('id', 'status')->findOrFail($eventId);

        return response()->json([
            'status' => $event->status
        ], 200);
    }

    public function updateStatus(Request $request, $eventId)
    {
        // 1. Validasi input agar hanya menerima status yang diizinkan
        $request->validate([
            'status' => 'required|string|in:draft,published,archived'
        ]);

        // 2. Cari event atau return 404 jika tidak ketemu
        $event = Event::findOrFail($eventId);

        // 3. Update HANYA kolom status
        $event->update([
            'status' => $request->status
        ]);

        // 4. Return response (biasanya sukses 200)
        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $event
        ], 200);
    }

}
