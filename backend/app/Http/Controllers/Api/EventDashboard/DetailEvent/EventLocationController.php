<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
// use App\Models\EventTicket;

class EventLocationController extends Controller
{
    public function index($eventId) {
        $event = Event::with('locationDetail')->findOrFail($eventId);
        $data = $event->locationDetail;

        if (!$data) {
            return response()->json([
                'status' => 'success',
                'data' => null
            ]);
        }


        return response()->json([
            'status' => "success",
            'data' => $data
        ]);
    }

  public function update(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        // 1. Validasi HANYA untuk field Lokasi (Urusan Kuota sudah pindah ke menu Tiket)
        $validated = $request->validate([
            'type'                => 'required|in:online,offline,hybrid',

            // Field Online
            'platform'            => 'nullable|string',
            'meeting_link'        => 'nullable|url',
            'online_instruction'  => 'nullable|string',

            // Field Offline (Perhatikan: di DB nama kolomnya 'location_name', bukan 'location')
            'location_name'       => 'nullable|string',
            'location_detail'     => 'nullable|string',
            'maps_url'            => 'nullable|url',
            'offline_instruction' => 'nullable|string',
        ]);

        // 2. Handle Empty State berdasarkan Tipe Event
        // Membersihkan data yang tidak relevan agar tidak menjadi sampah di database
        if ($validated['type'] === 'offline') {
            $validated['platform']           = null;
            $validated['meeting_link']       = null;
            $validated['online_instruction'] = null;
        } elseif ($validated['type'] === 'online') {
            $validated['location_name']       = null;
            $validated['location_detail']     = null;
            $validated['maps_url']            = null;
            $validated['offline_instruction'] = null;
        }

        try {
            return DB::transaction(function () use ($event, $validated) {
                // 3. Simpan data ke tabel event_locations
                $event->locationDetail()->updateOrCreate(
                    ['event_id' => $event->id],
                    $validated
                );

                // 4. Trigger pembuatan Tiket otomatis (MVP Concept)
                // $this->autoGenerateTickets($event->id, $validated['type']);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Tempat Acara berhasil diperbarui.'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Private Helper untuk Auto-Generate Tiket
     */
    // private function autoGenerateTickets($eventId, $eventType)
    // {
    //     // 1. Handle Tiket Online (Buat jika event online/hybrid, hapus jika event offline)
    //     if (in_array($eventType, ['online', 'hybrid'])) {
    //         EventTicket::firstOrCreate(
    //             ['event_id' => $eventId, 'type' => 'online'],
    //             [
    //                 'name'    => 'Tiket Akses Online',
    //                 'is_free' => true,
    //                 'price'   => 0,
    //             ]
    //         );
    //     } else {
    //         EventTicket::where('event_id', $eventId)->where('type', 'online')->delete();
    //     }

    //     // 2. Handle Tiket Offline (Buat jika event offline/hybrid, hapus jika event online)
    //     if (in_array($eventType, ['offline', 'hybrid'])) {
    //         EventTicket::firstOrCreate(
    //             ['event_id' => $eventId, 'type' => 'offline'],
    //             [
    //                 'name'    => 'Tiket Akses Offline',
    //                 'is_free' => true,
    //                 'price'   => 0,
    //             ]
    //         );
    //     } else {
    //         EventTicket::where('event_id', $eventId)->where('type', 'offline')->delete();
    //     }
    // }
}
