<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventAnnouncement;
use App\Models\User;
use App\Notifications\NewAnnouncementNotification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;

class EventAnnouncementController extends Controller
{
    /**
     * Tampilkan seluruh pengumuman untuk suatu event (Sisi Peserta)
     * GET /api/events/{eventId}/announcements
     */
    public function index($eventId)
    {
        $event = Event::findOrFail($eventId);
        
        $announcements = EventAnnouncement::where('event_id', $eventId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements
        ], 200);
    }

    /**
     * Tampilkan seluruh pengumuman untuk organizer (Sisi Organizer)
     * GET /api/organizer/events/{eventId}/announcements
     */
    public function organizerIndex($eventId)
    {
        $event = Event::findOrFail($eventId);
        
        $announcements = EventAnnouncement::where('event_id', $eventId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements
        ], 200);
    }

    /**
     * Membuat pengumuman baru (Sisi Organizer)
     * POST /api/organizer/events/{eventId}/announcements
     */
    public function store(Request $request, $eventId)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,webp|max:4096'
        ]);

        $event = Event::findOrFail($eventId);

        return DB::transaction(function () use ($request, $event, $eventId) {
            $attachmentPath = null;
            $attachmentType = null;

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $extension = strtolower($file->getClientOriginalExtension());
                
                // Simpan di disk publik under announcements/{eventId}
                $attachmentPath = $file->store("announcements/{$eventId}", 'public');
                
                // Tentukan tipe lampiran
                if (in_array($extension, ['pdf'])) {
                    $attachmentType = 'pdf';
                } else {
                    $attachmentType = 'image';
                }
            }

            // Create announcement
            $announcement = EventAnnouncement::create([
                'event_id'        => $eventId,
                'title'           => $request->title,
                'content'         => $request->content,
                'attachment_path' => $attachmentPath,
                'attachment_type' => $attachmentType
            ]);

            // Kirim notifikasi ke semua peserta terverifikasi (memiliki tiket aktif)
            // Query mendapatkan User ID milik partisipan event ini
            $participantIds = DB::table('tickets')
                ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.event_id', $eventId)
                ->where('tickets.status', '!=', 'cancelled')
                ->pluck('tickets.participant_id')
                ->unique()
                ->toArray();

            $users = User::whereIn('id', $participantIds)->get();

            if ($users->isNotEmpty()) {
                Notification::send($users, new NewAnnouncementNotification($event, $announcement));
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengumuman berhasil diterbitkan dan notifikasi telah dikirim ke ' . $users->count() . ' peserta!',
                'data'    => $announcement
            ], 201);
        });
    }

    /**
     * Hapus pengumuman (Sisi Organizer)
     * DELETE /api/organizer/events/{eventId}/announcements/{id}
     */
    public function destroy($eventId, $id)
    {
        $announcement = EventAnnouncement::where('event_id', $eventId)->findOrFail($id);

        // Hapus berkas lampiran fisik jika ada
        if ($announcement->attachment_path && Storage::disk('public')->exists($announcement->attachment_path)) {
            Storage::disk('public')->delete($announcement->attachment_path);
        }

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dihapus.'
        ], 200);
    }
}
