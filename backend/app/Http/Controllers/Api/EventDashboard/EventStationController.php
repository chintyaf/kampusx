<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EventStation;
use App\Models\EventSession;
use Carbon\Carbon;
use Illuminate\Support\Str;
// use Illuminate\Support\Facades\DB;

class EventStationController extends Controller
{
    /**
     * Menampilkan daftar station (pos) untuk suatu event.
     */
    public function index(int $eventId)
    {
        // 1. Ambil data pos dan eager load relasi 'sessions' untuk mencegah N+1 query.
        // Jika kamu punya tabel relasi untuk scan (misal: relasi 'attendances'),
        // kamu bisa tambahkan ->withCount('attendances') di sini.
        $stations = EventStation::with(['sessions' => function ($query) {
            $query->select('event_sessions.id', 'title', 'date');
        }])
        ->where('event_id', $eventId)
        ->get(['id', 'event_id', 'name', 'description', 'is_active']);

        // 2. Mapping data agar formatnya sesuai dengan kebutuhan tabel di Frontend
        $formattedData = $stations->map(function ($station) {

            // Mengambil judul sesi (misal: "Hari 1", "Hari 2") untuk kolom BERLAKU PADA
            // Jika frontend butuh data lengkap (id, title, dll), hapus pluck() dan gunakan $station->sessions
            $sessionLabels = $station->sessions->pluck('title')->toArray();

            return [
                'id'          => $station->id,
                'name'        => $station->name,
                'description' => $station->description,
                'is_active'   => $station->is_active,

                // Array label sesi untuk render badge (misal: ['Hari 1', 'Hari 2'])
                'sessions'    => $sessionLabels,

                // Placeholder total scan. Jika sudah ada relasinya, ganti dengan: $station->attendances_count
                'total_scan'  => 0,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formattedData
        ]);
    }

    /**
     * Menyimpan station baru.
     */
    public function store(Request $request, int $eventId)
    {
        // 1. Validasi Input
        // Menangkap 'days' dari React karena payload-nya mengirim key 'days'
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'days'        => 'required|array|min:1',
            'days.*'      => 'integer',
            'is_active'   => 'boolean',
        ]);

        // 3. Simpan data utama pos (EventStation)
        $station = \App\Models\EventStation::create([
            'event_id'    => $eventId,
            'name'        => $request->name,
            'description' => $request->description,
            'is_active'   => $request->is_active ?? true,
        ]);

        // 4. Simpan data jadwal ke tabel Pivot (event_session_station)
        // Kita menggunakan relasi sessions() yang ada di Model EventStation
        if ($request->has('days')) {
            $station->sessions()->attach($request->days);
        }

        // 5. Kembalikan response JSON
        return response()->json([
            'success' => true,
            'status'  => 'success',
            'message' => 'Pos baru berhasil ditambahkan.',
            // Me-load relasi sessions agar data yang baru di-attach ikut dikembalikan ke frontend
            'data'    => $station->load('sessions')
        ], 201);
    }

    /**
     * Memperbarui data station. (Edit)
     */
    public function update(Request $request, int $eventId, int $id)
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

    public function getDaysSummary(int $eventId)
    {
        // 1. Ambil semua sesi beserta relasi stasiunnya (hanya stasiun yang aktif)
        $sessions = EventSession::with(['stations' => function ($query) {
            $query->where('is_active', true);
        }])
        ->where('event_id', $eventId)
        ->orderBy('day_number')
        ->orderBy('start_time')
        ->get();

        // 2. Kelompokkan berdasarkan day_number
        $groupedDays = $sessions->groupBy('day_number')->map(function ($daySessions, $dayNumber) {

            // Ambil tanggal dari sesi pertama di hari tersebut
            $firstSession = $daySessions->first();

            // Ambil data tanggal mentah (biasanya berformat YYYY-MM-DD dari database)
            $rawDate = $firstSession && $firstSession->date ? $firstSession->date : null;

            // 3. Hitung jumlah pos (station) unik yang aktif di hari tersebut
            $activeStationIds = collect();
            foreach ($daySessions as $session) {
                $activeStationIds = $activeStationIds->merge($session->stations->pluck('id'));
            }
            $uniqueActiveStationsCount = $activeStationIds->unique()->count();

            // 4. Status aktif hari (boolean)
            $isDayActive = true; // Ganti dengan logika aslimu jika ada

            // Return data mentah / normal (Raw Data)
            return [
                'day_number' => $dayNumber,                            // Output: 1
                'date' => $rawDate,                                    // Output: "2025-08-18" (atau format asli DB)
                'is_active' => $isDayActive,                           // Output: true
                'active_stations_count' => $uniqueActiveStationsCount, // Output: 2
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $groupedDays
        ]);
    }
}
