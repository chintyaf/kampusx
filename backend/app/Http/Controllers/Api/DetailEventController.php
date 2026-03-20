<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;

class DetailEventController extends Controller
{
    public function getGeneralInfo($eventId){
        return Event::findOrFail($eventId)->get();
    }
}
