<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\PointTransaction;
use App\Notifications\OperationalNotification;
use App\Services\Payment\DTO\PaymentRequestDTO;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\SeatLockService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Core Payment Service
 * Mengorkestrasi pembuatan pembayaran, verifikasi webhook, rekonsiliasi status,
 * serta finalisasi tiket dan poin secara atomik dan idempotent.
 */
class PaymentService
{
    public function __construct(
        protected PaymentGatewayResolver $resolver,
        protected SeatLockService $seatLockService,
    ) {}

    /**
     * Memulai transaksi pembayaran berbayar ke payment gateway provider.
     * Request HTTP ke provider dieksekusi di luar lock database.
     */
    public function initiatePayment(Order $order, array $customerData, ?string $paymentMethod = null): array
    {
        $event = $order->event;
        $holdMinutes = config('payment.hold_minutes', 15);
        $expiredAt = Carbon::now()->addMinutes($holdMinutes);

        // 1. Buat merchant order reference unik untuk payment attempt ini
        $attemptCount = PaymentTransaction::where('order_id', $order->order_id)->count() + 1;
        $merchantOrderId = $attemptCount > 1 
            ? "{$order->order_id}-A{$attemptCount}" 
            : $order->order_id;

        $token = 'TKN-' . strtoupper(Str::random(16));
        $providerName = config('payment.default', 'duitku');
        $environment  = config('payment.mode', 'sandbox');

        // Resolve gateway adapter
        $gateway = $this->resolver->resolve($providerName, $environment);

        // 2. Simpan record payment attempt dengan status pending
        $transaction = PaymentTransaction::create([
            'token'              => $token,
            'order_id'           => $order->order_id,
            'merchant_order_id'  => $merchantOrderId,
            'provider'           => $gateway->getProviderName(),
            'environment'        => $environment,
            'merchant_code'      => method_exists($gateway, 'getMerchantCode') ? $gateway->getMerchantCode() : null,
            'payment_method'     => $paymentMethod,
            'amount'             => $order->amount,
            'customer_name'      => $customerData['name'],
            'customer_email'     => $customerData['email'],
            'item_name'          => $event ? $event->title : 'Tiket Event KampusX',
            'status'             => PaymentStatus::PENDING,
            'callback_url'       => config('payment.providers.duitku.callback_url'),
            'redirect_url'       => config('payment.providers.duitku.return_url'),
            'expired_at'         => $expiredAt,
        ]);

        // 3. Panggil API Provider (Di Luar Database Transaction agar tidak menahan row lock)
        $requestDTO = new PaymentRequestDTO(
            merchantOrderId: $merchantOrderId,
            amount: (int) round((float) $order->amount),
            itemName: $event ? Str::limit($event->title, 50) : 'Tiket Event',
            customerName: $customerData['name'],
            customerEmail: $customerData['email'],
            customerPhone: $customerData['phone'] ?? '08123456789',
            paymentMethod: $paymentMethod,
            expiryMinutes: $holdMinutes,
        );

        $responseDTO = $gateway->createPayment($requestDTO);

        // 4. Update transaksi dengan hasil response provider
        if ($responseDTO->isSuccess && $responseDTO->checkoutUrl) {
            $transaction->update([
                'provider_reference' => $responseDTO->providerReference,
                'checkout_url'       => $responseDTO->checkoutUrl,
                'raw_response'       => $responseDTO->rawResponse,
            ]);

            Log::info("[PaymentService] Payment invoice berhasil dibuat", [
                'order_id'           => $order->order_id,
                'merchant_order_id'  => $merchantOrderId,
                'provider_reference' => $responseDTO->providerReference,
            ]);

            return [
                'success'      => true,
                'order_id'     => $order->order_id,
                'payment_id'   => $transaction->id,
                'status'       => PaymentStatus::PENDING,
                'checkout_url' => $responseDTO->checkoutUrl,
                'amount'       => (float) $order->amount,
                'expired_at'   => $expiredAt->toIso8601String(),
            ];
        }

        // Jika gateway gagal membuat invoice
        $transaction->update([
            'status'       => PaymentStatus::FAILED,
            'raw_response' => $responseDTO->rawResponse,
        ]);

        Log::error("[PaymentService] Gagal membuat invoice ke payment gateway", [
            'order_id'          => $order->order_id,
            'merchant_order_id' => $merchantOrderId,
            'error_message'     => $responseDTO->errorMessage,
        ]);

        return [
            'success'       => false,
            'order_id'      => $order->order_id,
            'status'        => PaymentStatus::FAILED,
            'error_message' => $responseDTO->errorMessage ?: 'Gagal terhubung ke gateway pembayaran.',
        ];
    }

    /**
     * Memproses callback / webhook dari provider pembayaran.
     * Menggunakan verifikasi signature, validasi nominal, serta finalisasi idempotency.
     */
    public function handleCallback(Request $request, ?string $providerName = null): array
    {
        $providerName = $providerName ?: config('payment.default', 'duitku');
        $merchantOrderId = (string) $request->input('merchantOrderId', '');

        // 1. Cari record PaymentTransaction terkait
        $transaction = PaymentTransaction::where('merchant_order_id', $merchantOrderId)
            ->orWhere('order_id', $merchantOrderId)
            ->first();

        if (!$transaction) {
            Log::warning("[PaymentService] Callback ditolak: transaksi tidak ditemukan.", [
                'merchant_order_id' => $merchantOrderId,
            ]);

            return [
                'http_code' => 404,
                'response'  => 'TRANSACTION_NOT_FOUND',
            ];
        }

        // 2. Resolve gateway adapter khusus transaksi ini
        $gateway = $this->resolver->resolveForTransaction($transaction);

        // 3. Verifikasi signature callback
        if (!$gateway->verifyCallback($request, $transaction)) {
            Log::error("[PaymentService] Callback ditolak: Signature tidak valid.", [
                'merchant_order_id' => $merchantOrderId,
            ]);

            return [
                'http_code' => 400,
                'response'  => 'BAD_SIGNATURE',
            ];
        }

        // 4. Parse callback data
        $callbackResult = $gateway->parseCallback($request);

        // 5. Validasi kesesuaian nominal (cegah fraud nominal beda)
        $expectedAmount = (int) round((float) $transaction->amount);
        if ($callbackResult->amount !== null && $callbackResult->amount !== $expectedAmount) {
            Log::error("[PaymentService] Callback ditolak: Nominal tidak cocok.", [
                'merchant_order_id' => $merchantOrderId,
                'received_amount'   => $callbackResult->amount,
                'expected_amount'   => $expectedAmount,
            ]);

            return [
                'http_code' => 400,
                'response'  => 'AMOUNT_MISMATCH',
            ];
        }

        // 6. Jalankan Finalisasi Atomik & Idempotent
        $finalStatus = $callbackResult->internalStatus;
        $this->finalizePayment(
            transaction: $transaction,
            newStatus: $finalStatus,
            providerReference: $callbackResult->providerReference,
            rawPayload: $callbackResult->rawPayload
        );

        return [
            'http_code' => 200,
            'response'  => 'SUCCESS',
        ];
    }

    /**
     * Memeriksa dan merekonsiliasi status pembayaran terkini dari gateway server-to-server.
     */
    public function checkAndSyncStatus(Order $order): array
    {
        // Jika order sudah paid, tidak perlu rekonsiliasi ulang
        if ($order->status === PaymentStatus::PAID) {
            return [
                'order_id' => $order->order_id,
                'status'   => PaymentStatus::PAID,
                'paid_at'  => $order->paid_at ? $order->paid_at->toIso8601String() : null,
            ];
        }

        $transaction = PaymentTransaction::where('order_id', $order->order_id)
            ->latest('id')
            ->first();

        if (!$transaction) {
            return [
                'order_id' => $order->order_id,
                'status'   => $order->status,
                'paid_at'  => null,
            ];
        }

        $gateway = $this->resolver->resolveForTransaction($transaction);
        $searchKey = $transaction->merchant_order_id ?: $transaction->order_id;
        $statusDTO = $gateway->checkStatus($searchKey, $transaction);

        // Jika status di provider berubah, sinkronkan ke database
        if ($statusDTO->internalStatus !== $transaction->status) {
            $this->finalizePayment(
                transaction: $transaction,
                newStatus: $statusDTO->internalStatus,
                providerReference: $statusDTO->providerReference,
                rawPayload: $statusDTO->rawResponse
            );
            $order->refresh();
        }

        return [
            'order_id'   => $order->order_id,
            'status'     => $order->status,
            'paid_at'    => $order->paid_at ? $order->paid_at->toIso8601String() : null,
            'expired_at' => $transaction->expired_at ? $transaction->expired_at->toIso8601String() : null,
        ];
    }

    /**
     * Single Atomik Finalization Flow
     * Digunakan oleh Webhook Callback dan Server-side Status Inquiry.
     * Idempotent: Order yang sudah PAID tidak akan difinalisasi ulang atau di-downgrade.
     */
    public function finalizePayment(
        PaymentTransaction $transaction,
        string $newStatus,
        ?string $providerReference = null,
        array $rawPayload = []
    ): void {
        DB::transaction(function () use ($transaction, $newStatus, $providerReference, $rawPayload) {
            /** @var Order $order */
            $order = Order::where('order_id', $transaction->order_id)
                ->lockForUpdate()
                ->first();

            if (!$order) {
                Log::error("[PaymentService] Finalize gagal: Order tidak ditemukan.", [
                    'order_id' => $transaction->order_id,
                ]);
                return;
            }

            // Aturan Idempotency: Jika order sudah PAID, tolak perubahan status menjadi pending/failed/expired
            if ($order->status === PaymentStatus::PAID) {
                if ($newStatus !== PaymentStatus::PAID) {
                    Log::warning("[PaymentService] Menolak perubahan order PAID menjadi {$newStatus}.", [
                        'order_id' => $order->order_id,
                    ]);
                    return;
                }
                // Jika sudah paid dan callback paid tiba lagi, perbarui data transaksi jika perlu lalu selesai
                $transaction->update([
                    'status'             => 'success',
                    'provider_reference' => $providerReference ?: $transaction->provider_reference,
                    'paid_at'            => $transaction->paid_at ?: now(),
                ]);
                return;
            }

            $user = $order->user;
            $event = $order->event;

            // KASUS 1: PEMBAYARAN SUKSES (PAID)
            if ($newStatus === PaymentStatus::PAID) {
                // Late payment handling: jika order sebelumnya sudah expired atau cancelled
                $isLatePayment = in_array($order->status, [PaymentStatus::EXPIRED, PaymentStatus::CANCELLED], true);
                if ($isLatePayment) {
                    $canAccommodate = true;
                    $totalOrdered = $order->orderItems->sum('quantity');
                    $eventTicket = \App\Models\EventTicket::where('event_id', $order->event_id)->lockForUpdate()->first();
                    if ($eventTicket && $eventTicket->capacity !== null) {
                        $soldTickets = DB::table('order_items')
                            ->join('orders', 'order_items.order_id', '=', 'orders.id')
                            ->where('orders.event_id', $order->event_id)
                            ->where('orders.status', PaymentStatus::PAID)
                            ->sum('order_items.quantity');
                        $available = $eventTicket->capacity - $soldTickets;
                        if ($totalOrdered > $available) {
                            $canAccommodate = false;
                        }
                    }

                    if (!$canAccommodate) {
                        // Kuota sudah habis diambil orang lain selama late payment
                        $order->update(['status' => 'refund_required']);
                        $transaction->update([
                            'status'             => 'late_payment_conflict',
                            'provider_reference' => $providerReference ?: $transaction->provider_reference,
                            'paid_at'            => now(),
                            'raw_response'       => $rawPayload ?: $transaction->raw_response,
                        ]);

                        Log::warning("[PaymentService] Late payment conflict: Pembayaran tiba setelah expired dan kuota penuh", [
                            'order_id' => $order->order_id,
                        ]);

                        if ($user) {
                            $user->notify(new OperationalNotification(
                                "Pembayaran Terlambat & Kuota Penuh",
                                "Pembayaran Anda diterima setelah batas waktu berakhir dan kuota event sudah terisi. Tim kami akan memproses pengembalian dana (refund).",
                                "payment_conflict",
                                ['event_id' => $event?->id, 'order_id' => $order->order_id]
                            ));
                        }
                        return;
                    }

                    Log::info("[PaymentService] Late payment berhasil diakomodasi karena kuota masih mencukupi", [
                        'order_id' => $order->order_id,
                    ]);
                }

                $order->update([
                    'status'  => PaymentStatus::PAID,
                    'paid_at' => now(),
                ]);

                $transaction->update([
                    'status'             => 'success',
                    'provider_reference' => $providerReference ?: $transaction->provider_reference,
                    'paid_at'            => now(),
                    'raw_response'       => $rawPayload ?: $transaction->raw_response,
                ]);

                // Aktifkan tiket peserta
                foreach ($order->orderItems as $item) {
                    $item->tickets()->update(['status' => 'active']);
                }

                // Konfirmasi reservasi kursi / kuota secara konsisten
                $this->seatLockService->confirmReservationByOrder($order);

                // Gamification: Berikan 150 poin partisipasi hanya 1 kali
                $alreadyAwarded = PointTransaction::where('user_id', $user->id)
                    ->where('event_id', $event?->id)
                    ->where('description', 'like', '%Poin Partisipasi Event%')
                    ->exists();

                if (!$alreadyAwarded && $user) {
                    $user->addPoints(
                        150,
                        "Poin Partisipasi Event: " . ($event ? $event->title : 'Event KampusX'),
                        null,
                        $event?->id
                    );
                }

                // Notifikasi operasional ke user
                if ($user) {
                    $user->notify(new OperationalNotification(
                        "Pembayaran Berhasil!",
                        "Pembayaran Anda untuk event '" . ($event ? $event->title : 'Event KampusX') . "' berhasil dikonfirmasi. Tiket elektronik Anda telah aktif.",
                        "payment_success",
                        ['event_id' => $event?->id, 'order_id' => $order->order_id]
                    ));
                }

                Log::info("[PaymentService] Order dan E-Ticket berhasil diaktifkan", [
                    'order_id' => $order->order_id,
                ]);
            }

            // KASUS 2: PEMBAYARAN GAGAL / KEDALUWARSA / DIBATALKAN
            elseif (in_array($newStatus, [PaymentStatus::FAILED, PaymentStatus::EXPIRED, PaymentStatus::CANCELLED], true)) {
                $transaction->update([
                    'status'       => $newStatus,
                    'raw_response' => $rawPayload ?: $transaction->raw_response,
                ]);

                // Lepaskan reservasi kursi & kuota secara terpusat dan idempotent
                $this->seatLockService->releaseReservationByOrder($order, $newStatus);

                // Notifikasi pembatalan ke user
                if ($user) {
                    $user->notify(new OperationalNotification(
                        "Pembayaran Gagal / Dibatalkan",
                        "Pembayaran tiket untuk event '" . ($event ? $event->title : 'Event KampusX') . "' tidak dapat diproses atau telah kedaluwarsa.",
                        "payment_failed",
                        ['event_id' => $event?->id, 'order_id' => $order->order_id]
                    ));
                }

                Log::info("[PaymentService] Order ditandai sebagai {$newStatus}", [
                    'order_id' => $order->order_id,
                ]);
            }
        });
    }
}
