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
        // Validasi struktur data
        $request->validate([
            'speakers'                           => 'required|array',
            'speakers.*.id'                      => 'nullable|exists:speakers,id',
            'speakers.*.name'                    => 'required|string|max:255',
            'speakers.*.role'                    => 'required|string|max:255', // Sesuaikan dengan React (Required)
            'speakers.*.bio'                     => 'nullable|string',

            // Validasi JSON / Array
            'speakers.*.social_link'             => 'nullable|array',
            'speakers.*.social_link.*.platform'  => 'required_with:speakers.*.social_link|string',
            'speakers.*.social_link.*.url'       => 'required_with:speakers.*.social_link|url',
            'speakers.*.expertise'               => 'nullable|array',

            // Relasi Pivot
            'speakers.*.sessions'                => 'nullable|array',
            'speakers.*.sessions.*'              => 'exists:event_sessions,id',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->speakers as $speakerData) {

                // Siapkan data yang akan disimpan (Fallback array kosong untuk JSON)
                $dataToSave = [
                    'event_id'    => $eventId,
                    'name'        => $speakerData['name'],
                    'role'        => $speakerData['role'],
                    'bio'         => $speakerData['bio'] ?? null,
                    'social_link' => $speakerData['social_link'] ?? [],
                    'expertise'   => $speakerData['expertise'] ?? [],
                ];

                // Proses Simpan / Update yang lebih aman
                if (!empty($speakerData['id'])) {
                    // Update data yang sudah ada
                    $speaker = Speaker::where('id', $speakerData['id'])
                                      ->where('event_id', $eventId) // Keamanan tambahan
                                      ->firstOrFail();
                    $speaker->update($dataToSave);
                } else {
                    // Buat data baru
                    $speaker = Speaker::create($dataToSave);
                }

                // Update data di pivot table 'event_session_speakers'
                // Penggunaan array kosong [] memastikan relasi dihapus jika user menghapus centang semua sesi
                $speaker->sessions()->sync($speakerData['sessions'] ?? []);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Data pembicara berhasil disimpan',
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
