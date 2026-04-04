<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\DB;

class EventLocationController extends Controller
{
    public function index($eventId) {
        $event = Event::with('locationDetail')->findOrFail($eventId);
        $location = $event->locationDetail;

        if (!$location) {
            return response()->json([
                'status' => 'success',
                'data' => null
            ]);
        }

        $data = [
            'type'               => $location->type,
            'platform'           => $location->platform,
            'meetingLink'        => $location->meeting_link,
            'onlineInstruction'  => $location->online_instruction,
            'location'           => $location->location,
            'locationDetail'     => $location->location_detail,
            'mapsUrl'            => $location->maps_url,
            'offlineInstruction' => $location->offline_instruction,
            'onlineQuota'        => $location->online_quota,
            'offlineQuota'       => $location->offline_quota,
        ];

        return response()->json([
            'status' => "success",
            'data' => $data
        ]);
    }

    public function update(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'type'                       => 'required|in:online,offline,hybrid',
            'platform'                   => 'nullable|string',
            'meeting_link'               => 'nullable|url',
            'online_instruction'         => 'nullable|string',
            'location'                   => 'nullable|string',
            'location_detail'            => 'nullable|string',
            'maps_url'                   => 'nullable|url',
            'offline_instruction'        => 'nullable|string',
            'is_online_quota_unlimited'  => 'nullable|boolean',
            'is_offline_quota_unlimited' => 'nullable|boolean',
            'online_quota'               => 'nullable|integer|min:0',
            'offline_quota'              => 'nullable|integer|min:0',
        ], [
            'online_quota.required_if'  => 'Kuota online wajib diisi jika tidak unlimited.',
            'offline_quota.required_if' => 'Kuota offline wajib diisi jika tidak unlimited.'
        ]);

        // Logic Unlimited Quota
        $validated['online_quota'] = !empty($validated['is_online_quota_unlimited'])
            ? null
            : ($validated['online_quota'] ?? 0);

        $validated['offline_quota'] = !empty($validated['is_offline_quota_unlimited'])
            ? null
            : ($validated['offline_quota'] ?? 0);

        // CLEANUP: Ensure irrelevant data is wiped when switching types
        if ($validated['type'] === 'online') {
            $validated['location'] = null;
            $validated['location_detail'] = null;
            $validated['maps_url'] = null;
            $validated['offline_instruction'] = null;
            $validated['offline_quota'] = null;
        } elseif ($validated['type'] === 'offline') {
            $validated['platform'] = null;
            $validated['meeting_link'] = null;
            $validated['online_instruction'] = null;
            $validated['online_quota'] = null;
        }

        // Unset boolean flags as they likely don't exist in the DB columns
        unset($validated['is_online_quota_unlimited']);
        unset($validated['is_offline_quota_unlimited']);

        try {
            return DB::transaction(function () use ($event, $validated) {
                $event->locationDetail()->updateOrCreate(
                    ['event_id' => $event->id],
                    $validated
                );

                return response()->json(['status' => 'success', 'message' => 'Lokasi berhasil diperbarui']);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }
}
