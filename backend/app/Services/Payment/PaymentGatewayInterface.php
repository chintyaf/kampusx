<?php

namespace App\Services\Payment;

use App\Models\PaymentTransaction;
use App\Services\Payment\DTO\PaymentRequestDTO;
use App\Services\Payment\DTO\PaymentResponseDTO;
use App\Services\Payment\DTO\PaymentStatusDTO;
use App\Services\Payment\DTO\CallbackResultDTO;
use Illuminate\Http\Request;

/**
 * Interface kontrak standar payment gateway (Strategy Pattern).
 * Memungkinkan pergantian provider (Duitku, Midtrans, Xendit, dll)
 * tanpa mengubah controller, alur order, atau tiket.
 */
interface PaymentGatewayInterface
{
    /**
     * Nama unik provider (misal: 'duitku').
     */
    public function getProviderName(): string;

    /**
     * Membuat sesi pembayaran/invoice ke API provider.
     */
    public function createPayment(PaymentRequestDTO $request): PaymentResponseDTO;

    /**
     * Memeriksa status transaksi terkini dari API server provider (Status Inquiry).
     */
    public function checkStatus(string $merchantOrderId, ?PaymentTransaction $transaction = null): PaymentStatusDTO;

    /**
     * Memverifikasi validitas signature dan otentisitas callback webhook dari provider.
     */
    public function verifyCallback(Request $request, ?PaymentTransaction $transaction = null): bool;

    /**
     * Mem-parsing payload callback ke format CallbackResultDTO terstandar.
     */
    public function parseCallback(Request $request): CallbackResultDTO;
}
