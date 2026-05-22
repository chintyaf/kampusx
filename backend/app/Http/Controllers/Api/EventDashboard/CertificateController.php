<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\CertificateTemplate;
use App\Models\CertificateElement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    /**
     * Menampilkan template sertifikat beserta elemennya untuk suatu event.
     */
    public function show(int $eventId)
    {
        try {
            $event = Event::findOrFail($eventId);
            
            // Ambil template dengan elemen-elemennya
            $template = CertificateTemplate::where('event_id', $eventId)
                ->with('elements')
                ->first();

            if ($template) {
                // Sediakan URL penuh untuk background_path agar frontend mudah memuat gambar
                $template->background_url = Storage::disk('public')->url($template->background_path);
            }

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Template sertifikat berhasil diambil.',
                'data' => $template
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal mengambil data template sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan (buat baru atau perbarui) template sertifikat beserta elemen-elemennya.
     */
    public function storeTemplate(Request $request, ?int $eventId = null)
    {
        // Jika eventId dikirim melalui URL parameter tetapi tidak ada di request body, gabungkan ke request.
        if ($eventId && !$request->has('event_id')) {
            $request->merge(['event_id' => $eventId]);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'background_path' => 'required|string',
            'canvas_width' => 'required|integer',
            'canvas_height' => 'required|integer',
            'elements' => 'required|array',
            'elements.*.element_type' => 'required|string',
            'elements.*.position_x' => 'required|numeric',
            'elements.*.position_y' => 'required|numeric',
            'elements.*.font_size' => 'nullable|integer',
            'elements.*.font_color' => 'nullable|string',
            'elements.*.font_family' => 'nullable|string',
            'elements.*.text_align' => 'nullable|string',
            'elements.*.custom_value' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. Simpan atau Update Template Utama
            $template = CertificateTemplate::updateOrCreate(
                ['event_id' => $validated['event_id']],
                [
                    'background_path' => $validated['background_path'],
                    'canvas_width' => $validated['canvas_width'],
                    'canvas_height' => $validated['canvas_height'],
                ]
            );

            // 2. Hapus elemen lama (jika ini proses update/edit)
            $template->elements()->delete();

            // 3. Masukkan elemen baru
            $elementsData = collect($validated['elements'])->map(function ($el) use ($template) {
                return [
                    'template_id' => $template->id,
                    'element_type' => $el['element_type'],
                    'position_x' => $el['position_x'],
                    'position_y' => $el['position_y'],
                    'font_size' => $el['font_size'] ?? 24,
                    'font_color' => $el['font_color'] ?? '#000000',
                    'font_family' => $el['font_family'] ?? 'Arial',
                    'text_align' => $el['text_align'] ?? 'center',
                    'custom_value' => $el['custom_value'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });

            CertificateElement::insert($elementsData->toArray());

            DB::commit();

            return response()->json(['message' => 'Template Sertifikat berhasil disimpan!']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Gagal menyimpan template', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint terpisah untuk upload gambar background saja.
     * Sangat berguna bagi frontend untuk memproses upload terlebih dahulu saat mendesain.
     */
    public function uploadBackground(Request $request, int $eventId)
    {
        $event = Event::findOrFail($eventId);

        $request->validate([
            'background' => 'required|file|image|max:10240', // Maks 10MB
        ]);

        try {
            $file = $request->file('background');
            $path = $file->store("certificates/{$eventId}", 'public');
            $url = Storage::disk('public')->url($path);

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Gambar background berhasil diunggah.',
                'data' => [
                    'background_path' => $path,
                    'background_url' => $url
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal mengunggah gambar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus template sertifikat beserta seluruh elemennya.
     */
    public function destroy(int $eventId)
    {
        try {
            $template = CertificateTemplate::where('event_id', $eventId)->first();

            if (!$template) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Template sertifikat tidak ditemukan.'
                ], 404);
            }

            DB::beginTransaction();

            // Hapus file fisik background dari storage
            if ($template->background_path && Storage::disk('public')->exists($template->background_path)) {
                Storage::disk('public')->delete($template->background_path);
            }

            // Hapus template (elemen terhapus otomatis karena cascadeOnDelete)
            $template->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Template sertifikat berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal menghapus template sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil file background gambar sertifikat secara aman melalui API.
     * Metode ini memanfaatkan middleware CORS Laravel sehingga dapat dimuat di canvas lintas-origin.
     */
    public function getBackground(int $eventId)
    {
        try {
            $template = CertificateTemplate::where('event_id', $eventId)->first();
            if (!$template || !$template->background_path) {
                return response()->json(['message' => 'Background not found'], 404);
            }

            $path = $template->background_path;
            if (!Storage::disk('public')->exists($path)) {
                return response()->json(['message' => 'File not found on storage'], 404);
            }

            return response()->file(Storage::disk('public')->path($path));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
