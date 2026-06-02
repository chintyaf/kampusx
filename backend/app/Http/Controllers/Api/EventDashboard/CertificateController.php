<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\CertificateTemplate;
use App\Models\CertificateElement;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    /**
     * Helper privat untuk mencari tiket berdasarkan ticket_code atau custom prefix CERT-.
     * Mencegah duplikasi query antara fungsi verifikasi dan render data.
     */
    private function findTicketByCode(string $ticketCode, array $relations = [])
    {
        $realTicketCode = $ticketCode;

        // Jika format menggunakan custom prefix CERT-[Ticket Code]
        if (strpos($ticketCode, 'CERT-') === 0) {
            $realTicketCode = substr($ticketCode, 5); // Potong string 'CERT-'
        }

        return Ticket::with($relations)
            ->where('ticket_code', $realTicketCode)
            ->first();
    }

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
                // Sediakan URL penuh untuk background_path agar frontend mudah memuat gambar dengan CORS
                // Tambahkan parameter cache-buster agar browser memuat gambar baru setelah diupdate
                $template->background_url = url("/api/certificate/background/{$eventId}?v=" . ($template->updated_at ? $template->updated_at->timestamp : time()));
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

    /**
     * Memverifikasi keaslian sertifikat berdasarkan ticket_code.
     * Dapat diakses secara publik (tanpa login).
     */
    public function verifyCertificate(string $ticketCode)
    {
        try {
            // Memanfaatkan helper findTicketByCode untuk mengambil data tiket
            $ticket = $this->findTicketByCode($ticketCode, [
                'orderItem.order.event.organizer',
                'orderItem.order.event.institution'
            ]);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Sertifikat tidak ditemukan atau tidak valid.'
                ], 404);
            }

            $event = $ticket->orderItem?->order?->event;
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Event terkait sertifikat ini tidak ditemukan.'
                ], 404);
            }

            $organizerName = $event->institution?->name ?? ($event->organizer?->name ?? 'KampusX Organizer');

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Sertifikat terverifikasi dengan sukses.',
                'data' => [
                    'certificate_number' => $ticketCode,
                    'attendee_name' => $ticket->attendee_name,
                    'event_title' => $event->title,
                    'event_date' => $event->start_date ? $event->start_date->translatedFormat('d F Y') : null,
                    'organizer_name' => $organizerName,
                    'status' => $ticket->status,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal memverifikasi sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

/**
     * Mengambil data lengkap template sertifikat beserta informasi peserta
     * untuk dirender di sisi client.
     * * PERBAIKAN: Ditambahkan parameter string $ticketCode agar tidak undefined variable.
     */
    public function getCertificateRenderData(string $ticketCode)
    {
        try {
            // Memanfaatkan helper findTicketByCode untuk mengambil data tiket beserta template element
            $ticket = $this->findTicketByCode($ticketCode, [
                'orderItem.order.event.certificateTemplate.elements',
                'orderItem.order.event.organizer',
                'orderItem.order.event.institution'
            ]);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Sertifikat tidak ditemukan.'
                ], 404);
            }

            $event = $ticket->orderItem?->order?->event;
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Event terkait sertifikat ini tidak ditemukan.'
                ], 404);
            }

            $template = $event->certificateTemplate;
            if (!$template) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Template sertifikat belum dibuat oleh pihak penyelenggara.'
                ], 404);
            }

            $organizerName = $event->institution?->name ?? $event->organizer?->name;
            $template->background_url = url("/api/certificate/background/{$event->id}?v=" . ($template->updated_at ? $template->updated_at->timestamp : time()));

            $surveyResponse = \App\Models\SurveyResponse::where('user_id', $ticket->participant_id)
                ->where('event_id', $event->id)
                ->first();

            $ticketStatus = $ticket->status;
            if ($surveyResponse) {
                $ticketStatus = 'used'; // Force used status to unlock on frontend
            }

            // Map data element dari snake_case (DB) ke camelCase (Format Admin/Frontend)
            $formattedElements = $template->elements->map(function ($element) use ($ticketCode, $ticket, $event, $organizerName) {
                $typeMap = [
                    'nama_peserta'  => 'f1',
                    'id_sertifikat' => 'f2',
                    'qr_code'       => 'f3',
                    'nama_event'    => 'f4',
                    'tanggal'       => 'f5',
                    'instansi'      => 'f6',
                    'teks_kustom'   => 'f7', // Fallback default
                ];
                $fieldId = $typeMap[$element->element_type] ?? 'f7';

                // Set default label jika dari frontend tidak mengirimkan previewData
                $labelPlaceholder = $element->custom_value ?? '{ Teks Kustom }';
                if ($fieldId === 'f1') $labelPlaceholder = $ticket->attendee_name ?? '{ Nama Peserta }';
                if ($fieldId === 'f2') $labelPlaceholder = $ticket->ticket_code ?? '{ ID Sertifikat }';
                if ($fieldId === 'f3') $labelPlaceholder = env('FRONTEND_URL') . "/certificate/verify/{$ticketCode}";
                if ($fieldId === 'f4') $labelPlaceholder = $event->title ?? '{ Nama Event }';
                if ($fieldId === 'f5') $labelPlaceholder = $event->start_date ? $event->start_date->translatedFormat('d F Y') : '{ Tanggal }';
                if ($fieldId === 'f6') $labelPlaceholder = $organizerName;

                return [
                    'id'          => "db-" . $element->id,
                    'fieldId'     => $fieldId,
                    'label'       => $labelPlaceholder,
                    'x'           => (float) $element->position_x,
                    'y'           => (float) $element->position_y,
                    'fontSize'    => (int) $element->font_size,
                    'color'       => $element->font_color ?? '#000000',
                    'fontFamily'  => $element->font_family ?? 'Arial',
                    'textAlign'   => $element->text_align ?? 'center',
                    'bold'        => in_array($element->element_type, ['nama_peserta', 'nama_event']),
                    'elementType' => $element->element_type
                ];
            });

            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => [
                    'ticket' => [
                        'ticket_code' => $ticket->ticket_code, // Lebih aman mengambil dari properti objek tiket aslinya
                        'attendee_name' => $ticket->attendee_name,
                        'status' => $ticketStatus
                    ],
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'start_date' => $event->start_date ? $event->start_date->translatedFormat('d F Y') : null,
                        'organizer_name' => $organizerName
                    ],
                    'template' => [
                        'id' => $template->id,
                        'event_id' => $template->event_id,
                        'background_path' => $template->background_path,
                        'background_url' => $template->background_url,
                        'canvas_width' => $template->canvas_width,
                        'canvas_height' => $template->canvas_height,
                        'elements' => $formattedElements
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal memuat data cetak sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Mengambil file background gambar sertifikat secara aman melalui API Publik.
     */
    public function getBackgroundPublic(int $eventId)
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
