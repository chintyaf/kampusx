<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controller untuk menangani Webhook Provider Resmi dan Status Pembayaran Peserta.
 */
class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    /**
     * POST /api/payment/callback/duitku
     * Webhook server-to-server resmi dari Duitku POP API.
     * Publik, namun diverifikasi secara ketat via MD5 Signature & nominal order.
     */
    public function duitkuCallback(Request $request)
    {
        Log::info("[PaymentController] Menerima callback Duitku", [
            'merchant_order_id' => $request->input('merchantOrderId'),
            'result_code'       => $request->input('resultCode'),
            'amount'            => $request->input('amount'),
        ]);

        $result = $this->paymentService->handleCallback($request, 'duitku');

        return response($result['response'], $result['http_code'])
            ->header('Content-Type', 'text/plain');
    }

    /**
     * GET /api/payment/status/{orderId}
     * Cek status pembayaran dan sinkronisasi server-side untuk frontend.
     * Terlindungi Sanctum (hanya pemilik order atau admin yang boleh mengakses).
     */
    public function getStatus(Request $request, string $orderId)
    {
        $user = $request->user();

        /** @var Order $order */
        $order = Order::with(['orderItems.tickets', 'event'])->where('order_id', $orderId)->firstOrFail();

        // Otorisasi: Pastikan hanya pemilik order atau admin yang dapat membaca
        if ($order->user_id !== $user->id && !in_array($user->role, ['admin'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak memiliki hak akses untuk melihat transaksi ini.',
            ], 403);
        }

        // Jika order masih pending, sinkronkan status terkini dengan gateway provider
        if ($order->status === PaymentStatus::PENDING) {
            $syncResult = $this->paymentService->checkAndSyncStatus($order);
            $order->refresh();
        }

        // Ambil data transaksi terakhir
        $latestTransaction = PaymentTransaction::where('order_id', $order->order_id)
            ->latest('id')
            ->first();

        // Kumpulkan tiket jika sudah aktif
        $tickets = [];
        if ($order->status === PaymentStatus::PAID) {
            foreach ($order->orderItems as $item) {
                foreach ($item->tickets as $t) {
                    $tickets[] = [
                        'ticket_code'   => $t->ticket_code,
                        'attendee_name' => $t->attendee_name,
                        'status'        => $t->status,
                        'qr_token'      => $t->qr_token,
                    ];
                }
            }
        }

        return response()->json([
            'status'             => 'success',
            'order_id'           => $order->order_id,
            'payment_status'     => $order->status,
            'amount'             => (float) $order->amount,
            'event_title'        => $order->event?->title,
            'checkout_url'       => $latestTransaction?->checkout_url,
            'expired_at'         => $latestTransaction?->expired_at ? \Carbon\Carbon::parse($latestTransaction->expired_at)->toIso8601String() : null,
            'paid_at'            => $order->paid_at ? \Carbon\Carbon::parse($order->paid_at)->toIso8601String() : null,
            'tickets'            => $tickets,
            'primary_ticket_code'=> $tickets[0]['ticket_code'] ?? null,
        ]);
    }
}
