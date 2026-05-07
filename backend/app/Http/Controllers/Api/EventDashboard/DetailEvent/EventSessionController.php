<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\EventSessionResource;

class EventSessionController extends Controller
{
    public function getSession(int $eventId)
    {
        try {
            // Tambahkan with('speakers') di sini untuk Eager Loading
            $sessions = EventSession::query()
                ->with('speakers')
                ->where('event_id', $eventId)
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->get();

            $grouped = $sessions->groupBy('date')->map(function ($items, $date) {
                return [
                    'date' => $date,
                    'day_number' => $items->first()->day_number,
                    'sessions' => $items->map(function ($session) {
                        return new EventSessionResource($session);
                    })->values() // Tambahkan ->values() agar format JSON array-nya rapi
                ];
            })->values(); // Tambahkan ->values() di sini juga untuk mereset key hasil groupBy

            return response()->json([
                'status' => 'success',
                'data' => $grouped,
                'session' => $sessions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
        // Hapus blok finally untuk return success, return success cukup ditaruh di dalam try block.
        // Menaruh return di finally akan override return error di blok catch.
    }
    public function setSession(Request $request, int $eventId){
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'timezone'  => 'nullable|string',
            'startDate' => 'required|date',
            'endDate'   => 'nullable|date|after_or_equal:startDate',
            'sessions'   => 'nullable|array',
            'sessions.*.id'          => 'required', // PENTING: Tambahkan validasi ID
            'sessions.*.title'       => 'required|string|max:255',
            'sessions.*.description' => 'nullable|string',
            'sessions.*.day'         => 'nullable|integer|min:1',
            'sessions.*.startTime'   => 'nullable',
            'sessions.*.endTime'     => 'nullable',
        ]);

        try {
            return DB::transaction(function () use ($event, $validated) {

                // 1. Update info utama Event
                $event->update([
                    'timezone'   => $validated['timezone'] ?? $event->timezone,
                    'start_date' => $validated['startDate'],
                    'end_date'   => $validated['endDate'] ?? null,
                ]);

                // 2. Kelola Sessions
                if (!isset($validated['sessions'])) {
                    // Jika array sessions tidak dikirim (atau kosong), hapus semua sesi
                    $event->sessions()->delete();
                } else {
                    $baseDate = Carbon::parse($validated['startDate']);

                    // Array untuk menyimpan ID sesi yang "selamat" (di-update atau baru dibuat)
                    $activeSessionIds = [];

                    foreach ($validated['sessions'] as $sessionData) {
                        $sessionDate = $baseDate->copy()->addDays($sessionData['day'] - 1)->format('Y-m-d');

                        $sessionModel = null;

                        // Cek apakah ID dari frontend adalah angka (Data Lama dari Database)
                        if (is_numeric($sessionData['id'])) {
                            $sessionModel = $event->sessions()->find($sessionData['id']);
                        }

                        if ($sessionModel) {
                            // Sesi ditemukan, lakukan UPDATE
                            $sessionModel->update([
                                'title'       => $sessionData['title'],
                                'description' => $sessionData['description'] ?? null,
                                'date'        => $sessionDate,
                                'start_time'  => $sessionData['startTime'],
                                'end_time'    => $sessionData['endTime'],
                            ]);
                        } else {
                            // Sesi tidak ditemukan ATAU ID berupa UUID dari Frontend, lakukan CREATE
                            $sessionModel = $event->sessions()->create([
                                'title'       => $sessionData['title'],
                                'description' => $sessionData['description'] ?? null,
                                'date'        => $sessionDate,
                                'start_time'  => $sessionData['startTime'],
                                'end_time'    => $sessionData['endTime'],
                            ]);
                        }

                        // Kumpulkan ID asli dari database (baik yang baru dibuat maupun yang di-update)
                        $activeSessionIds[] = $sessionModel->id;
                    }

                    // 3. CLEAN UP (Delete)
                    // Hapus sesi di DB yang tidak ada di dalam daftar $activeSessionIds
                    $event->sessions()->whereNotIn('id', $activeSessionIds)->delete();
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Konfigurasi sesi dan waktu berhasil disimpan',
                ]);
            });
        } catch (\Exception $e) {
            \Log::error("Set Session Error ID {$eventId}: " . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menyimpan data sesi.',
                'debug'   => $e->getMessage() // Hapus ini di production
            ], 500);
        }

    }
}
