<?php

namespace App\Services\Payment\DTO;

class PaymentResponseDTO
{
    public function __construct(
        public bool $isSuccess,
        public ?string $checkoutUrl = null,
        public ?string $providerReference = null,
        public ?string $statusCode = null,
        public ?string $statusMessage = null,
        public ?string $errorMessage = null,
        public array $rawResponse = [],
    ) {}
}
