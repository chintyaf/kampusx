<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventMaterialController extends Controller
{
    /**
     * Tampilkan daftar post-event materials ke peserta (Participant Portal)
     */
    public function index($eventId, Request $request)
    {
        $event = Event::findOrFail($eventId);
        $user = $request->user();

        // 1. Cek apakah user punya tiket acara ini (akses dasar)
        $hasTicket = DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('tickets.participant_id', $user->id)
            ->where('orders.event_id', $eventId)
            ->where('tickets.status', '!=', 'cancelled')
            ->exists();

        if (!$hasTicket && !in_array($user->role, ['organizer', 'admin', 'committee'])) {
            return response()->json(['message' => 'Akses ditolak. Anda tidak memiliki tiket aktif untuk acara ini.'], 403);
        }

        // 2. Ambil material acaranya
        $materials = EventMaterial::where('event_id', $eventId)->get();

        // 3. Filter material yang require_attendance == true
        // Pastikan user punya log kehadiran di event tersebut
        $hasAttended = false;
        
        if ($hasTicket) {
             $hasAttended = DB::table('attendance_logs')
                 ->join('tickets', 'attendance_logs.ticket_id', '=', 'tickets.id')
                 ->where('tickets.participant_id', $user->id)
                 ->where('attendance_logs.event_id', $eventId)
                 ->exists();
        }

        // Jika dia panitia/organizer bypass filtering
        if (in_array($user->role, ['organizer', 'admin', 'committee'])) {
            return response()->json(['data' => $materials], 200);
        }

        // Filter out strict materials kalau user tidak hadir
        $filteredMaterials = $materials->filter(function($mat) use ($hasAttended) {
            if ($mat->require_attendance && !$hasAttended) return false;
            return true;
        })->values();

        return response()->json([
            'data' => $filteredMaterials,
            'attended' => $hasAttended
        ], 200);
    }

    /**
     * Digunakan oleh organizer untuk mendapatkan seluruh materi tanpa filter peserta
     */
    public function organizerIndex($eventId)
    {
        $materials = EventMaterial::where('event_id', $eventId)->get();
        return response()->json(['data' => $materials], 200);
    }

    /**
     * Tambah materi baru (Hanya untuk organizer/admin)
     */
    public function store(Request $request, $eventId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,document,link',
            'url' => 'required|url',
            'description' => 'nullable|string',
            'require_attendance' => 'boolean'
        ]);

        $event = Event::findOrFail($eventId);

        // Pastikan yg insert adalah owner-nya
        // (Bisa juga ditangani oleh middleware spesifik role+ownership)

        $material = EventMaterial::create([
            'event_id' => $event->id,
            'title' => $request->title,
            'type' => $request->type,
            'url' => $request->url,
            'description' => $request->description,
            'require_attendance' => $request->require_attendance ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil ditambahkan.',
            'data' => $material
        ], 201);
    }

    /**
     * Hapus materi (Organizer)
     */
    public function destroy($eventId, $id)
    {
        $material = EventMaterial::where('event_id', $eventId)->findOrFail($id);
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil dihapus.'
        ], 200);
    }
}
