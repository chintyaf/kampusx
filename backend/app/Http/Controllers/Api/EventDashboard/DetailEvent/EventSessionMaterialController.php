<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventSession;
use App\Models\SessionMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EventSessionMaterialController extends Controller
{
    /**
     * Tampilkan seluruh sesi dari suatu event beserta materinya.
     * Endpoint: GET /api/event-dashboard/{eventId}/post-event/sessions
     */
    public function getSessionsWithMaterials(int $eventId)
    {
        try {
            $event = Event::findOrFail($eventId);

            // Eager load speakers dan materials (diurutkan berdasarkan sort_order)
            $sessions = EventSession::query()
                ->with(['speakers', 'materials' => function ($query) {
                    $query->orderBy('sort_order', 'asc');
                }])
                ->where('event_id', $eventId)
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->get();

            // Transformasi data agar sesuai dengan struktur konsumsi React
            $data = $sessions->map(function ($session) {
                // Formatting data materi
                $materials = $session->materials->map(function ($material) {
                    return [
                        'id' => $material->id,
                        'type' => $material->type,
                        'name' => $material->name,
                        'path_or_url' => $material->path_or_url,
                        // Menghasilkan URL absolut jika berupa file di local storage
                        'url' => in_array($material->type, ['video_file', 'document']) && !filter_var($material->path_or_url, FILTER_VALIDATE_URL)
                            ? asset('storage/' . $material->path_or_url)
                            : $material->path_or_url,
                        'file_size' => $material->file_size,
                        'sort_order' => $material->sort_order,
                    ];
                });

                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'description' => $session->description,
                    'date' => $session->date 
                        ? ($session->date instanceof \Carbon\Carbon || $session->date instanceof \DateTime 
                            ? $session->date->format('d M Y') 
                            : \Carbon\Carbon::parse($session->date)->format('d M Y')) 
                        : 'Belum dijadwalkan',
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'speakers' => $session->speakers->pluck('name')->implode(', '),
                    'videoUrl' => $session->materials->where('type', 'url')->first()?->path_or_url ?? '',
                    'videoMaterialId' => $session->materials->where('type', 'url')->first()?->id ?? null,
                    'videoFileName' => $session->materials->where('type', 'video_file')->first()?->name ?? null,
                    'videoFileMaterialId' => $session->materials->where('type', 'video_file')->first()?->id ?? null,
                    'materials' => $materials->whereIn('type', ['document'])->values(),
                    'published' => $session->is_published,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data sesi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tampilkan seluruh sesi dari suatu event yang berstatus published beserta materinya untuk peserta.
     * Endpoint: GET /api/events/{id}/post-event/sessions
     */
    public function getSessionsWithMaterialsForParticipant($id)
    {
        try {
            $event = Event::where('id', $id)->orWhere('slug', $id)->firstOrFail();

            // Eager load speakers dan materials (diurutkan berdasarkan sort_order)
            $sessions = EventSession::query()
                ->with(['speakers', 'materials' => function ($query) {
                    $query->orderBy('sort_order', 'asc');
                }])
                ->where('event_id', $event->id)
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->get();

            // Transformasi data agar sesuai dengan struktur konsumsi React
            $data = $sessions->map(function ($session) {
                // Formatting data materi
                $materials = $session->materials->map(function ($material) {
                    return [
                        'id' => $material->id,
                        'type' => $material->type,
                        'name' => $material->name,
                        'path_or_url' => $material->path_or_url,
                        // Menghasilkan URL absolut jika berupa file di local storage
                        'url' => in_array($material->type, ['video_file', 'document']) && !filter_var($material->path_or_url, FILTER_VALIDATE_URL)
                            ? asset('storage/' . $material->path_or_url)
                            : $material->path_or_url,
                        'file_size' => $material->file_size,
                        'sort_order' => $material->sort_order,
                    ];
                });

                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'description' => $session->description,
                    'date' => $session->date 
                        ? ($session->date instanceof \Carbon\Carbon || $session->date instanceof \DateTime 
                            ? $session->date->format('d M Y') 
                            : \Carbon\Carbon::parse($session->date)->format('d M Y')) 
                        : 'Belum dijadwalkan',
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'speakers' => $session->speakers->pluck('name')->implode(', '),
                    'videoUrl' => $session->materials->where('type', 'url')->first()?->path_or_url ?? '',
                    'videoMaterialId' => $session->materials->where('type', 'url')->first()?->id ?? null,
                    'videoFileName' => $session->materials->where('type', 'video_file')->first()?->name ?? null,
                    'videoFileMaterialId' => $session->materials->where('type', 'video_file')->first()?->id ?? null,
                    'materials' => $materials->whereIn('type', ['document'])->values(),
                    'published' => $session->is_published,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data sesi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simpan Draft / Publikasikan Sesi.
     * Endpoint: PUT /api/event-dashboard/{eventId}/post-event/sessions/{sessionId}/status
     */
    public function updateSessionStatus(int $eventId, int $sessionId, Request $request)
    {
        $validated = $request->validate([
            'published' => 'required|boolean',
        ]);

        try {
            $session = EventSession::where('event_id', $eventId)->findOrFail($sessionId);
            $session->update([
                'is_published' => $validated['published']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => $validated['published'] 
                    ? 'Sesi berhasil dipublikasikan.' 
                    : 'Sesi berhasil disimpan sebagai draft.',
                'data' => [
                    'id' => $session->id,
                    'published' => $session->is_published
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengubah status sesi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tambahkan materi ke sesi (URL YouTube, Upload Video, atau Upload Dokumen).
     * Endpoint: POST /api/event-dashboard/{eventId}/post-event/sessions/{sessionId}/materials
     */
    public function storeMaterial(int $eventId, int $sessionId, Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['url', 'video_file', 'document'])],
            // Jika tipe url, maka wajib diisi URL valid. Jika tipe file, wajib berupa file.
            'url' => 'required_if:type,url|nullable|url',
            'file' => 'required_if:type,video_file,document|nullable|file|max:51200', // max 50MB sesuai info UI
            'name' => 'nullable|string|max:255',
        ]);

        try {
            $session = EventSession::where('event_id', $eventId)->findOrFail($sessionId);

            $type = $validated['type'];
            $name = $validated['name'] ?? '';
            $pathOrUrl = '';
            $fileSize = null;

            if ($type === 'url') {
                $pathOrUrl = $validated['url'];
                if (empty($name)) {
                    $name = 'YouTube Replay';
                }

                // Cek apakah material bertipe URL (video replay) sudah ada di sesi ini.
                // Jika sudah ada, update yang lama agar tidak duplikat di UI.
                $existingUrlMaterial = SessionMaterial::where('event_session_id', $sessionId)
                    ->where('type', 'url')
                    ->first();

                if ($existingUrlMaterial) {
                    $existingUrlMaterial->update([
                        'name' => $name,
                        'path_or_url' => $pathOrUrl,
                    ]);

                    return response()->json([
                        'status' => 'success',
                        'message' => 'Link replay video berhasil diperbarui.',
                        'data' => $existingUrlMaterial
                    ]);
                }

            } else {
                $file = $request->file('file');
                if (!$file || !$file->isValid()) {
                    $errorMessage = 'Berkas file wajib diunggah untuk tipe ' . $type;
                    if ($file && !$file->isValid()) {
                        $errorMessage = 'Unggah berkas gagal: ' . $file->getErrorMessage();
                    } elseif ($request->headers->get('content-length') > 52428800) { // 50MB
                        $errorMessage = 'Berkas terlalu besar (Maksimum 50MB).';
                    }
                    return response()->json([
                        'status' => 'error',
                        'message' => $errorMessage
                    ], 422);
                }

                // Format ukuran file
                $fileSize = $this->formatBytes($file->getSize());

                if (empty($name)) {
                    $name = $file->getClientOriginalName();
                }

                // Tentukan folder penyimpanan
                $folder = "materials/sessions/{$sessionId}/{$type}";
                $path = Storage::disk('public')->putFile($folder, $file);
                $pathOrUrl = $path;

                // Jika tipe adalah video_file, pastikan hanya ada satu video file per sesi
                if ($type === 'video_file') {
                    $existingVideoFile = SessionMaterial::where('event_session_id', $sessionId)
                        ->where('type', 'video_file')
                        ->first();

                    if ($existingVideoFile) {
                        // Hapus file lama dari storage
                        Storage::disk('public')->delete($existingVideoFile->path_or_url);
                        
                        $existingVideoFile->update([
                            'name' => $name,
                            'path_or_url' => $pathOrUrl,
                            'file_size' => $fileSize,
                        ]);

                        return response()->json([
                            'status' => 'success',
                            'message' => 'Berkas video replay berhasil diperbarui.',
                            'data' => $existingVideoFile
                        ]);
                    }
                }
            }

            // Hitung sort_order terbesar di sesi ini
            $maxSortOrder = SessionMaterial::where('event_session_id', $sessionId)->max('sort_order') ?? -1;

            $material = SessionMaterial::create([
                'event_session_id' => $session->id,
                'type' => $type,
                'name' => $name,
                'path_or_url' => $pathOrUrl,
                'file_size' => $fileSize,
                'sort_order' => $maxSortOrder + 1,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Materi berhasil ditambahkan.',
                'data' => $material
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunggah materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus materi dari sesi (dan hapus file fisiknya jika ada).
     * Endpoint: DELETE /api/event-dashboard/{eventId}/post-event/sessions/{sessionId}/materials/{materialId}
     */
    public function destroyMaterial(int $eventId, int $sessionId, int $materialId)
    {
        try {
            // Pastikan sesi miliki eventId yg valid
            $session = EventSession::where('event_id', $eventId)->findOrFail($sessionId);
            
            $material = SessionMaterial::where('event_session_id', $sessionId)->findOrFail($materialId);

            // Jika bertipe file, hapus file fisiknya dari storage
            if (in_array($material->type, ['video_file', 'document'])) {
                if (Storage::disk('public')->exists($material->path_or_url)) {
                    Storage::disk('public')->delete($material->path_or_url);
                }
            }

            $material->delete();

            // Atur ulang sort_order sisa materi
            $remainingMaterials = SessionMaterial::where('event_session_id', $sessionId)
                ->orderBy('sort_order', 'asc')
                ->get();

            foreach ($remainingMaterials as $index => $item) {
                $item->update(['sort_order' => $index]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Materi berhasil dihapus.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Urutkan kembali materi (Drag and Drop).
     * Endpoint: POST /api/event-dashboard/{eventId}/post-event/sessions/{sessionId}/materials/reorder
     */
    public function reorderMaterials(int $eventId, int $sessionId, Request $request)
    {
        $validated = $request->validate([
            'material_ids' => 'required|array',
            'material_ids.*' => 'required|integer|exists:session_materials,id',
        ]);

        try {
            // Pastikan sesi valid
            $session = EventSession::where('event_id', $eventId)->findOrFail($sessionId);

            DB::transaction(function () use ($validated, $sessionId) {
                foreach ($validated['material_ids'] as $index => $id) {
                    SessionMaterial::where('event_session_id', $sessionId)
                        ->where('id', $id)
                        ->update(['sort_order' => $index]);
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Urutan materi berhasil diperbarui.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengurutkan materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper untuk memformat byte ukuran file ke string format yang cantik.
     */
    private function formatBytes(int $bytes, int $precision = 1): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
