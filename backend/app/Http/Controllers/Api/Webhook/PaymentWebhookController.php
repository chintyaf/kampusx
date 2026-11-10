<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\Event;
use App\Services\SeatLockService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * Controller untuk mengelola Checkout & Webhook Simulasi Payment Gateway
 * Sesuai Flow 4 Tugas Akhir.
 */
class PaymentWebhookController extends Controller
{
    protected SeatLockService $seatLockService;

    public function __construct(SeatLockService $seatLockService)
    {
        $this->seatLockService = $seatLockService;
    }

    /**
     * POST /api/checkout/create-pending
     * Membuat order pending dan tiket reservasi sebelum pembayaran dilakukan.
     */
    public function createPendingOrder(Request $request)
    {
        $validated = $request->validate([
            'event_id'        => 'required|exists:events,id',
            'ticket_id'       => 'nullable',
            'name'            => 'required|string|max:100',
            'email'           => 'required|email',
            'phone'           => 'required|string',
            'amount'          => 'required|numeric|min:0',
            'payment_method'  => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'bonus_points'    => 'nullable|integer|min:0',
        ]);

        $user = $request->user();
        if (!$user) {
            // Fallback user if token is missing in local test
            $user = \App\Models\User::first();
        }

        $event = Event::findOrFail($validated['event_id']);
        $generatedOrderId = 'ORD-' . strtoupper(Str::random(6)) . '-' . time();
        $amount = (float) $validated['amount'];

        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_id'    => $generatedOrderId,
                'user_id'     => $user->id,
                'event_id'    => $event->id,
                'amount'      => $amount,
                'total_price' => $amount,
                'status'      => 'pending',
                'paid_at'     => null,
            ]);

            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'quantity' => 1,
                'price'    => $amount,
            ]);

            $ticketCode = 'TK-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);
            $ticket = Ticket::create([
                'participant_id' => $user->id,
                'order_item_id'  => $orderItem->id,
                'attendee_name'  => $validated['name'],
                'attendee_email' => $validated['email'],
                'ticket_code'    => $ticketCode,
                'qr_token'       => (string) Str::uuid(),
                'status'         => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'success'     => true,
                'message'     => 'Order pending berhasil dibuat.',
                'order_id'    => $order->order_id,
                'ticket_code' => $ticket->ticket_code,
                'amount'      => $amount,
                'status'      => 'pending',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/webhook/payment-success
     * Simulasi Webhook Payment Gateway (Midtrans/Xendit/QRIS callback).
     * Mengubah tiket jadi Confirmed, membebaskan Redis lock, dan memberikan gamification points.
     */
    public function paymentSuccess(Request $request)
    {
        $validated = $request->validate([
            'order_id'       => 'required|string|exists:orders,order_id',
            'payment_method' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            /** @var Order $order */
            $order = Order::where('order_id', $validated['order_id'])->lockForUpdate()->firstOrFail();
            $user = $order->user;
            $event = $order->event;

            // 1. Perbarui status Order menjadi Lunas
            $order->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            // 2. Perbarui status Tiket menjadi Confirmed (Active)
            $confirmedTickets = [];
            foreach ($order->orderItems as $item) {
                $item->tickets()->update(['status' => 'active']);
                $tickets = $item->tickets()->get();
                foreach ($tickets as $t) {
                    $confirmedTickets[] = [
                        'ticket_code'   => $t->ticket_code,
                        'attendee_name' => $t->attendee_name,
                        'status'        => 'Confirmed (Active)',
                        'qr_token'      => $t->qr_token,
                    ];
                }
            }

            // 3. Bebaskan Redis Seat-Lock secara atomik
            $ticketId = 1;
            if ($user && $event) {
                $this->seatLockService->releaseSeatLock($event->id, $ticketId, $user->id);
            }

            // 4. Berikan Gamification Points & Recalculate Tier
            $pointsAwarded = 150; // Baseline points untuk pendaftaran event
            $pointsResult = null;
            if ($user) {
                $pointsResult = $user->addPoints(
                    $pointsAwarded,
                    "Poin Partisipasi Event: " . ($event ? $event->title : 'Event KampusX'),
                    null,
                    $event ? $event->id : null
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'status'  => 'confirmed',
                'message' => 'Simulasi Pembayaran Berhasil! Tiket aktif (Confirmed), Redis lock dibebaskan, dan Poin Gamifikasi berhasil ditambahkan.',
                'data'    => [
                    'order_id'        => $order->order_id,
                    'status'          => 'Confirmed',
                    'paid_at'         => $order->paid_at->toIso8601String(),
                    'tickets'         => $confirmedTickets,
                    'primary_ticket'  => $confirmedTickets[0] ?? null,
                    'event_title'     => $event ? $event->title : 'Event KampusX',
                    'points_awarded'  => $pointsAwarded,
                    'user_points'     => $user ? $user->points : null,
                    'user_tier'       => $user ? $user->tier : null,
                    'tier_upgraded'   => $pointsResult['tier_upgraded'] ?? false,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => 'Gagal memproses webhook pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }
}
