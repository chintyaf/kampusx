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
        return Event::all();
    }

    // php artisan make:request StoreEventRequest
    // Initialize Event Creation
    public function store(StoreEventRequest $request)
    {
        if ($request->user()) {
            // Judul, Link, Deskripsi, Kategori, Interest, Upload Banner
            $data = $request->validated();

            $data['organizer_id'] = $request->user()->id; // sementara

            $event = Event::create($data);
            return response()->json(
                [
                    'message' => $event->status === 'published' ? 'Event dipublikasikan!' : 'Draft tersimpan!',
                    'data' => $event,
                ],
                201,
            );
        } else {
            // User belum login (null)
            return response()->json(['message' => 'Silakan login dulu'], 401);
        }
        // return response()->json('Hello');
    }

    public function show($id)
    {
        return Event::findOrFail($id);
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
