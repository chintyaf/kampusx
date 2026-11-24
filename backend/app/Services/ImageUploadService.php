<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    /**
     * Upload gambar dengan nama file unik.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string|null $prefix
     * @return string
     */
    public function upload(
        UploadedFile $file,
        string $folder,
        ?string $prefix = null
    ): string {
        $extension = $file->getClientOriginalExtension();

        $fileName = ($prefix ?? 'image')
            . '_' . time()
            . '_' . Str::uuid()
            . '.' . $extension;

        return $file->storeAs($folder, $fileName, 'public');
    }

    /**
     * Menghapus gambar dari public storage.
     */
    public function delete(?string $path): bool
    {
        if (!$path) {
            return false;
        }

        // Jangan menghapus URL eksternal.
        if (
            Str::startsWith($path, ['http://', 'https://'])
        ) {
            return false;
        }

        return Storage::disk('public')->delete($path);
    }

    /**
     * Mengganti gambar lama dengan gambar baru.
     *
     * Upload gambar baru terlebih dahulu.
     * Hapus gambar lama setelah upload berhasil.
     */
    public function replace(
        UploadedFile $file,
        string $folder,
        ?string $oldPath = null,
        ?string $prefix = null
    ): string {
        $newPath = $this->upload($file, $folder, $prefix);

        if ($oldPath && $oldPath !== $newPath) {
            $this->delete($oldPath);
        }

        return $newPath;
    }

    /**
     * Mengubah path menjadi URL publik.
     */
    public function url(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (
            Str::startsWith($path, ['http://', 'https://'])
        ) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
