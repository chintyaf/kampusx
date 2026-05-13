<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;

class CheckEventOrganizer
{
    public function handle(Request $request, Closure $next): Response
    {
        $eventId = $request->route('eventId');

        // Fetch the event with ALL columns so we can read the organizer_id
        $event = Event::find($eventId);

        // Jika event tidak ada
        if(!$event){
            abort(404, 'Event tidak ditemukan');
        }

        // Cek apakah user yang login adalah pemilik event
        if ($event->organizer_id !== Auth::id()) {
            // Gunakan 403 (Forbidden) untuk masalah hak akses
            abort(403, 'Tidak boleh akses');
        }

        return $next($request);
    }
}
