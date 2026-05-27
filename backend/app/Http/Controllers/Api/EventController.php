<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

use Illuminate\Validation\ValidationException;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['organizer', 'locationDetail', 'categories', 'eventTickets']);

        // 1. Pencarian berdasarkan judul atau nama creator (organizer)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('organizer', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Filter berdasarkan nama kategori
        if ($request->filled('category')) {
            $category = $request->input('category');
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('name', $category);
            });
        }

        // 3. Filter berdasarkan harga tiket (gratis / berbayar)
        if ($request->filled('price')) {
            $priceFilter = strtolower($request->input('price'));
            if ($priceFilter === 'gratis' || $priceFilter === 'free') {
                $query->where(function ($q) {
                    $q->whereDoesntHave('eventTickets')
                      ->orWhereHas('eventTickets', function ($sq) {
                          $sq->where('price', 0);
                      });
                });
            } elseif ($priceFilter === 'berbayar' || $priceFilter === 'paid') {
                $query->whereHas('eventTickets', function ($q) {
                    $q->where('price', '>', 0);
                });
            }
        }

        // 4. Filter berdasarkan range tanggal
        if ($request->filled('start_date')) {
            $query->where('start_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->where('end_date', '<=', $request->input('end_date'));
        }

        $events = $query->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function store(Request $request)
    {
        // Cek autentikasi
        if (!$request->user()) {
            return response()->json(['status' => 'error', 'message' => 'Silakan login dulu'], 401);
        }

        try {
            // 1. Validasi
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

            return DB::transaction(function () use ($request, $validated) {

                // 2. Persiapkan array data utama (Gunakan nama $eventData)
                $pin = strtoupper(\Illuminate\Support\Str::random(6));
                while (Event::where('pos_pin', $pin)->exists()) {
                    $pin = strtoupper(\Illuminate\Support\Str::random(6));
                }

                $user = $request->user();
                $institutionId = null;
                if ($user->university_id) {
                    $isValid = true;
                    // Cek jika masa berlaku afiliasi telah berakhir (demisioner)
                    if ($user->affiliation_valid_until && now()->gt($user->affiliation_valid_until)) {
                        $isValid = false;
                    }
                    if ($isValid) {
                        $institutionId = $user->university_id;
                    }
                }

                $eventData = [
                    'organizer_id'   => $user->id,
                    'institution_id' => $institutionId, // Otomatis disematkan dari universitas organizer
                    'title'          => $validated['title'],
                    'status'         => 'draft',
                    'description'    => $validated['description'] ?? null,
                    'pos_pin'        => $pin,
                ];

                // 3. Handle Upload File (Tanpa cek file lama karena ini data baru)
                if ($request->hasFile('banner')) {
                    $extension = $request->file('banner')->getClientOriginalExtension();
                    // Gunakan nama unik karena ID event belum ada
                    $fileName = "banner_" . time() . "_" . uniqid() . "." . $extension;

                    // Simpan di folder general events/banners
                    $path = $request->file('banner')->storeAs("events/banners", $fileName, 'public');

                    // Masukkan ke array data yang akan di-insert
                    $eventData['image_path'] = $path;
                }

                // 4. Buat Event Utama
                $event = Event::create($eventData);

                // 5. Relasi Kategori (Many to Many) - Gunakan $validated, bukan $validatedData
                if (!empty($validated['kategori_ids'])) {
                    $event->categories()->sync($validated['kategori_ids']);
                }

                // 6. Relasi Event Types (Many to Many)
                if (!empty($validated['event_type_ids'])) {
                    $event->eventTypes()->sync($validated['event_type_ids']);
                }

                // Load relasi agar data yang dikembalikan ke frontend lebih lengkap
                $event->load(['categories', 'eventTypes']);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Event baru berhasil dibuat!',
                    'data'    => $event,
                ], 201);
            });

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data yang dikirim tidak valid.',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error("Store Event Error: " . $e->getMessage(), [
                'user_id' => $request->user()->id,
                'trace'   => $e->getTraceAsString()
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan event.',
                'error_detail' => config('app.debug') ? $e->getMessage() : 'Silakan hubungi admin atau coba beberapa saat lagi.'
            ], 500);
        }
    }


    public function show(Request $request, $id)
    {
        // Memuat detail event beserta organizer, lokasi, kategori, tiket, dan agenda rundown (sessions.speakers)
        // $event = Event::with(['organizer', 'locationDetail', 'sessions.speakers', 'categories', 'eventTickets'])->findOrFail($id);
        // Eager load all necessary relations for rich detail and preview modes
        $event = Event::with([
            'organizer',
            'locationDetail',
            'categories',
            'eventTypes',
            'eventTickets',
            'sessions' => function($q) {
                $q->orderBy('day_number', 'asc')
                  ->orderBy('start_time', 'asc')
                  ->with('speakers');
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function getNearest(Request $request)
    {
        // 1. Ambil latitude dan longitude langsung dari request parameters
        $userLat = $request->query('latitude', 0);
        $userLng = $request->query('longitude', 0);
        $range = $request->query('range', 10);

        // Jika koordinat masih 0 (belum dapat lokasi), bisa di-handle di sini
        // dengan mereturn event default atau array kosong.

        $event = Event::with(['organizer', 'locationDetail'])
            ->join('event_locations', 'events.id', '=', 'event_locations.event_id')
            ->select('events.*')
            ->whereNotNull('event_locations.latitude')
            ->whereNotNull('event_locations.longitude')
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) * cos( radians( event_locations.latitude ) ) * cos( radians( event_locations.longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( event_locations.latitude ) ) ) ) AS distance',
                [$userLat, $userLng, $userLat]
            )
            // 2. TAMBAHKAN HAVING UNTUK FILTER JARAK MAKSIMAL
            ->having('distance', '<=', $range)
            ->orderBy('distance', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function checkOrganizer(int $eventId)
    {
        // 1. Cari event berdasarkan ID
        $event = Event::find($eventId);

        // 2. Jika event tidak ditemukan
        if (!$event) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan',
                'is_authorized' => false
            ], 404);
        }

        // 3. Cek apakah user yang sedang login adalah pembuat event atau admin
        $user = Auth::user();
        if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Anda bukan organizer dari event ini.',
                'is_authorized' => false,
                'user' => $user,
                'event' => $event
            ], 403);
        }

        // 4. Jika lolos pengecekan (User adalah organizer)
        return response()->json([
            'status' => 'success',
            'message' => 'Akses diizinkan.',
            'is_authorized' => true,
                 'user' => $user,
                'event' => $event->organizer_id
        ], 200);
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
