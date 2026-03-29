<?php

namespace App\Http\Controllers\Api\EventDas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Speaker;
use Illuminate\Support\Facades\DB;

class EventSpeakerController extends Controller
{
    /**
     * Mengambil daftar pembicara berdasarkan Event ID
     */
    public function getSpeakers($eventId)
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
    public function setSpeakers(Request $request, $eventId) // <-- Tambahkan parameter $eventId di sini
    {
        // Validasi struktur data yang dikirim dari React
        $request->validate([
            'speakers'              => 'required|array',
            'speakers.*.name'       => 'required|string|max:255',
            'speakers.*.role'       => 'nullable|string|max:255',

            'speakers.*.social_links'   => 'nullable|array',
            'speakers.*.social_links.*' => 'url', // Opsional: memastikan isinya format URL yang valid

            'speakers.*.expertise'  => 'nullable|array',
            // Pastikan sesi ada karena relasi DB membutuhkan event_session_id
            'speakers.*.sessions'   => 'required|array|min:1',
            'speakers.*.sessions.*' => 'exists:event_sessions,id',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->speakers as $speakerData) {
                // Ambil ID sesi pertama sebagai foreign_key utama (wajib ada di tabel speakers)
                $primarySessionId = $speakerData['sessions'][0];

                // Proses Simpan / Update
                $speaker = Speaker::updateOrCreate(
                    ['id' => $speakerData['id'] ?? null],
                    [
                        'event_session_id' => $primarySessionId,
                        'name'             => $speakerData['name'],
                        'role'             => $speakerData['role'] ?? null,
                        'social_links'     => $speakerData['social_links'] ?? null,
                        // Jika model Speaker sudah ada "protected $casts = ['expertise' => 'array'];"
                        // kita bisa langsung memasukkan array-nya, Laravel yang otomatis mengubah jadi JSON
                        'expertise'        => $speakerData['expertise'] ?? null,
                    ]
                );

                // Update data di pivot table 'event_session_speakers'
                if (isset($speakerData['sessions'])) {
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
