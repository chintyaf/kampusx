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

        if (in_array($event->status, ['cancelled', 'completed'])) {
            $tickets = EventTicket::where('event_id', $eventId)->get();
            $data = $tickets->map(function ($ticket) use ($eventId) {
                $sold = DB::table('tickets')
                    ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.event_id', $eventId)
                    ->where('order_items.price', $ticket->price)
                    ->count();

                return [
                    'id' => $ticket->id,
                    'name' => $ticket->name,
                    'isFree' => $ticket->is_free,
                    'price' => $ticket->price,
                    'capacity' => $ticket->capacity,
                    'unlimited' => is_null($ticket->capacity),
                    'sale_start' => $ticket->sale_start,
                    'sale_end' => $ticket->sale_end,
                    'description' => $ticket->description,
                    'type' => $ticket->type,
                    'sold' => $sold,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'event_start_date' => $event->start_date
            ]);
        }

        // Ambil tipe lokasi (default ke offline jika null)
        // Note: Saya sesuaikan pemanggilan relasinya ke 'locationDetail' sesuai dengan query 'with' di atas
        $locationType = $event->locationDetail->type ?? 'offline';

        // 3. Tentukan tipe tiket yang DIBUTUHKAN berdasarkan tipe lokasi event
        $requiredTypes = [];
        if ($locationType === 'online') {
            $requiredTypes = ['online'];
        } elseif ($locationType === 'offline') {
            $requiredTypes = ['offline'];
        } elseif ($locationType === 'hybrid') {
            $requiredTypes = ['online', 'offline'];
        }

        // Hapus tiket yang tipenya tidak sesuai dengan tipe lokasi saat ini
        EventTicket::where('event_id', $eventId)->whereNotIn('type', $requiredTypes)->delete();

        // 2. Ambil tiket yang sudah ada untuk event ini
        $tickets = EventTicket::where('event_id', $eventId)->get();

        // 4. Ambil array tipe tiket yang SUDAH ADA di database
        // Asumsi: Model EventTicket punya kolom 'type' untuk membedakan online/offline
        $existingTypes = $tickets->pluck('type')->toArray();

        // 5. Cari tipe tiket yang DIBUTUHKAN tapi BELUM ADA (Missing types)
        $missingTypes = array_diff($requiredTypes, $existingTypes);

        // Jika ada tipe tiket yang belum dibuat, maka insert
        if (!empty($missingTypes)) {
            $ticketsToInsert = [];

            foreach ($missingTypes as $type) {
                if ($type === 'online') {
                    $ticketsToInsert[] = $this->generateDefaultTicket($eventId, 'Online Ticket', 'online');
                } elseif ($type === 'offline') {
                    $ticketsToInsert[] = $this->generateDefaultTicket($eventId, 'Offline Ticket', 'offline');
                }
            }

            // Insert data ke database
            if (!empty($ticketsToInsert)) {
                EventTicket::insert($ticketsToInsert);

                // Ambil ulang data tiket yang baru saja ditambahkan agar up-to-date
                $tickets = EventTicket::where('event_id', $eventId)->get();
            }
        }

        // 6. Mapping data untuk response
        $data = $tickets->map(function ($ticket) use ($eventId) {
            $sold = DB::table('tickets')
                ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.event_id', $eventId)
                ->where('order_items.price', $ticket->price)
                ->count();

            return [
                'id' => $ticket->id,
                'name' => $ticket->name,
                'isFree' => $ticket->is_free,
                'price' => $ticket->price,
                'capacity' => $ticket->capacity,
                'unlimited' => is_null($ticket->capacity),
                'sale_start' => $ticket->sale_start,
                'sale_end' => $ticket->sale_end,
                'description' => $ticket->description,
                'type' => $ticket->type,
                'sold' => $sold,
            ];
        });

        // 7. Return data JSON
        return response()->json([
            'status' => 'success',
            'data' => $data,
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
            $ticketsToDelete = EventTicket::where('event_id', $eventId)
                       ->whereNotIn('id', $ticketIdsToKeep)
                       ->get();

            foreach ($ticketsToDelete as $ticket) {
                // Hitung tiket terjual
                $sold = DB::table('tickets')
                    ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.event_id', $eventId)
                    ->where('order_items.price', $ticket->price)
                    ->count();

                if ($sold > 0) {
                    throw new \Exception("Tiket '{$ticket->name}' tidak dapat dihapus karena sudah memiliki transaksi/peserta terdaftar.");
                }

                $ticket->delete();
            }

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
