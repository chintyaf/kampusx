<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\PaymentTransaction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PaymentSimulatorApiController extends Controller
{
    /**
     * POST /api/v1/payment/charge
     * Charge API for simulator. Creates pending order & tickets.
     */
    public function charge(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string|unique:orders,order_id',
            'amount'   => 'required|numeric|min:0',
            'event_id' => 'required|exists:events,id',
            'name'     => 'required|string|max:100',
            'email'    => 'required|email',
            'phone'    => 'required|string',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            $amount = (float) $request->amount;

            if ($amount > 0) {
                // a. JIKA HARGA > 0 (Event Berbayar): Status pending, kembalikan payment_url sandbox
                $order = Order::create([
                    'order_id'    => $request->order_id,
                    'amount'      => $amount,
                    'status'      => 'pending',
                    'user_id'     => $user->id,
                    'event_id'    => $request->event_id,
                    'total_price' => $amount, // Legacy compatibility
                    'paid_at'     => null,     // Legacy compatibility
                ]);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => 1,
                    'price'    => $amount,
                ]);

                $ticket = Ticket::create([
                    'participant_id' => $user->id,
                    'order_item_id'  => $orderItem->id,
                    'attendee_name'  => $request->name,
                    'attendee_email' => $request->email,
                    'ticket_code'    => strtoupper(Str::random(8)),
                    'qr_token'       => (string) Str::uuid(),
                    'status'         => 'pending',
                ]);

                $event = \App\Models\Event::find($request->event_id);
                $token = 'TKN-' . strtoupper(Str::random(16));
                $expiredAt = now()->addMinutes(15);
                
                // Build payment URL using environment or request host
                $baseUrl = config('app.payment_base_url') ?: url('/');
                $baseUrl = rtrim($baseUrl, '/');
                $paymentUrl = $baseUrl . '/payment/' . $token;

                PaymentTransaction::create([
                    'token'          => $token,
                    'order_id'       => $request->order_id,
                    'amount'         => $amount,
                    'customer_name'  => $request->name,
                    'customer_email' => $request->email,
                    'item_name'      => $event ? $event->title : 'Tiket Event',
                    'status'         => 'pending',
                    'callback_url'   => url('/api/v1/payment/callback'),
                    'redirect_url'   => config('app.frontend_url') . '/ticket/' . $ticket->ticket_code,
                    'expired_at'     => $expiredAt,
                ]);

                DB::commit();

                return response()->json([
                    'status'      => 'success',
                    'is_paid'     => true,
                    'payment_url' => $paymentUrl,
                ], 201);
            } else {
                // b. JIKA HARGA == 0 (Event Gratis): Status paid, langsung aktifkan tiket, kembalikan redirect_url detail tiket
                $order = Order::create([
                    'order_id'    => $request->order_id,
                    'amount'      => 0,
                    'status'      => 'paid',
                    'user_id'     => $user->id,
                    'event_id'    => $request->event_id,
                    'total_price' => 0, // Legacy compatibility
                    'paid_at'     => now(), // Legacy compatibility
                ]);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => 1,
                    'price'    => 0,
                ]);

                $ticket = Ticket::create([
                    'participant_id' => $user->id,
                    'order_item_id'  => $orderItem->id,
                    'attendee_name'  => $request->name,
                    'attendee_email' => $request->email,
                    'ticket_code'    => strtoupper(Str::random(8)),
                    'qr_token'       => (string) Str::uuid(),
                    'status'         => 'active', // Langsung aktif
                ]);

                DB::commit();

                $frontendUrl = config('app.frontend_url');
                $redirectUrl = $frontendUrl . '/ticket/' . $ticket->ticket_code;

                return response()->json([
                    'status'       => 'success',
                    'is_paid'      => false,
                    'redirect_url' => $redirectUrl,
                ], 201);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat memproses pembayaran simulator.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/payment/callback
     * Webhook/callback from the sandbox simulation to confirm payment.
     */
    public function callback(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string|exists:orders,order_id',
        ]);

        $status = $request->input('status', 'success'); // Default to success for backward compatibility

        DB::beginTransaction();
        try {
            $order = Order::where('order_id', $request->order_id)->firstOrFail();

            if ($status === 'success') {
                // Update order status
                $order->update([
                    'status'  => 'paid',
                    'paid_at' => now(), // Legacy compatibility
                ]);

                // Activate associated tickets
                foreach ($order->orderItems as $item) {
                    $item->tickets()->update(['status' => 'active']);
                }

                // Notify User
                if ($order->user) {
                    $order->user->notify(new \App\Notifications\OperationalNotification(
                        "Pembayaran Sukses!",
                        "Pembayaran Anda untuk event '{$order->event->title}' telah berhasil diverifikasi. Tiket Anda kini aktif.",
                        "payment_success",
                        ['event_id' => $order->event_id]
                    ));
                }

                $message = 'Pembayaran lunas berhasil disimulasikan.';
            } else {
                $mappedStatus = ($status === 'expired') ? 'expired' : 'cancelled';

                // Mark order as cancelled/expired
                $order->update([
                    'status'  => $mappedStatus,
                    'paid_at' => null,
                ]);

                // Mark associated tickets as cancelled
                foreach ($order->orderItems as $item) {
                    $item->tickets()->update(['status' => 'cancelled']);
                }

                // Notify User
                if ($order->user) {
                    $order->user->notify(new \App\Notifications\OperationalNotification(
                        "Pembayaran Gagal/Batal",
                        "Pembayaran tiket event '{$order->event->title}' telah dibatalkan atau kedaluwarsa.",
                        "payment_failed",
                        ['event_id' => $order->event_id]
                    ));
                }

                $message = 'Transaksi dibatalkan atau kedaluwarsa berhasil diproses.';
            }

            // Find ticket code for redirect helper
            $ticket = Ticket::whereHas('orderItem', function ($query) use ($order) {
                $query->where('order_id', $order->id);
            })->first();

            DB::commit();

            return response()->json([
                'status'      => 'success',
                'message'     => $message,
                'ticket_code' => $ticket ? $ticket->ticket_code : null,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memproses callback pembayaran simulator.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
