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
}