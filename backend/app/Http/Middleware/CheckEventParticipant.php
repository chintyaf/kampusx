<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Support\Facades\Auth;

class CheckEventParticipant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil parameter dari route (bisa berupa ID string atau instance Model karena Implicit Binding)
        $routeParam = $request->route('eventId') ?? $request->route('id') ?? $request->route('event');

        // Jika route parameter sudah berupa instance Event (karena Model Binding), gunakan langsung
        // Jika masih berupa ID (string/int/slug), lakukan query pencarian
        if ($routeParam instanceof \App\Models\Event) {
            $event = $routeParam;
        } else {
            $event = Event::where('id', $routeParam)->orWhere('slug', $routeParam)->first();
        }

        // Jika event tidak ada
        if (!$event) {
            abort(404, 'Event tidak ditemukan');
        }

        // Ganti parameter route dengan ID numerik agar controller berikutnya mendapatkan ID numerik yang valid
        if ($request->route('eventId')) {
            $request->route()->setParameter('eventId', $event->id);
        }
        if ($request->route('id')) {
            $request->route()->setParameter('id', $event->id);
        }
        if ($request->route('event')) {
            $request->route()->setParameter('event', $event);
        }

        // Cek apakah user yang login adalah pemilik event, admin, atau memiliki tiket aktif untuk event ini
        $user = Auth::user();
        
        // 1. Cek Organizer / Admin
        $isOrganizerOrAdmin = ($event->organizer_id === $user->id || $user->role === 'admin');

        if ($isOrganizerOrAdmin) {
            return $next($request);
        }

        // 2. Cek Tiket Valid Peserta (terintegrasi dengan order berbayar/gratis yang lunas)
        $hasTicket = Ticket::where('participant_id', $user->id)
            ->whereHas('orderItem.order', function ($query) use ($event) {
                $query->where('event_id', $event->id)
                      ->whereIn('status', ['paid', 'pending']); // pending orders also have active tickets or valid checkout state
            })
            ->exists();

        if (!$hasTicket) {
            // Gunakan 403 (Forbidden) untuk masalah hak akses
            abort(403, 'Akses ditolak. Anda tidak memiliki tiket untuk acara ini.');
        }

        return $next($request);
    }
}
