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

        $now = Carbon::now();
        
        // Aturan: 5 menit sebelum acara dimulai
        $allowedStartTime = Carbon::parse($event->start_date)->subMinutes(5);
        
        // Aturan: Batas waktu habis (end_date)
        $allowedEndTime = Carbon::parse($event->end_date);

        if ($now->lessThan($allowedStartTime)) {
            return response()->json([
                'success' => false,
                'message' => 'Presensi belum dibuka. Silakan coba lagi 5 menit sebelum acara dimulai.'
            ], 403);
        }

        if ($now->greaterThan($allowedEndTime)) {
            return response()->json([
                'success' => false,
                'message' => 'Waktu presensi telah habis.'
            ], 403);
        }

        return $next($request);
    }
}
