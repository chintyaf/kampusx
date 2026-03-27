<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi Input dari React
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'quantity' => 'required|integer|min:1',
            'name'     => 'required|string|max:100',
            'email'    => 'required|email',
            'phone'    => 'required|string',
        ]);

        $user = $request->user(); // Ambil data user yang sedang login
        $event = Event::findOrFail($request->event_id);

        // Catatan: Di ERD-mu tidak ada kolom 'price' di tabel events, 
        // jadi sementara kita asumsikan harga diambil dari request atau hardcode.
        // Kalau nanti kamu tambah kolom price di tabel events, ganti jadi: $price = $event->price;
        $price = 250000; 
        $total_price = $price * $request->quantity;

        // 2. Mulai Database Transaction
        DB::beginTransaction();

        try {
            // 3. Insert ke tabel `orders`
            $order = Order::create([
                'event_id'    => $event->id,
                'user_id'     => $user->id,
                'total_price' => $total_price,
                'paid_at'     => now(), // Langsung kita anggap lunas (skip payment gateway)
            ]);

            // 4. Insert ke tabel `order_items`
            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'quantity' => $request->quantity,
                'price'    => $price,
            ]);

            // 5. Insert ke tabel `tickets` (Di-looping kalau belinya lebih dari 1)
            $tickets = [];
            for ($i = 0; $i < $request->quantity; $i++) {
                $ticket = Ticket::create([
                    'participant_id' => $user->id,
                    'order_item_id'  => $orderItem->id,
                    'attendee_name'  => $request->name,
                    'attendee_email' => $request->email,
                    'ticket_code'    => strtoupper(Str::random(8)), // Hasil: ex. A8F9B2C1
                    'qr_token'       => Str::uuid()->toString(), // Bikin token unik untuk QR Code
                    'status'         => 'active',
                ]);
                $tickets[] = $ticket;
            }

            // 6. Kalau semua berhasil, Commit (simpan permanen ke database)
            DB::commit();

            // 7. Kembalikan response ke React
            return response()->json([
                'message' => 'Checkout berhasil!',
                'order'   => $order,
                'ticket'  => $tickets[0], // Kirim data tiket pertama untuk ditampilkan di UI
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan sistem saat memproses checkout.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}