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
use Midtrans\Config; // Import Midtrans Config
use Midtrans\Snap;   // Import Midtrans Snap

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

        $user = $request->user();
        $event = Event::findOrFail($request->event_id);

        $price = $event->price ?? 0; // Pastikan event punya kolom price, atau default 0
        $adminFee = ($price > 0) ? 1 : 0; // Kalau gratis, admin fee juga 0 dong
        $total_price = ($price * $request->quantity) + $adminFee;

        // Setup Konfigurasi Midtrans
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        DB::beginTransaction();

        try {
            // === JALUR 1: TIKET GRATIS ===
            if ($total_price == 0) {
                $order = Order::create([
                    'event_id'    => $event->id,
                    'user_id'     => $user->id,
                    'total_price' => 0,
                    'paid_at'     => now(), // Langsung lunas
                ]);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => $request->quantity,
                    'price'    => 0,
                ]);

                $tickets = [];
                for ($i = 0; $i < $request->quantity; $i++) {
                    $tickets[] = Ticket::create([
                        'participant_id' => $user->id,
                        'order_item_id'  => $orderItem->id,
                        'attendee_name'  => $request->name,
                        'attendee_email' => $request->email,
                        'ticket_code'    => strtoupper(Str::random(8)),
                        'qr_token'       => Str::uuid()->toString(),
                        'status'         => 'active', // Tiket langsung aktif
                    ]);
                }

                DB::commit();

                // Kembalikan ke React TANPA snap_token
                return response()->json([
                    'status'     => 'success',
                    'message'    => 'Tiket gratis berhasil diklaim!',
                    'order_id'   => $order->id,
                    'ticket_code' => $tickets[0]->ticket_code,
                    'snap_token' => null, // Tandai kalau ini tidak butuh Midtrans
                ], 201);
            } 
            
            // === JALUR 2: TIKET BERBAYAR (MIDTRANS) ===
            else {
                $order = Order::create([
                    'event_id'    => $event->id,
                    'user_id'     => $user->id,
                    'total_price' => $total_price,
                    'paid_at'     => null, // Belum lunas
                ]);

                $midtransOrderId = 'ORD-' . $order->id . '-' . time();

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => $request->quantity,
                    'price'    => $price,
                ]);

                $tickets = [];
                for ($i = 0; $i < $request->quantity; $i++) {
                    $tickets[] = Ticket::create([
                        'participant_id' => $user->id,
                        'order_item_id'  => $orderItem->id,
                        'attendee_name'  => $request->name,
                        'attendee_email' => $request->email,
                        'ticket_code'    => strtoupper(Str::random(8)),
                        'qr_token'       => Str::uuid()->toString(),
                        'status'         => 'pending', // Tiket pending
                    ]);
                }

                // Kirim ke Midtrans
                $params = [
                    'transaction_details' => [
                        'order_id'     => $midtransOrderId,
                        'gross_amount' => $total_price,
                    ],
                    'customer_details' => [
                        'first_name' => $request->name,
                        'email'      => $request->email,
                        'phone'      => $request->phone,
                    ],
                ];

                $snapToken = Snap::getSnapToken($params);

                DB::commit();

                return response()->json([
                    'status'     => 'success',
                    'message'    => 'Order berhasil dibuat. Menunggu pembayaran.',
                    'order_id'   => $order,
                    'snap_token' => $snapToken,
                ], 201);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan sistem saat memproses checkout.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}