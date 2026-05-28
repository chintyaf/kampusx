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
                $template->background_url = url("/api/certificate/background/{$eventId}");
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

    /**
     * Memverifikasi keaslian sertifikat berdasarkan ticket_code.
     * Dapat diakses secara publik (tanpa login).
     */
    public function verifyCertificate(string $ticketCode)
    {
        try {
            $ticket = null;
            if (strpos($ticketCode, 'CERT-') === 0) {
                $parts = explode('-', $ticketCode);
                if (count($parts) >= 3) {
                    $eventId = $parts[1];
                    $surveyResponseId = $parts[2];
                    
                    $surveyResponse = \App\Models\SurveyResponse::find($surveyResponseId);
                    if ($surveyResponse && $surveyResponse->event_id == $eventId) {
                        $ticket = Ticket::with([
                            'orderItem.order.event.organizer',
                            'orderItem.order.event.institution'
                        ])
                        ->where('participant_id', $surveyResponse->user_id)
                        ->whereHas('orderItem.order', function($q) use ($eventId) {
                            $q->where('event_id', $eventId);
                        })
                        ->first();
                    }
                }
            }

            if (!$ticket) {
                $ticket = Ticket::with([
                    'orderItem.order.event.organizer',
                    'orderItem.order.event.institution'
                ])
                ->where('ticket_code', $ticketCode)
                ->first();
            }

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

            // Tentukan nama institusi penyelenggara atau nama organizer
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
     */
    public function getCertificateRenderData(string $ticketCode)
    {
        try {
            $ticket = null;
            if (strpos($ticketCode, 'CERT-') === 0) {
                $parts = explode('-', $ticketCode);
                if (count($parts) >= 3) {
                    $eventId = $parts[1];
                    $surveyResponseId = $parts[2];
                    
                    $surveyResponse = \App\Models\SurveyResponse::find($surveyResponseId);
                    if ($surveyResponse && $surveyResponse->event_id == $eventId) {
                        $ticket = Ticket::with([
                            'orderItem.order.event.certificateTemplate.elements',
                            'orderItem.order.event.organizer',
                            'orderItem.order.event.institution'
                        ])
                        ->where('participant_id', $surveyResponse->user_id)
                        ->whereHas('orderItem.order', function($q) use ($eventId) {
                            $q->where('event_id', $eventId);
                        })
                        ->first();
                    }
                }
            }

            if (!$ticket) {
                $ticket = Ticket::with([
                    'orderItem.order.event.certificateTemplate.elements',
                    'orderItem.order.event.organizer',
                    'orderItem.order.event.institution'
                ])
                ->where('ticket_code', $ticketCode)
                ->first();
            }

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

            $organizerName = $event->institution?->name ?? ($event->organizer?->name ?? 'KampusX Organizer');
            $template->background_url = url("/api/certificate/background/{$event->id}");

            $surveyResponse = \App\Models\SurveyResponse::where('user_id', $ticket->participant_id)
                ->where('event_id', $event->id)
                ->first();

            $ticketStatus = $ticket->status;
            if ($surveyResponse) {
                $ticketStatus = 'used'; // Force used status to unlock on frontend
            }

            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => [
                    'ticket' => [
                        'ticket_code' => $ticketCode,
                        'attendee_name' => $ticket->attendee_name,
                        'status' => $ticketStatus
                    ],
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'start_date' => $event->start_date ? $event->start_date->translatedFormat('d F Y') : null,
                        'organizer_name' => $organizerName
                    ],
                    'template' => $template
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
     * Metode ini memanfaatkan middleware CORS Laravel sehingga dapat dimuat di canvas lintas-origin.
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
