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
     * Menampilkan tiket event, jika belum ada buat otomatis berdasarkan tipe lokasi.
     */
    public function index(int $eventId)
    {
        // 1. Ambil data event beserta relasi lokasinya
        // Sesuaikan nama relasi 'location' dengan yang ada di model Event Anda
        $event = Event::with('locationDetail')->findOrFail($eventId);

        // 2. Ambil tiket yang sudah ada untuk event ini
        $tickets = EventTicket::where('event_id', $eventId)->get();

        // 3. Jika tiket belum ada sama sekali, buatkan secara otomatis
        if ($tickets->isEmpty()) {
            // Ambil tipe lokasi (default ke offline jika null)
            $locationType = $event->location->type ?? 'offline';

            $ticketsToInsert = [];

            // Siapkan data array untuk insert berdasarkan tipe lokasi
            if ($locationType === 'online') {
                $ticketsToInsert[] = $this->generateDefaultTicket($eventId, 'Online Ticket', 'online');
            } elseif ($locationType === 'offline') {
                $ticketsToInsert[] = $this->generateDefaultTicket($eventId, 'Offline Ticket', 'offline');
            } elseif ($locationType === 'hybrid') {
                $ticketsToInsert[] = $this->generateDefaultTicket($eventId, 'Online Ticket', 'online');
                $ticketsToInsert[] = $this->generateDefaultTicket($eventId, 'Offline Ticket', 'offline');
            }

            // Insert data ke database jika ada
            if (!empty($ticketsToInsert)) {
                EventTicket::insert($ticketsToInsert);

                // Ambil ulang data tiket yang baru saja dibuat
                $tickets = EventTicket::where('event_id', $eventId)->get();
            }
        }

        $data = $tickets->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'name' => $ticket->name,
                'isFree' => $ticket->is_free,
                'price' => $ticket->price,
                'capacity' => $ticket->capacity,
                'sale_start' => $ticket->sale_start,
                'sale_end' => $ticket->sale_end,
                'description' => $ticket->description,
            ];
        });

        // 4. Return data (biasanya dalam bentuk JSON jika untuk React/API)
        return response()->json([
            'status' => 'success',
            'data' => $data
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
            'tickets.*.price'        => 'nullable|numeric|min:0',
            'tickets.*.capacity'     => 'nullable|integer|min:1', // Null berarti unlimited
            'tickets.*.sale_start'   => 'nullable|date',
            'tickets.*.sale_end'     => 'nullable|date|after_or_equal:tickets.*.sale_start',
            'tickets.*.description'  => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

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
                } else {
                    // Buat tiket baru jika tidak ada ID
                    EventTicket::create($dataToSave);
                }
            }

            // Opsional: Jika Anda perlu menghapus tiket yang tidak dikirim dari FE,
            // Anda bisa menggunakan kode di bawah ini (Hapus komentar jika diperlukan):
            /*
            $ticketIdsFromRequest = collect($request->tickets)->pluck('id')->filter()->toArray();
            EventTicket::where('event_id', $eventId)
                       ->whereNotIn('id', $ticketIdsFromRequest)
                       ->delete();
            */

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'message' => 'Data tiket berhasil disimpan',
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
