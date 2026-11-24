<?php

namespace App\Services\Payment\DTO;

class PaymentStatusDTO
{
    public function __construct(
        public string $merchantOrderId,
        public string $internalStatus, // pending, paid, failed, expired, cancelled
        public ?string $providerStatus = null,
        public ?int $amount = null,
        public ?string $providerReference = null,
        public ?string $paidAt = null,
        public array $rawResponse = [],
    ) {}
}
