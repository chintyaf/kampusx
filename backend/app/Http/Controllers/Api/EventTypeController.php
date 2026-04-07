<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventType;
// use Illuminate\Http\Request;

class EventTypeController extends Controller
{
    public function index()
    {
        $eventType = EventType::select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar tipe event berhasil diambil',
            'data'    => $eventType
        ], 200);
    }
}
