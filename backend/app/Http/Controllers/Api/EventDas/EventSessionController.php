<?php

namespace App\Http\Controllers\Api\EventDas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EventSessionController extends Controller
{
    public function getSession($eventId)
    {
        $event = Event::select('id', 'start_date', 'end_date', 'timezone')
            ->with(['sessions' => function($query) {
                $query->select('id', 'event_id', 'title', 'description', 'date', 'start_time', 'end_time');
            }])
            ->findOrFail($eventId);

        $startDate = Carbon::parse($event->start_date);

        $sessions = $event->sessions->map(function ($session) use ($startDate) {
            $day = $startDate->diffInDays(Carbon::parse($session->date)) + 1;

            return [
                'id'          => $session->id,
                'day'         => $day,
                'title'       => $session->title,
                'description' => $session->description,
                'startTime'   => substr($session->start_time, 0, 5), // Ambil HH:mm saja
                'endTime'     => substr($session->end_time, 0, 5),   // Ambil HH:mm saja
                'date'        => $session->date,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => [
                'timezone'  => $event->timezone,
                'startDate' => $event->start_date ? $startDate->format('Y-m-d') : null,
                'endDate'   => $event->end_date ? Carbon::parse($event->end_date)->format('Y-m-d') : null,
                'sessions'  => $sessions
            ]
        ]);
    }

    public function setSession(Request $request, $eventId){
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'timezone'  => 'nullable|string',
            'startDate' => 'required|date',
            'endDate'   => 'nullable|date|after_or_equal:startDate',
            'sessions'   => 'nullable|array',
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
                if (isset($validated['sessions'])) {
                    // Hapus sesi lama (jika ingin replace all)
                    $event->sessions()->delete();

                    $baseDate = Carbon::parse($validated['startDate']);

                    foreach ($validated['sessions'] as $sessionData) {
                        // Hitung tanggal berdasarkan 'day'
                        // Day 1 = startDate + 0 days, Day 2 = startDate + 1 day
                        $sessionDate = $baseDate->copy()->addDays($sessionData['day'] - 1);

                        $event->sessions()->create([
                            'title'       => $sessionData['title'],
                            'description' => $sessionData['description'] ?? null,
                            'date'        => $sessionDate->format('Y-m-d'),
                            'start_time'  => $sessionData['startTime'],
                            'end_time'    => $sessionData['endTime'],
                        ]);
                    }
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
