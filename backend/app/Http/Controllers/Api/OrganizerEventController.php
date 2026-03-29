<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class OrganizerEventController extends Controller
{
    //
    public function getOrgEvents(Request $request)
    {
        // 1. Get the raw events for this user
        $events = Event::where('organizer_id', $request->user()->id)->get();

        // 2. Send it back
        return response()->json([
            'status' => 'success',
            'data' => $events
        ]);
    }

}
