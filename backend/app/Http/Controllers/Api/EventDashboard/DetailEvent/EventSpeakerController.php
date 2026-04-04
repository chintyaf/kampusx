<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Speaker;
use Illuminate\Support\Facades\DB;

class EventSpeakerController extends Controller
{
    /**
     * Mengambil daftar pembicara berdasarkan Event ID
     */
    public function index($eventId)
    {
        try {
            // Mengambil speaker yang terhubung dengan sesi pada event ini
            $speakers = Speaker::whereHas('sessions', function ($query) use ($eventId) {
                // Pastikan tabel event_sessions memiliki kolom 'event_id'
                $query->where('event_id', $eventId);
            })
            ->with('sessions') // Eager load relasi sessions agar data name dari session ikut terbawa
            ->orderBy('id', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Daftar pembicara berhasil diambil',
                'data'    => $speakers
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal mengambil data pembicara: ' . $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile()
            ], 500);
        }
    }

    /**
     * Menyimpan atau mengupdate daftar pembicara
     */
    public function update(Request $request, $eventId)
    {
        // Validasi struktur data yang dikirim dari React
        $request->validate([
            'speakers'                  => 'required|array',
            'speakers.*.id'             => 'nullable|exists:speakers,id', // Opsional: pastikan ID valid jika dikirim untuk update
            'speakers.*.name'           => 'required|string|max:255',
            'speakers.*.role'           => 'nullable|string|max:255',
            'speakers.*.bio'            => 'nullable|string', // Tambahkan validasi bio

            // Sesuaikan key dengan nama kolom di database (social_link)
            'speakers.*.social_link'             => 'nullable|array',
            'speakers.*.social_link.*.platform'  => 'required_with:speakers.*.social_link|string',
            'speakers.*.social_link.*.url'       => 'required_with:speakers.*.social_link|url',

            'speakers.*.expertise'      => 'nullable|array',

            // Relasi ke tabel pivot
            'speakers.*.sessions'       => 'nullable|array',
            'speakers.*.sessions.*'     => 'exists:event_sessions,id',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->speakers as $speakerData) {

                // Proses Simpan / Update
                // Kita tidak lagi menyimpan session_id di tabel speaker, melainkan event_id
                $speaker = Speaker::updateOrCreate(
                    ['id' => $speakerData['id'] ?? null], // Cari berdasarkan ID jika ada
                    [
                        'event_id'    => $eventId, // Gunakan parameter $eventId dari URL
                        'name'        => $speakerData['name'],
                        'role'        => $speakerData['role'] ?? null,
                        'bio'         => $speakerData['bio'] ?? null, // Simpan data bio
                        'social_link' => $speakerData['social_link'] ?? null, // Simpan sebagai array (Laravel cast ke JSON)
                        'expertise'   => $speakerData['expertise'] ?? null,
                    ]
                );

                // Update data di pivot table 'event_session_speakers'
                if (isset($speakerData['sessions'])) {
                    // Sync akan mengurus insert & delete relasi otomatis di tabel pivot
                    $speaker->sessions()->sync($speakerData['sessions']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Semua pembicara berhasil disimpan',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }
}
