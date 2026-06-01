<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Event;
use Carbon\Carbon;

class CheckAttendanceWindow
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Mendapatkan event_id dari request body atau query param
        $eventId = $request->input('event_id') ?? $request->route('event_id');

        // Jika tidak ada event_id, cek apakah ada post_id
        if (!$eventId && $request->input('post_id')) {
            $station = \App\Models\EventStation::find($request->input('post_id'));
            if ($station) {
                $eventId = $station->event_id;
            }
        }

        if (!$eventId) {
            return response()->json(['message' => 'Event ID tidak ditemukan untuk validasi presensi.'], 400);
        }

        $event = Event::find($eventId);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan.'], 404);
        }

        $eventTimezone = $event->timezone ?? 'Asia/Jakarta';
        $now = Carbon::now($eventTimezone);
        
        if (!$event->start_date || !$event->end_date) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal pelaksanaan event belum diatur.'
            ], 400);
        }

        // Interpret start_date and end_date as local times of the event's timezone
        $startDateString = $event->start_date instanceof Carbon 
            ? $event->start_date->format('Y-m-d H:i:s') 
            : Carbon::parse($event->start_date)->format('Y-m-d H:i:s');
            
        $endDateString = $event->end_date instanceof Carbon 
            ? $event->end_date->format('Y-m-d H:i:s') 
            : Carbon::parse($event->end_date)->format('Y-m-d H:i:s');

        // Validate based on manual toggling status (is_attendance_open)
        if (!$event->is_attendance_open) {
            return response()->json([
                'success' => false,
                'message' => 'Presensi sedang ditutup oleh panitia.'
            ], 403);
        }

        return $next($request);
    }
}
