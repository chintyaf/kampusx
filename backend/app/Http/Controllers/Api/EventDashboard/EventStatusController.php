<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EventStatusController extends Controller
{
    /**
     * Melihat status kelayakan event untuk dipublish (apa saja yang kurang)
     */
    public function checkStatus(Event $event)
    {
        // Ambil daftar error dari model
        $missingData = $event->getPublishErrors();
        $isReady = count($missingData) === 0;

        return response()->json([
            'status' => 'success',
            'message' => $isReady ? 'Event sudah lengkap dan siap dipublish!' : 'Masih ada data yang perlu dilengkapi.',
            'data' => [
                'event_id'            => $event->id,
                'event_title'          => $event->title,
                'status_saat_ini'     => $event->status,
                'is_ready_to_publish' => $isReady,
                'total_missing'       => count($missingData),
                'missing_data'        => $missingData, // Array berisi daftar yang belum diisi
            ]
        ], 200);
    }

    /**
     * Action ketika user menekan tombol "Publish"
     */
    public function publish(Request $request, Event $event)
    {
        // ... (Kode publish yang sudah kita buat sebelumnya tetap sama) ...
        $errors = $event->getPublishErrors();

        $request->validate([
        'slug' => [
            'nullable',
            'string',
            Rule::unique('events', 'slug')->ignore($event->id), // Pastikan unik kecuali untuk event ini sendiri
            ],
        ]);

        // 2. Cek kelengkapan data (Logika kamu yang sudah ada)
        $errors = $event->getPublishErrors();
        if (count($errors) > 0) {
            return response()->json([
                'success' => false,
            'message' => 'Tidak dapat mem-publish event karena data belum lengkap.',
                'errors'  => $errors
            ], 422);
        }

        // 3. Tentukan Slug
        // Jika user isi input 'slug', gunakan itu. Jika tidak, buat dari judul.
        $finalSlug = $request->slug
            ? Str::slug($request->slug)
            : Str::slug($event->title);

        // 4. Update Status dan Slug sekaligus
        $event->update([
            'status' => 'published',
            'slug'   => $finalSlug,
            'published_at' => now() // Opsional: untuk track kapan mulai live
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Event berhasil dipublish!',
        ], 200);
    }
}
