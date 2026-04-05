<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class EventPublishController extends Controller
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
            'success' => true,
            'message' => $isReady ? 'Event sudah lengkap dan siap dipublish!' : 'Masih ada data yang perlu dilengkapi.',
            'data' => [
                'event_id'            => $event->id,
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

        if (count($errors) > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mem-publish event karena data belum lengkap.',
                'errors'  => $errors
            ], 422);
        }

        $event->update(['status' => 'published']);

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dipublish!',
            'data'    => $event
        ], 200);
    }
}
