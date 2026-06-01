<?php

namespace App\Http\Controllers\Api\EventDashboard\DetailEvent;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventTicketController extends Controller
{
    /**
     * Menampilkan tiket event, jika belum ada buat otomatis 1 tiket kosong.
     */
    public function index(int $eventId)
    {
        // 1. Ambil data event beserta relasi lokasinya
        $event = Event::with('locationDetail')->findOrFail($eventId);
        $locationType = $event->locationDetail->type ?? 'offline';

        // 2. Ambil tiket yang sudah ada untuk event ini
        $tickets = EventTicket::where('event_id', $eventId)->get();

        // 3. Jika belum ada tiket sama sekali, buatkan 1 tiket default yang kosong
        if ($tickets->isEmpty()) {
            // Penentuan tipe default awal (jika online -> online, sisanya offline)
            // User nanti bisa mengubahnya di frontend jika event hybrid
            $defaultType = ($locationType === 'online') ? 'online' : 'offline';

            $newTicket = EventTicket::create([
                'event_id'    => $eventId,
                'name'        => '', // Dikosongkan agar user yang mengisi
                'type'        => $defaultType,
                'description' => null,
                'is_free'     => false,
                'price'       => 0,
                'capacity'    => 0, // Null = unlimited
                'sale_start'  => null,
                'sale_end'    => null,
            ]);

            // Masukkan tiket baru ke dalam collection agar langsung ter-map
            $tickets->push($newTicket);
        }

        // 4. Mapping data untuk response
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

        // 5. Return data JSON
        return response()->json([
            'status'           => 'success',
            'data'             => $data,
            'event_start_date' => $event->start_date,
            'event_end_date'   => $event->end_date,
            'location_type'    => $locationType,
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

            // Hapus tiket yang tidak dikirim dari FE
            EventTicket::where('event_id', $eventId)
                       ->whereNotIn('id', $ticketIdsToKeep)
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
}
