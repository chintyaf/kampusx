<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class EventMaterialController extends Controller
{
    /**
     * Tampilkan daftar materi yang berstatus published ke peserta (Participant Portal)
     */
    public function index($eventId)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();
            
        $materials = EventMaterial::where('event_id', $event->id)
            ->where('status', 'published')
            ->orderBy('session_name', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        // Transform data untuk menyertakan absolute URL untuk berkas fisik
        $data = $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'event_id' => $material->event_id,
                'session_name' => $material->session_name,
                'speaker_name' => $material->speaker_name,
                'title' => $material->title,
                'description' => $material->description,
                'type' => $material->type,
                'content_url' => $material->content_url,
                'file_path' => $material->file_path,
                // Jika ada file fisik, buatkan absolute url
                'file_url' => $material->file_path ? asset('storage/' . $material->file_path) : null,
                'status' => $material->status,
                'created_at' => $material->created_at,
                'updated_at' => $material->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil materi event.',
            'data' => $data
        ], 200);
    }

    /**
     * Tampilkan seluruh materi (draft & published) ke organizer
     */
    public function organizerIndex($eventId)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();

        $materials = EventMaterial::where('event_id', $event->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Sertakan absolute URL untuk file fisik
        $data = $materials->map(function ($material) {
            return [
                'id' => $material->id,
                'event_id' => $material->event_id,
                'session_name' => $material->session_name,
                'speaker_name' => $material->speaker_name,
                'title' => $material->title,
                'description' => $material->description,
                'type' => $material->type,
                'content_url' => $material->content_url,
                'file_path' => $material->file_path,
                'file_url' => $material->file_path ? asset('storage/' . $material->file_path) : null,
                'status' => $material->status,
                'created_at' => $material->created_at,
                'updated_at' => $material->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    /**
     * Tambah materi baru (Organizer)
     */
    public function store(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();

        // Validasi input dasar
        $request->validate([
            'title' => 'required|string|max:255',
            'session_name' => 'nullable|string|max:255',
            'speaker_name' => 'nullable|string|max:255',
            'type' => 'required|string|in:document,code_repo,design_interactive,media_form',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
            'content_url' => 'nullable|url|max:500',
            'file' => 'nullable|file|max:5120', // Maksimal 5MB (5120 KB)
        ]);

        $filePath = null;
        $contentUrl = $request->content_url;

        // Logika Penyimpanan File Fisik (Tipe document saja)
        if ($request->type === 'document' && $request->hasFile('file')) {
            $file = $request->file('file');
            try {
                $filePath = Storage::disk('public')->putFile('event_materials', $file);
                // Jika upload file fisik, abaikan content_url
                $contentUrl = null;
            } catch (\Exception $e) {
                Log::error("Gagal mengunggah file materi: " . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengunggah file materi ke server.'
                ], 500);
            }
        }

        $material = EventMaterial::create([
            'event_id' => $event->id,
            'session_name' => $request->session_name,
            'speaker_name' => $request->speaker_name,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'content_url' => $contentUrl,
            'file_path' => $filePath,
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil ditambahkan.',
            'data' => $material
        ], 201);
    }

    /**
     * Edit / Update materi (Organizer)
     */
    public function update(Request $request, $eventId, $materialId)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();

        $material = EventMaterial::where('event_id', $event->id)->findOrFail($materialId);

        // Validasi input
        $request->validate([
            'title' => 'required|string|max:255',
            'session_name' => 'nullable|string|max:255',
            'speaker_name' => 'nullable|string|max:255',
            'type' => 'required|string|in:document,code_repo,design_interactive,media_form',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
            'content_url' => 'nullable|url|max:500',
            'file' => 'nullable|file|max:5120', // Maksimal 5MB
        ]);

        $filePath = $material->file_path;
        $contentUrl = $request->content_url;

        // Logika pembaruan file fisik
        if ($request->type === 'document') {
            if ($request->hasFile('file')) {
                // Hapus file lama jika ada
                if ($material->file_path) {
                    Storage::disk('public')->delete($material->file_path);
                }

                // Unggah file baru
                try {
                    $file = $request->file('file');
                    $filePath = Storage::disk('public')->putFile('event_materials', $file);
                    $contentUrl = null;
                } catch (\Exception $e) {
                    Log::error("Gagal memperbarui file materi: " . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal memperbarui file materi ke server.'
                    ], 500);
                }
            } else {
                // Jika tipe document diubah menjadi menggunakan external URL saja
                if ($contentUrl) {
                    if ($material->file_path) {
                        Storage::disk('public')->delete($material->file_path);
                        $filePath = null;
                    }
                }
            }
        } else {
            // Jika beralih dari document ke tipe lain (bukan document)
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
                $filePath = null;
            }
        }

        $material->update([
            'session_name' => $request->session_name,
            'speaker_name' => $request->speaker_name,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'content_url' => $contentUrl,
            'file_path' => $filePath,
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil diperbarui.',
            'data' => $material
        ], 200);
    }

    /**
     * Hapus materi (Organizer)
     */
    public function destroy($eventId, $id)
    {
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();

        $material = EventMaterial::where('event_id', $event->id)->findOrFail($id);

        // Hapus file fisik dari storage jika ada
        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil dihapus.'
        ], 200);
    }
}
