<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        // 1. UPDATE DI SINI: Gunakan with() dan panggil relasi 'location' sesuai nama di Model Event.php
        $events = Event::with(['organizer', 'location'])->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function store(Request $request)
    {
        // Cek autentikasi
        if (!$request->user()) {
            return response()->json(['message' => 'Silakan login dulu'], 401);
        }

        try {
            // 1. Validasi manual di dalam Controller
            $validatedData = $request->validate([
                'title'          => 'required|string|max:255',
                'description'    => 'nullable|string',
                'kategori_ids'   => 'nullable|array',
                'event_type_ids' => 'nullable|array',
                'banner'         => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            return DB::transaction(function () use ($request, $validatedData) {

                // 2. Persiapkan data utama
                $eventData = [
                    'organizer_id'  => $request->user()->id,
                    'title'         => $validatedData['title'],
                    'status'        => 'draft',
                    'description'   => $validatedData['description'] ?? null,

                    // Set null untuk data yang belum dikirim dari frontend
                    'location_type' => null,
                    'start_date'    => null,
                    'end_date'      => null,
                ];

                // 3. Handle Upload Banner Jika Ada
                if ($request->hasFile('banner')) {
                    $eventData['banner_path'] = $request->file('banner')->store('event-banners', 'public');
                }

                // 4. Buat Event Utama
                $event = Event::create($eventData);

                // 5. Relasi Kategori (Many to Many)
                if (!empty($validatedData['kategori_ids'])) {
                    $event->categories()->sync($validatedData['kategori_ids']);
                }

                // 6. Relasi Event Types (Many to Many)
                if (!empty($validatedData['event_type_ids'])) {
                    $event->eventTypes()->sync($validatedData['event_type_ids']);
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Event baru berhasil dibuat!',
                    'data'    => $event,
                ], 201);
            });

        } catch (ValidationException $e) {
            // Error dari $request->validate() akan ditangkap di sini
            return response()->json([
                'status'  => 'error',
                'message' => 'Data yang dikirim tidak valid.',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log error asli untuk internal developer
            Log::error("Store Event Error: " . $e->getMessage(), [
                'user_id' => $request->user()->id,
                'trace'   => $e->getTraceAsString()
            ]);

            // Kirim pesan error ke frontend
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan event.',
                'error_detail' => config('app.debug') ? $e->getMessage() : 'Silakan hubungi admin atau coba beberapa saat lagi.'
            ], 500);
        }
    }


    public function show(Request $request, $id)
    {
        // 2. UPDATE DI SINI: Ubah 'event_locations' menjadi 'location'
        $event = Event::with(['organizer', 'location'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $event->update($request->all());
        return $event;
    }

    public function destroy($id)
    {
        Event::destroy($id);
        return response()->json(null, 204);
    }
}
