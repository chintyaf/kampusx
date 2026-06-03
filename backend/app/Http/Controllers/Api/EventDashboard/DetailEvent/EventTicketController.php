<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventTicketController extends Controller
{
    public function index(int $eventId)
    {
        // 1. Ambil data event beserta relasi lokasinya
        $event = Event::with('locationDetail')->findOrFail($eventId);
        $locationType = $event->locationDetail->type ?? 'offline';

        // 2. Tentukan tipe tiket wajib (Lebih bersih menggunakan match daripada if-else)
        $requiredTypes = match($locationType) {
            'online' => ['online'],
            'hybrid' => ['online', 'offline'],
            default  => ['offline'],
        };

        // 3. Hapus tiket yang tipenya sudah tidak relevan dengan lokasi event saat ini
        // Skenario: Online -> Offline (Menghapus Online), Hybrid -> Offline (Menghapus Online)
        EventTicket::where('event_id', $eventId)
            ->whereNotIn('type', $requiredTypes)
            ->delete();

        // 4. Ambil tiket yang bertahan setelah pembersihan
        $tickets = EventTicket::where('event_id', $eventId)->get();

        // Gunakan unique() agar jika organizer membuat 3 tiket online, tetap terhitung sebagai ['online']
        $existingTypes = $tickets->pluck('type')->unique()->toArray();

        // 5. Cari tipe tiket yang wajib ada tapi belum terbuat
        $missingTypes = array_diff($requiredTypes, $existingTypes);

        // 6. Buat tiket jika ada yang hilang
        if (!empty($missingTypes)) {
            foreach ($missingTypes as $type) {
                $ticketData = $this->generateDefaultTicket($eventId, ucfirst($type) . ' Ticket', $type);

                // Gunakan create() alih-alih insert() agar 'created_at', 'updated_at',
                // dan Eloquent Events (seperti UUID generation) tetap tereksekusi.
                EventTicket::create($ticketData);
            }

            // Ambil ulang data agar sinkron dengan database terbaru
            $tickets = EventTicket::where('event_id', $eventId)->get();
        }

        // 7. Mapping data untuk response
        $data = $tickets->map(function ($ticket) {
            return [
                'id'          => $ticket->id,
                'name'        => $ticket->name,
                'isFree'      => $ticket->is_free,
                'price'       => $ticket->price,
                'capacity'    => $ticket->capacity,
                'unlimited'   => is_null($ticket->capacity),
                'sale_start'  => $ticket->sale_start,
                'sale_end'    => $ticket->sale_end,
                'description' => $ticket->description,
                'type'        => $ticket->type,
            ];
        });

        // 8. Return data JSON
        return response()->json([
            'status'           => 'success',
            'data'             => $data,
            'event_start_date' => $event->start_date
        ]);
    }

    /**
     * Memperbarui atau menambahkan tiket baru untuk event tertentu secara massal.
     */
    public function update(Request $request, int $eventId)
    {
        // Validasi struktur data array tiket
        $request->validate([
            'tickets'                => 'required|array',
            'tickets.*.id'           => 'nullable|exists:event_tickets,id',
            'tickets.*.name'         => 'required|string|max:255',
            'tickets.*.type'         => 'required|string|max:255', // e.g., 'online', 'offline'
            'tickets.*.is_free'      => 'required|boolean',
            'tickets.*.price'        => 'required_if:tickets.*.is_free,false|nullable|numeric|min:0',
            'tickets.*.capacity'     => 'nullable|integer|min:1', // Null berarti unlimited
            'tickets.*.sale_start'   => 'required|date',
            'tickets.*.sale_end'     => 'required|date|after_or_equal:tickets.*.sale_start',
            'tickets.*.description'  => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $ticketIdsToKeep = [];
            foreach ($request->tickets as $ticketData) {

                // Sanitasi data: Jika is_free true, pastikan harga dipaksa menjadi 0
                $isFree = filter_var($ticketData['is_free'], FILTER_VALIDATE_BOOLEAN);
                $price = $isFree ? 0 : ($ticketData['price'] ?? 0);

                // Siapkan data yang akan disimpan
                $dataToSave = [
                    'event_id'   => $eventId,
                    'name'       => $ticketData['name'],
                    'type'       => $ticketData['type'],
                    'description'=> $ticketData['description'] ?? null,
                    'is_free'    => $isFree,
                    'price'      => $price,
                    'capacity'   => $ticketData['capacity'] ?? null,
                    'sale_start' => $ticketData['sale_start'] ?? null,
                    'sale_end'   => $ticketData['sale_end'] ?? null,
                ];

                // Proses Simpan / Update yang lebih aman
                if (!empty($ticketData['id'])) {
                    // Update tiket yang sudah ada
                    $ticket = EventTicket::where('id', $ticketData['id'])
                                         ->where('event_id', $eventId) // Keamanan: Pastikan tiket milik event ini
                                         ->firstOrFail();
                    $ticket->update($dataToSave);
                    $ticketIdsToKeep[] = $ticket->id;
                } else {
                    // Buat tiket baru jika tidak ada ID
                    $newTicket = EventTicket::create($dataToSave);
                    $ticketIdsToKeep[] = $newTicket->id;
                }
            }

            // Hapus tiket yang tidak dikirim dari FE (termasuk tipe tiket yang tidak lagi valid)
            $ticketIdsFromRequest = collect($request->tickets)->pluck('id')->filter()->toArray();
            EventTicket::where('event_id', $eventId)
                       ->whereNotIn('id', $ticketIdsFromRequest)
                       ->delete();

            DB::commit();

            $event = \App\Models\Event::find($eventId);
            $notified = $event ? $event->notifyParticipantsOfUpdate() : false;

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Data tiket berhasil disimpan',
                'notified_participants' => $notified,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal menyimpan data tiket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper function untuk menyiapkan array data tiket default.
     */
    private function generateDefaultTicket(int $eventId, string $name, string $type): array
    {
        return [
            'event_id'   => $eventId,
            'name'       => $name,
            'description'=> null,
            'type'       => $type,
            'is_free'    => false, // Default tidak gratis, harga 0 (sesuai seed React Anda)
            'price'      => 0,
            'capacity'   => null,  // Sesuai migration: null berarti unlimited
            'sale_start' => null,
            'sale_end'   => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
