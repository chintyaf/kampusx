<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventStation;

class CommitteeController extends Controller
{

public function verifyPin(Request $request)
{
    $request->validate([
        'pin' => 'required'
    ]);

    $event = Event::where('pos_pin', $request->pin)->first();

    if (!$event) {
        return response()->json([
            'success' => false,
            'message' => 'PIN tidak valid'
        ], 404);
    }

    $stations = EventStation::where('event_id', $event->id)->get(
            ['id', 'name', 'description', 'is_active']
        );
    return response()->json([
        'success' => true,
        'event' => $event,
        'stations' => $stations
    ]);
}

    public function scan(Request $request)
    {
        // Re-use StaffController logic for scanning
        return app(\App\Http\Controllers\Api\StaffController::class)->scan($request);
    }

    public function stats(Request $request)
    {
        $request->validate([
            'event_id' => 'required|integer|exists:events,id',
            'post_id' => 'required|integer|exists:event_stations,id'
        ]);

        $eventId = $request->event_id;
        $stationId = $request->post_id;

        $totalTickets = \App\Models\Ticket::whereHas('orderItem.order', function ($q) use ($eventId) {
            $q->where('event_id', $eventId)->where('status', 'paid');
        })->count();

        $checkedIn = \Illuminate\Support\Facades\DB::table('attendance_logs')
            ->where('event_id', $eventId)
            ->where('post_id', $stationId)
            ->count();

        $notCheckedIn = max(0, $totalTickets - $checkedIn);

        return response()->json([
            'success' => true,
            'stats' => [
                'total_quota' => $totalTickets,
                'checked_in' => $checkedIn,
                'remaining' => $notCheckedIn
            ]
        ], 200);
    }
}