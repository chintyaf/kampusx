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
        // Ambil parameter dari route (bisa berupa ID string atau instance Model karena Implicit Binding)
        $routeParam = $request->route('eventId') ?? $request->route('id') ?? $request->route('event');

        // Jika route parameter sudah berupa instance Event (karena Model Binding), gunakan langsung
        // Jika masih berupa ID (string/int), lakukan query pencarian
        if ($routeParam instanceof \App\Models\Event) {
            $event = $routeParam;
        } else {
            $event = Event::find($routeParam);
        }

        // Jika event tidak ada
        if(!$event){
            abort(404, 'Event tidak ditemukan');
        }

        // Cek apakah user yang login adalah pemilik event atau admin
        $user = Auth::user();
        if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
            // Gunakan 403 (Forbidden) untuk masalah hak akses
            abort(403, 'Tidak boleh akses');
        }

        return $next($request);
    }
}
