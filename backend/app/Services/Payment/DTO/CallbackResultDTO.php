<?php

namespace App\Services\Payment\DTO;

class CallbackResultDTO
{
    public function __construct(
        public bool $isValid,
        public ?string $merchantOrderId = null,
        public ?int $amount = null,
        public ?string $providerReference = null,
        public ?string $internalStatus = null, // pending, paid, failed, expired, cancelled
        public ?string $resultCode = null,
        public ?string $errorMessage = null,
        public array $rawPayload = [],
    ) {}
}
