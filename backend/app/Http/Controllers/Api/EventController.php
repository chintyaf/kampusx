<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        // 1. UPDATE DI SINI: Gunakan with() dan panggil relasi 'location' sesuai nama di Model Event.php
        $events = Event::with(['organizer', 'location'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function store(StoreEventRequest $request)
    {
        if ($request->user()) {
            $data = $request->validated();
            $data['organizer_id'] = $request->user()->id;

            $event = Event::create($data);
            return response()->json(
                [
                    'message' => $event->status === 'published' ? 'Event dipublikasikan!' : 'Draft tersimpan!',
                    'data' => $event,
                ],
                201,
            );
        } else {
            return response()->json(['message' => 'Silakan login dulu'], 401);
        }
    }

    public function show(Request $request, $id)
    {
        // 2. UPDATE DI SINI: Ubah 'event_locations' menjadi 'location'
        $event = Event::with(['organizer', 'location'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $event->update($request->all());
        return $event;
    }

    public function destroy($id)
    {
        Event::destroy($id);
        return response()->json(null, 204);
    }
}