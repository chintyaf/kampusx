<?php

namespace App\Services\Payment\DTO;

class PaymentRequestDTO
{
    public function __construct(
        public string $merchantOrderId,
        public int $amount,
        public string $itemName,
        public string $customerName,
        public string $customerEmail,
        public string $customerPhone,
        public ?string $paymentMethod = null,
        public ?string $callbackUrl = null,
        public ?string $returnUrl = null,
        public int $expiryMinutes = 15,
        public ?string $merchantUserInfo = null,
        public array $itemDetails = [],
        public ?string $additionalParam = null,
    ) {}
}
