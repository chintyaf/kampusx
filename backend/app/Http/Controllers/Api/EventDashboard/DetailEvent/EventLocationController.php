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
            'type'                        => 'required|in:online,offline,hybrid',

            // Flag unlimited quota
            'is_online_quota_unlimited'   => 'boolean',
            'is_offline_quota_unlimited'  => 'boolean',

            // Field Online
            'platform'            => 'nullable|string',
            'meeting_link'        => 'required_if:type,online,hybrid|nullable|url',
            'online_instruction'  => 'nullable|string',

            // Field Offline (Perhatikan: di DB nama kolomnya 'location_name', bukan 'location')
            'location_name'       => 'required_if:type,offline,hybrid|nullable|string',
            'location_detail'     => 'nullable|string',
            'maps_url'            => 'nullable|url',
            'offline_instruction' => 'nullable|string',

            // Field Koordinat & Hierarki Alamat Offline
            'latitude'            => 'nullable|numeric|between:-90,90',
            'longitude'           => 'nullable|numeric|between:-180,180',
            'country'             => 'nullable|string',
            'province'            => 'required_if:type,offline,hybrid|nullable|string',
            'city'                => 'required_if:type,offline,hybrid|nullable|string',
            'district'            => 'nullable|string',
            'address_detail'      => 'required_if:type,offline,hybrid|nullable|string',
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
            $validated['latitude']            = null;
            $validated['longitude']           = null;
            $validated['country']             = null;
            $validated['province']            = null;
            $validated['city']                = null;
            $validated['district']            = null;
            $validated['address_detail']      = null;
        }

        try {
            return DB::transaction(function () use ($event, $validated) {
                // 3. Simpan data ke tabel event_locations
                $event->locationDetail()->updateOrCreate(
                    ['event_id' => $event->id],
                    $validated
                );

                $notified = $event->notifyParticipantsOfUpdate();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Tempat Acara berhasil diperbarui.',
                    'notified_participants' => $notified
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

}
