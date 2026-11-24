<?php

namespace App\Services\Payment;

use App\Models\PaymentTransaction;
use App\Services\Payment\Adapters\DuitkuGateway;
use InvalidArgumentException;

/**
 * Factory / Resolver sederhana untuk memilih Gateway Adapter (Strategy Pattern).
 * Memenuhi Task 2: Portabilitas provider pembayaran.
 */
class PaymentGatewayResolver
{
    /**
     * Resolve gateway instance berdasarkan nama provider dan environment.
     */
    public function resolve(?string $provider = null, ?string $environment = null): PaymentGatewayInterface
    {
        $providerName = strtolower($provider ?: config('payment.default', 'duitku'));
        $env = $environment ?: config('payment.mode', 'sandbox');

        return match ($providerName) {
            'duitku' => new DuitkuGateway(environment: $env),
            default  => throw new InvalidArgumentException("Payment gateway provider [{$providerName}] tidak didukung."),
        };
    }

    /**
     * Resolve gateway yang tepat khusus untuk transaksi yang sudah tersimpan di database.
     * Memastikan transaksi lama tetap diverifikasi menggunakan konfigurasi & adapter asalnya.
     */
    public function resolveForTransaction(PaymentTransaction $transaction): PaymentGatewayInterface
    {
        $provider = $transaction->provider ?: 'duitku';
        $environment = $transaction->environment ?: config('payment.mode', 'sandbox');

        return $this->resolve($provider, $environment);
    }
}
