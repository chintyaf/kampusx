<?php

namespace App\Services;

use App\Models\SecureMedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SecureMediaService
{
    /**
     * Store an uploaded file securely using either database BLOB or optimized private disk.
     */
    public function store(UploadedFile $file, string $storageType = 'local'): SecureMedia
    {
        $storageType = strtolower($storageType);
        if (!in_array($storageType, ['blob', 'local'])) {
            $storageType = 'local';
        }

        $filename = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        if ($storageType === 'blob') {
            // Read binary content
            $content = file_get_contents($file->getRealPath());

            return SecureMedia::create([
                'filename' => $filename,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'storage_type' => 'blob',
                'file_path' => null,
                'content' => $content,
            ]);
        } else {
            // Hashed penamaan file untuk keamanan
            $hash = hash('sha256', Str::random(40) . microtime() . $filename);
            $extension = $file->getClientOriginalExtension();
            $hashedFilename = $hash . ($extension ? '.' . $extension : '');

            // Struktur direktori berlapis: secure_media/{ab}/{cd}/{hash}.ext
            $folderLevel1 = substr($hash, 0, 2);
            $folderLevel2 = substr($hash, 2, 2);
            $subFolder = "secure_media/{$folderLevel1}/{$folderLevel2}";

            // Simpan di disk private 'local'
            $filePath = Storage::disk('local')->putFileAs($subFolder, $file, $hashedFilename);

            return SecureMedia::create([
                'filename' => $filename,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'storage_type' => 'local',
                'file_path' => $filePath,
                'content' => null,
            ]);
        }
    }

    /**
     * Serve the secure media file as a dynamic response.
     */
    public function serve(SecureMedia $media)
    {
        if ($media->storage_type === 'blob') {
            return response($media->content)
                ->header('Content-Type', $media->mime_type)
                ->header('Content-Length', $media->file_size)
                ->header('Content-Disposition', 'inline; filename="' . $media->filename . '"');
        }

        // serve from local private storage
        if (!Storage::disk('local')->exists($media->file_path)) {
            abort(404, 'File tidak ditemukan di sistem private.');
        }

        $absolutePath = Storage::disk('local')->path($media->file_path);

        return response()->file($absolutePath, [
            'Content-Type' => $media->mime_type,
            'Content-Disposition' => 'inline; filename="' . $media->filename . '"'
        ]);
    }

    /**
     * Generate and serve an optimized thumbnail dynamically and securely.
     */
    public function serveThumbnail(SecureMedia $media, int $targetWidth = 150)
    {
        // Fallback: If not an image, serve the original file
        if (!Str::startsWith($media->mime_type, 'image/')) {
            return $this->serve($media);
        }

        // Get raw image content
        $imageContent = null;
        if ($media->storage_type === 'blob') {
            $imageContent = $media->content;
        } else {
            if (!Storage::disk('local')->exists($media->file_path)) {
                abort(404, 'File tidak ditemukan di sistem private.');
            }
            $imageContent = Storage::disk('local')->get($media->file_path);
        }

        // Check if GD extension is loaded
        if (!extension_loaded('gd') || empty($imageContent)) {
            return $this->serve($media);
        }

        try {
            // Create image resource from binary string
            $srcImage = @imagecreatefromstring($imageContent);
            if (!$srcImage) {
                return $this->serve($media);
            }

            $srcWidth = imagesx($srcImage);
            $srcHeight = imagesy($srcImage);

            if ($srcWidth <= 0 || $srcHeight <= 0) {
                imagedestroy($srcImage);
                return $this->serve($media);
            }

            // Calculate height keeping aspect ratio
            $targetHeight = (int) (($srcHeight / $srcWidth) * $targetWidth);

            // Create canvas for thumbnail
            $dstImage = imagecreatetruecolor($targetWidth, $targetHeight);

            // Handle transparency for PNG/GIF/WEBP
            if (in_array($media->mime_type, ['image/png', 'image/gif', 'image/webp'])) {
                imagealphablending($dstImage, false);
                imagesavealpha($dstImage, true);
                $transparent = imagecolorallocatealpha($dstImage, 255, 255, 255, 127);
                imagefilledrectangle($dstImage, 0, 0, $targetWidth, $targetHeight, $transparent);
            }

            // Resize
            imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $targetWidth, $targetHeight, $srcWidth, $srcHeight);

            // Output to buffer
            ob_start();
            if ($media->mime_type === 'image/jpeg') {
                imagejpeg($dstImage, null, 80);
            } elseif ($media->mime_type === 'image/png') {
                imagepng($dstImage, null, 7);
            } elseif ($media->mime_type === 'image/webp') {
                imagewebp($dstImage, null, 80);
            } else {
                // Default fallback output
                imagepng($dstImage);
            }
            $thumbnailData = ob_get_clean();

            // Free memory
            imagedestroy($srcImage);
            imagedestroy($dstImage);

            return response($thumbnailData)
                ->header('Content-Type', $media->mime_type)
                ->header('Content-Length', strlen($thumbnailData))
                ->header('Content-Disposition', 'inline; filename="tnb_' . $media->filename . '"');

        } catch (\Exception $e) {
            // In case of any processing exception, safely fallback to the original file
            return $this->serve($media);
        }
    }

    /**
     * Delete the secure media record and its physical file if applicable.
     */
    public function delete(SecureMedia $media): bool
    {
        if ($media->storage_type === 'local' && $media->file_path) {
            if (Storage::disk('local')->exists($media->file_path)) {
                Storage::disk('local')->delete($media->file_path);
            }
        }

        return $media->delete();
    }
}
