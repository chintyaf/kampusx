<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SecureMedia;
use App\Services\SecureMediaService;
use Illuminate\Http\Request;

class SecureMediaController extends Controller
{
    protected $secureMediaService;

    public function __construct(SecureMediaService $secureMediaService)
    {
        $this->secureMediaService = $secureMediaService;
    }

    /**
     * Upload image/media file securely.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240', // Maks 10MB
            'storage_type' => 'nullable|string|in:blob,local',
        ]);

        try {
            $storageType = $request->input('storage_type', 'local');
            $media = $this->secureMediaService->store($request->file('file'), $storageType);

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Berkas berhasil diunggah secara aman.',
                'data' => [
                    'id' => $media->id,
                    'filename' => $media->filename,
                    'mime_type' => $media->mime_type,
                    'file_size' => $media->file_size,
                    'storage_type' => $media->storage_type,
                    'url' => route('secure-media.serve', ['id' => $media->id]),
                    'thumbnail_url' => route('secure-media.thumbnail', ['id' => $media->id]),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal mengunggah berkas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Serve secure media dynamically.
     */
    public function serve(int $id)
    {
        try {
            $media = SecureMedia::findOrFail($id);
            return $this->secureMediaService->serve($media);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Berkas tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Serve optimized secure thumbnail.
     */
    public function serveThumbnail(int $id)
    {
        try {
            $media = SecureMedia::findOrFail($id);
            return $this->secureMediaService->serveThumbnail($media);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Thumbnail tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete secure media.
     */
    public function destroy(int $id)
    {
        try {
            $media = SecureMedia::findOrFail($id);
            $this->secureMediaService->delete($media);

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Berkas berhasil dihapus dari penyimpanan aman.'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Berkas tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
