<?php

namespace App\Services\Payment\Adapters;

use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\DTO\PaymentRequestDTO;
use App\Services\Payment\DTO\PaymentResponseDTO;
use App\Services\Payment\DTO\PaymentStatusDTO;
use App\Services\Payment\DTO\CallbackResultDTO;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuGateway implements PaymentGatewayInterface
{
    protected string $merchantCode;
    protected string $apiKey;
    protected string $inquiryUrl;
    protected string $statusUrl;
    protected string $callbackUrl;
    protected string $returnUrl;
    protected string $environment;

    public function __construct(?string $environment = null, ?array $customConfig = null)
    {
        $this->environment = $environment ?? config('payment.mode', 'sandbox');
        $providerConfig = config("payment.providers.duitku.{$this->environment}", []);

        $this->merchantCode = $customConfig['merchant_code'] ?? ($providerConfig['merchant_code'] ?? '');
        $this->apiKey       = $customConfig['api_key'] ?? ($providerConfig['api_key'] ?? '');
        $this->inquiryUrl   = $customConfig['inquiry_url'] ?? ($providerConfig['inquiry_url'] ?? 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry');
        $this->statusUrl    = $customConfig['status_url'] ?? ($providerConfig['status_url'] ?? 'https://sandbox.duitku.com/webapi/api/merchant/transactionStatus');

        $this->callbackUrl  = config('payment.providers.duitku.callback_url') 
            ?: rtrim(config('app.url', 'http://127.0.0.1:8000'), '/') . '/api/payment/callback/duitku';
        $this->returnUrl    = config('payment.providers.duitku.return_url') 
            ?: rtrim(config('app.frontend_url', 'http://localhost:5173'), '/') . '/checkout/result';
    }

    public function getProviderName(): string
    {
        return 'duitku';
    }

    public function getEnvironment(): string
    {
        return $this->environment;
    }

    public function getMerchantCode(): string
    {
        return $this->merchantCode;
    }

    /**
     * Membuat invoice dan hosted checkout URL ke Duitku POP API.
     */
    public function createPayment(PaymentRequestDTO $request): PaymentResponseDTO
    {
        // 1. Validasi konfigurasi
        if (empty($this->merchantCode) || empty($this->apiKey)) {
            Log::error("[DuitkuGateway] Kredensial merchantCode atau apiKey belum diatur.", [
                'merchant_order_id' => $request->merchantOrderId,
            ]);

            return new PaymentResponseDTO(
                isSuccess: false,
                statusCode: 'CONFIG_MISSING',
                statusMessage: 'Kredensial Duitku belum dikonfigurasi.',
                errorMessage: 'Merchant code atau API key Duitku kosong pada environment ' . $this->environment,
            );
        }

        // 2. Generate Signature Duitku Inquiry: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
        // $rawSignature = $this->merchantCode . $request->merchantOrderId . $request->amount . $this->apiKey;
        // $signature = md5($rawSignature);
        $timestamp = (string) round(microtime(true) * 1000);

        $signature = hash_hmac(
            'sha256',
            $this->merchantCode . $timestamp,
            $this->apiKey
        );

        // 3. Susun payload sesuai dokumentasi POP API Duitku
        $payload = [
            'paymentAmount'     => (int) $request->amount,
            'merchantOrderId'   => $request->merchantOrderId,
            'productDetails'    => $request->itemName,
            'email'             => $request->customerEmail,
            'phoneNumber'       => $request->customerPhone,
            'additionalParam'   => $request->additionalParam ?? '',
            'merchantUserInfo'  => $request->merchantUserInfo ?? $request->customerEmail,
            'customerVaName'    => $request->customerName,
            'callbackUrl'       => $request->callbackUrl ?: $this->callbackUrl,
            'returnUrl'         => $request->returnUrl ?: $this->returnUrl,
            // 'signature'         => $signature,
            'expiryPeriod'      => $request->expiryMinutes,
        ];

        if (!empty($request->paymentMethod)) {
            $payload['paymentMethod'] = $request->paymentMethod;
        }

        if (!empty($request->itemDetails)) {
            $payload['itemDetails'] = $request->itemDetails;
        }

        try {
            Log::info("[DuitkuGateway] Mengirim request create invoice", [
                'merchant_order_id' => $request->merchantOrderId,
                'amount'            => $request->amount,
                'environment'       => $this->environment,
            ]);

            $response = Http::withHeaders([
                'x-duitku-merchantcode' => $this->merchantCode,
                'x-duitku-timestamp' => $timestamp,
                'x-duitku-signature' => $signature,
            ])
                ->asJson()
                ->acceptJson()
                ->timeout(15)
                ->post($this->inquiryUrl, $payload);

            $data = $response->json();

            // Tangani error HTTP status atau network timeout
            if (!$response->successful() || !$data) {
                $rawMsg = $data['Message'] ?? ($data['statusMessage'] ?? ($data['message'] ?? null));
                if ($rawMsg === 'Merchant not found' || $response->status() === 404) {
                    $errorMsg = "Kredensial Duitku Sandbox tidak valid: Merchant Code '{$this->merchantCode}' tidak terdaftar di Duitku Sandbox (Duitku: Merchant not found). Harap periksa dan sesuaikan DUITKU_MERCHANT_CODE dan DUITKU_API_KEY di file backend/.env dengan kredensial asli dari dashboard https://merchant.duitku.com/";
                } else {
                    $errorMsg = $rawMsg ?: ("HTTP error status: " . $response->status());
                }

                Log::error("[DuitkuGateway] Gagal membuat invoice Duitku", [
                    'merchant_order_id' => $request->merchantOrderId,
                    'status_code'       => $response->status(),
                    'error'             => $errorMsg,
                    'raw_response'      => $data ?: $response->body(),
                ]);

                return new PaymentResponseDTO(
                    isSuccess: false,
                    statusCode: (string) ($data['statusCode'] ?? $response->status()),
                    statusMessage: $errorMsg,
                    errorMessage: $errorMsg,
                    rawResponse: is_array($data) ? $data : ['body' => $response->body()],
                );
            }

            // Tangani status code response Duitku ("00" menandakan sukses)
            $statusCode = (string) ($data['statusCode'] ?? '');
            $statusMessage = (string) ($data['statusMessage'] ?? '');

            if ($statusCode === '00' && !empty($data['paymentUrl'])) {
                Log::info("[DuitkuGateway] Invoice berhasil dibuat", [
                    'merchant_order_id'  => $request->merchantOrderId,
                    'provider_reference' => $data['reference'] ?? null,
                ]);

                return new PaymentResponseDTO(
                    isSuccess: true,
                    checkoutUrl: $data['paymentUrl'],
                    providerReference: $data['reference'] ?? null,
                    statusCode: $statusCode,
                    statusMessage: $statusMessage,
                    rawResponse: $data,
                );
            }

            Log::warning("[DuitkuGateway] Invoice ditolak oleh Duitku", [
                'merchant_order_id' => $request->merchantOrderId,
                'status_code'       => $statusCode,
                'status_message'    => $statusMessage,
            ]);

            return new PaymentResponseDTO(
                isSuccess: false,
                statusCode: $statusCode,
                statusMessage: $statusMessage,
                errorMessage: $statusMessage ?: 'Duitku mengembalikan status penolakan invoice.',
                rawResponse: $data,
            );

        } catch (\Throwable $e) {
            Log::error("[DuitkuGateway] Exception saat menghubungi API Duitku", [
                'merchant_order_id' => $request->merchantOrderId,
                'error'             => $e->getMessage(),
            ]);

            return new PaymentResponseDTO(
                isSuccess: false,
                statusCode: 'GATEWAY_TIMEOUT',
                statusMessage: 'Koneksi ke gateway pembayaran gagal atau batas waktu habis.',
                errorMessage: $e->getMessage(),
            );
        }
    }

    /**
     * Memverifikasi validitas signature callback dari Duitku.
     * Rumus Signature Callback: MD5(merchantCode + amount + merchantOrderId + apiKey)
     */
    public function verifyCallback(Request $request, ?PaymentTransaction $transaction = null): bool
    {
        $merchantCode    = (string) $request->input('merchantCode', '');
        $amount          = (string) $request->input('amount', '');
        $merchantOrderId = (string) $request->input('merchantOrderId', '');
        $signature       = (string) $request->input('signature', '');

        // 1. Verifikasi parameter wajib terisi
        if (empty($merchantCode) || empty($amount) || empty($merchantOrderId) || empty($signature)) {
            Log::warning("[DuitkuGateway] Callback tidak lengkap parameter wajibnya.");
            return false;
        }

        // 2. Verifikasi merchant identity
        if ($merchantCode !== $this->merchantCode) {
            Log::warning("[DuitkuGateway] Callback merchantCode tidak cocok.", [
                'received' => $merchantCode,
                'expected' => $this->merchantCode,
            ]);
            return false;
        }

        // 3. Verifikasi signature Duitku: MD5(merchantCode + amount + merchantOrderId + apiKey) atau HMAC-SHA256
        $expectedMd5 = md5($this->merchantCode . $amount . $merchantOrderId . $this->apiKey);
        $expectedHmac = hash_hmac(
            'sha256',
            $this->merchantCode . $amount . $merchantOrderId,
            $this->apiKey
        );

        if (!hash_equals($expectedMd5, strtolower($signature)) && !hash_equals($expectedHmac, strtolower($signature))) {
            Log::warning("[DuitkuGateway] Callback signature mismatch.", [
                'merchant_order_id' => $merchantOrderId,
            ]);
            return false;
        }

        return true;
    }

    /**
     * Mem-parsing payload callback Duitku ke CallbackResultDTO.
     */
    public function parseCallback(Request $request): CallbackResultDTO
    {
        $merchantOrderId = (string) $request->input('merchantOrderId', '');
        $amountRaw       = $request->input('amount', 0);
        $amount          = (int) round((float) $amountRaw);
        $reference       = (string) $request->input('reference', '');
        $resultCode      = (string) $request->input('resultCode', '');

        // Mapping resultCode Duitku ("00" = Berhasil, "01" = Gagal)
        $internalStatus = match ($resultCode) {
            '00'    => PaymentStatus::PAID,
            '01'    => PaymentStatus::FAILED,
            default => PaymentStatus::FAILED,
        };

        return new CallbackResultDTO(
            isValid: true,
            merchantOrderId: $merchantOrderId,
            amount: $amount,
            providerReference: $reference,
            internalStatus: $internalStatus,
            resultCode: $resultCode,
            rawPayload: $request->all(),
        );
    }

    /**
     * Status inquiry ke Duitku API: POST /webapi/api/merchant/transactionStatus
     * Signature Status: MD5(merchantCode + merchantOrderId + apiKey)
     */
    public function checkStatus(string $merchantOrderId, ?PaymentTransaction $transaction = null): PaymentStatusDTO
    {
        $signature = md5($this->merchantCode . $merchantOrderId . $this->apiKey);

        $payload = [
            'merchantCode'    => $this->merchantCode,
            'merchantOrderId' => $merchantOrderId,
            'signature'       => $signature,
        ];

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->timeout(10)
                ->post($this->statusUrl, $payload);

            $data = $response->json();

            if (!$response->successful() || !$data) {
                Log::warning("[DuitkuGateway] Status inquiry request gagal", [
                    'merchant_order_id' => $merchantOrderId,
                    'status_code'       => $response->status(),
                ]);

                return new PaymentStatusDTO(
                    merchantOrderId: $merchantOrderId,
                    internalStatus: PaymentStatus::PENDING,
                    providerStatus: (string) $response->status(),
                    rawResponse: is_array($data) ? $data : ['body' => $response->body()],
                );
            }

            $statusCode = (string) ($data['statusCode'] ?? '');
            $amountRaw  = $data['amount'] ?? null;
            $amount     = $amountRaw !== null ? (int) round((float) $amountRaw) : null;
            $reference  = $data['reference'] ?? null;

            // Mapping Status Code Duitku Transaction Status:
            // "00" = SUCCESS
            // "01" = PENDING
            // "02" = CANCELLED
            $internalStatus = match ($statusCode) {
                '00'    => PaymentStatus::PAID,
                '01'    => PaymentStatus::PENDING,
                '02'    => PaymentStatus::CANCELLED,
                default => PaymentStatus::PENDING,
            };

            return new PaymentStatusDTO(
                merchantOrderId: $merchantOrderId,
                internalStatus: $internalStatus,
                providerStatus: $statusCode,
                amount: $amount,
                providerReference: $reference,
                rawResponse: $data,
            );

        } catch (\Throwable $e) {
            Log::error("[DuitkuGateway] Exception saat status inquiry", [
                'merchant_order_id' => $merchantOrderId,
                'error'             => $e->getMessage(),
            ]);

            return new PaymentStatusDTO(
                merchantOrderId: $merchantOrderId,
                internalStatus: PaymentStatus::PENDING,
                providerStatus: 'ERROR',
                rawResponse: ['error' => $e->getMessage()],
            );
        }
    }
}
