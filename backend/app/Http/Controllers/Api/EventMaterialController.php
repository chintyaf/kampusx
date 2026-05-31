<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventMaterial;
use App\Models\EventSession;
use App\Models\Ticket;
use App\Models\SurveyResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventMaterialController extends Controller
{
    /**
     * Tampilkan daftar post-event materials ke peserta (Participant Portal)
     */
    public function index($eventId, Request $request)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();
        $eventId = $event->id;
        $user = $request->user();

        // =========================================================
        // 1. VALIDASI AKSES DASAR: Cek Tiket Peserta
        // =========================================================
        $hasTicket = Ticket::where('participant_id', $user->id)
            ->whereHas('orderItem.order', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->exists();

        $isOrganizerOrAdmin = ($event->organizer_id === $user->id || $user->role === 'admin');

        // Jika bukan panitia dan tidak punya tiket, tolak akses.
        if (!$hasTicket && !$isOrganizerOrAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki tiket untuk acara ini.'
            ], 403);
        }

        // =========================================================
        // 2. CEK STATUS ACARA: Apakah Acara Sudah Selesai?
        // =========================================================
        // Syarat pertama agar materi auto-publish adalah acara sudah berakhir.
        $isEventFinished = false;
        if (in_array($event->status, ['post_event', 'completed'])) {
            $isEventFinished = true;
        } elseif ($event->end_date && Carbon::now()->greaterThan($event->end_date)) {
            $isEventFinished = true;
        }

        // =========================================================
        // 3. CEK SURVEI: Apakah Peserta Telah Mengisi Survei?
        // =========================================================
        // Syarat kedua adalah peserta wajib mengisi survei (mirip dengan e-sertifikat).
        $hasFilledSurvey = false;
        if (!$isOrganizerOrAdmin) {
            $hasFilledSurvey = SurveyResponse::where('user_id', $user->id)
                ->where('event_id', $eventId)
                ->exists();
        } else {
            // Bypass untuk Organizer dan Admin (mereka bisa langsung preview)
            $hasFilledSurvey = true;
            $isEventFinished = true;
        }

        // =========================================================
        // 4. LOGIKA BLOKIR (LOCKED): Jika Syarat Belum Terpenuhi
        // =========================================================
        if (!$isEventFinished || !$hasFilledSurvey) {
            return response()->json([
                'success' => true,
                'is_unlocked' => false,
                'is_event_finished' => $isEventFinished,
                'has_filled_survey' => $hasFilledSurvey,
                'message' => 'Materi terkunci. Pastikan acara sudah selesai dan Anda telah mengisi survei kepuasan.',
                'data' => [] // Kirim data kosong agar UI tidak bocor
            ], 200);
        }

        // =========================================================
        // 5. AMBIL MATERI (UNLOCKED): Ambil SessionMaterials Terbaru
        // =========================================================
        $sessions = EventSession::with(['materials' => function ($query) {
                $query->orderBy('sort_order', 'asc');
            }])
            ->where('event_id', $eventId)
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        // Format data agar mudah dikonsumsi frontend peserta (seperti UI di dashboard)
        $data = $sessions->map(function ($session) {
            $materials = $session->materials->map(function ($material) {
                return [
                    'id' => $material->id,
                    'type' => $material->type,
                    'name' => $material->name,
                    'path_or_url' => $material->path_or_url,
                    // Hasilkan absolute URL untuk dokumen/video lokal agar bisa diunduh/ditonton
                    'url' => in_array($material->type, ['video_file', 'document']) && !filter_var($material->path_or_url, FILTER_VALIDATE_URL)
                        ? asset('storage/' . $material->path_or_url)
                        : $material->path_or_url,
                    'file_size' => $material->file_size,
                ];
            });

            return [
                'id' => $session->id,
                'title' => $session->title,
                'description' => $session->description,
                // Mengubah format tanggal agar human-readable
                'date' => $session->date ? Carbon::parse($session->date)->format('d M Y') : 'Belum dijadwalkan',
                'start_time' => $session->start_time,
                'end_time' => $session->end_time,
                'materials' => $materials
            ];
        });

        // =========================================================
        // 6. KEMBALIKAN DATA MATERI KE PESERTA
        // =========================================================
        return response()->json([
            'success' => true,
            'is_unlocked' => true,
            'is_event_finished' => $isEventFinished,
            'has_filled_survey' => $hasFilledSurvey,
            'message' => 'Berhasil mengambil materi acara.',
            'data' => $data
        ], 200);
    }

    /**
     * Digunakan oleh organizer untuk mendapatkan seluruh materi tanpa filter peserta
     */
    public function organizerIndex($eventId)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();
        $eventId = $event->id;
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

        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();
        $eventId = $event->id;

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
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();
        $eventId = $event->id;
        $material = EventMaterial::where('event_id', $eventId)->findOrFail($id);
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil dihapus.'
        ], 200);
    }
}
