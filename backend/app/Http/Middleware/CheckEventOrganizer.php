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

        // Ganti parameter route dengan ID numerik (di-cast ke int) agar controller berikutnya mendapatkan integer yang valid
        if ($request->route('eventId')) {
            $request->route()->setParameter('eventId', (int)$event->id);
        }
        if ($request->route('id')) {
            $request->route()->setParameter('id', (int)$event->id);
        }
        if ($request->route('event')) {
            // Jika rute awalnya meminta model binding murni, kita tetap teruskan object $event-nya
            $request->route()->setParameter('event', $event);
        }

        // Cek apakah user yang login adalah pemilik event atau admin
        $user = Auth::user();

        // Proteksi jika middleware ini tidak sengaja terpanggil sebelum user terautentikasi
        if (!$user) {
            abort(401, 'Silakan login terlebih dahulu');
        }

        // Menggunakan (int) untuk memastikan perbandingan strict (!==) bekerja dengan tepat
        if ((int)$event->organizer_id !== (int)$user->id && $user->role !== 'admin') {
            // Gunakan 403 (Forbidden) untuk masalah hak akses
            abort(403, 'Tidak boleh akses');
        }

        return $next($request);
    }
}
