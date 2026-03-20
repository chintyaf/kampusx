<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class OrganizerEventController extends Controller
{
    //
    public function getOrgEvents(Request $request ){
        $userId = $request->user()->id;
        return Event::where('organizer_id', $userId)->get();
    }

}
