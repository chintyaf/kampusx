<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Speaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EventSpeakerController extends Controller
{
    /**
     * Mengambil daftar pembicara berdasarkan Event ID
     */
    public function index($eventId)
    {
        try {
            // Mengambil semua speaker yang terdaftar di event ini berdasarkan event_id
            $speakers = Speaker::where('event_id', $eventId)
            ->with('sessions') // Eager load relasi sessions agar data name dari session ikut terbawa
            ->orderBy('id', 'desc')
            ->get();

            // Tambahkan URL gambar ke setiap speaker
            $speakers->each(function ($speaker) {
                $speaker->image_url = $speaker->image_path
                    ? Storage::url($speaker->image_path)
                    : null;
            });

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
            'speakers'                           => 'nullable|array',
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

            $savedSpeakers = [];
            if ($request->has('speakers') && is_array($request->speakers)) {
                foreach ($request->speakers as $index => $speakerData) {

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

                    // Handle upload gambar speaker (file dikirim sebagai speakers_image_{index})
                    $imageKey = "speakers_image_{$index}";
                    if ($request->hasFile($imageKey)) {
                        // Hapus gambar lama jika ada
                        if ($speaker->image_path && Storage::exists($speaker->image_path)) {
                            Storage::delete($speaker->image_path);
                        }

                        $file = $request->file($imageKey);
                        $path = $file->store("speakers/{$eventId}", 'public');
                        $speaker->update(['image_path' => $path]);
                    }

                    // Update data di pivot table 'event_session_speakers'
                    // Penggunaan array kosong [] memastikan relasi dihapus jika user menghapus centang semua sesi
                    if (array_key_exists('sessions', $speakerData)) {
                        $speaker->sessions()->sync($speakerData['sessions'] ?? []);
                    }

                    $speaker->load('sessions');
                    $speaker->image_url = $speaker->image_path
                        ? Storage::url($speaker->image_path)
                        : null;
                    $savedSpeakers[] = $speaker;
                }
            }

            DB::commit();

            $event = \App\Models\Event::find($eventId);
            $notified = $event ? $event->notifyParticipantsOfUpdate() : false;

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Data pembicara berhasil disimpan',
                'notified_participants' => $notified,
                'data'    => $savedSpeakers,
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

    /**
     * Menghapus pembicara berdasarkan ID
     */
    public function destroy($eventId, $speakerId)
    {
        try {
            DB::beginTransaction();

            $speaker = Speaker::where('id', $speakerId)
                              ->where('event_id', $eventId)
                              ->firstOrFail();

            // Hapus gambar dari storage jika ada
            if ($speaker->image_path && Storage::exists($speaker->image_path)) {
                Storage::delete($speaker->image_path);
            }

            // Hapus relasi pivot di event_session_speakers
            $speaker->sessions()->detach();

            // Hapus speaker
            $speaker->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Pembicara berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal menghapus pembicara: ' . $e->getMessage()
            ], 500);
        }
    }
}
