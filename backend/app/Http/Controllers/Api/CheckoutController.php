<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Notifications\OperationalNotification;
use App\Services\Payment\PaymentService;
use App\Services\Payment\Enums\PaymentStatus;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function store(Request $request)
    {
        // 1. Validasi Input dari Frontend
        $validated = $request->validate([
            'event_id'       => 'required|exists:events,id',
            'quantity'       => 'required|integer|min:1|max:10',
            'name'           => 'required|string|max:100',
            'email'          => 'required|email|max:150',
            'phone'          => 'required|string|max:20',
            'payment_method' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $event = Event::findOrFail($validated['event_id']);

        // 2. Hitung harga server-side
        $price = (float) ($event->price ?? 0);
        $adminFee = ($price > 0) ? 1000 : 0;
        $totalPrice = ($price * $validated['quantity']) + $adminFee;

        // 3. Concurrency Lock: Periksa kuota tiket
        DB::beginTransaction();
        try {
            $eventTicket = EventTicket::where('event_id', $event->id)->lockForUpdate()->first();

            if ($eventTicket && $eventTicket->capacity !== null) {
                $holdMinutes = config('payment.hold_minutes', 15);
                $holdCutoff = \Carbon\Carbon::now()->subMinutes($holdMinutes);

                $soldTickets = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.event_id', $event->id)
                    ->where(function ($q) use ($holdCutoff) {
                        $q->where('orders.status', PaymentStatus::PAID)
                          ->orWhere(function ($sub) use ($holdCutoff) {
                              $sub->where('orders.status', PaymentStatus::PENDING)
                                  ->where('orders.created_at', '>=', $holdCutoff);
                          });
                    })
                    ->sum('order_items.quantity');

                $available = $eventTicket->capacity - $soldTickets;
                if ($validated['quantity'] > $available) {
                    DB::rollBack();
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Kuota tiket tidak mencukupi. Sisa tiket: ' . max(0, $available),
                    ], 422);
                }
            }

            $generatedOrderId = 'ORD-' . strtoupper(Str::random(8)) . '-' . time();

            // === JALUR 1: TIKET GRATIS ===
            if ($totalPrice == 0) {
                $order = Order::forceCreate([
                    'order_id'    => $generatedOrderId,
                    'event_id'    => $event->id,
                    'user_id'     => $user->id,
                    'amount'      => 0,
                    'total_price' => 0,
                    'status'      => PaymentStatus::PAID,
                    'paid_at'     => now(),
                ]);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'quantity' => $validated['quantity'],
                    'price'    => 0,
                ]);

                $tickets = [];
                for ($i = 0; $i < $validated['quantity']; $i++) {
                    $tickets[] = Ticket::create([
                        'participant_id' => $user->id,
                        'order_item_id'  => $orderItem->id,
                        'attendee_name'  => $validated['name'],
                        'attendee_email' => $validated['email'],
                        'ticket_code'    => strtoupper(Str::random(8)),
                        'qr_token'       => (string) Str::uuid(),
                        'status'         => 'active',
                    ]);
                }

                $user->notify(new OperationalNotification(
                    "Pendaftaran Berhasil!",
                    "Selamat! Tiket gratis Anda untuk event '{$event->title}' berhasil didaftarkan.",
                    "payment_success",
                    ['event_id' => $event->id]
                ));

                // Sinkronkan kategori event ke personalisasi pengguna
                $categoryIds = $event->categories()->pluck('categories.id')->toArray();
                if (!empty($categoryIds)) {
                    $user->categories()->syncWithoutDetaching($categoryIds);
                }

                DB::commit();

                return response()->json([
                    'status'       => 'success',
                    'message'      => 'Tiket gratis berhasil diklaim!',
                    'order_id'     => $order->order_id,
                    'ticket_code'  => $tickets[0]->ticket_code,
                    'is_free'      => true,
                    'checkout_url' => null,
                ], 201);
            }

            // === JALUR 2: TIKET BERBAYAR ===
            // Buat record order dan tiket berstatus pending di database
            $order = Order::forceCreate([
                'order_id'    => $generatedOrderId,
                'event_id'    => $event->id,
                'user_id'     => $user->id,
                'amount'      => $totalPrice,
                'total_price' => $totalPrice,
                'status'      => PaymentStatus::PENDING,
                'paid_at'     => null,
            ]);

            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'quantity' => $validated['quantity'],
                'price'    => $price,
            ]);

            for ($i = 0; $i < $validated['quantity']; $i++) {
                Ticket::create([
                    'participant_id' => $user->id,
                    'order_item_id'  => $orderItem->id,
                    'attendee_name'  => $validated['name'],
                    'attendee_email' => $validated['email'],
                    'ticket_code'    => strtoupper(Str::random(8)),
                    'qr_token'       => (string) Str::uuid(),
                    'status'         => 'pending',
                ]);
            }

            // Commit pending order terlebih dahulu agar row lock lepas sebelum HTTP call ke gateway
            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan sistem saat memproses checkout.',
                'error'   => $e->getMessage()
            ], 500);
        }

        // 4. Inisiasi pembayaran ke Payment Gateway di luar DB transaction
        $customerData = [
            'name'  => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ];

        $paymentResult = $this->paymentService->initiatePayment(
            order: $order,
            customerData: $customerData,
            paymentMethod: $validated['payment_method'] ?? null
        );

        if (!$paymentResult['success']) {
            return response()->json([
                'status'        => 'error',
                'message'       => $paymentResult['error_message'] ?? 'Gagal menghubungi gateway pembayaran.',
                'order_id'      => $order->order_id,
            ], 502);
        }

        return response()->json([
            'status'       => 'success',
            'message'      => 'Sesi pembayaran berhasil dibuat.',
            'order_id'     => $paymentResult['order_id'],
            'payment_id'   => $paymentResult['payment_id'],
            'status_label' => $paymentResult['status'],
            'checkout_url' => $paymentResult['checkout_url'],
            'amount'       => $paymentResult['amount'],
            'expired_at'   => $paymentResult['expired_at'],
            'is_free'      => false,
        ], 201);
    }

    public function checkRegistration(Request $request, $eventId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'registered' => false,
                'status'     => null
            ]);
        }

        $order = Order::where('user_id', $user->id)
            ->where('event_id', $eventId)
            ->whereIn('status', [PaymentStatus::PAID, PaymentStatus::PENDING])
            ->latest('id')
            ->first();

        if ($order) {
            return response()->json([
                'registered' => true,
                'status'     => $order->status,
                'order_id'   => $order->order_id,
            ]);
        }

        return response()->json([
            'registered' => false,
            'status'     => null
        ]);
    }
}
