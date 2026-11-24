<?php

namespace App\Services\Payment\Enums;

class PaymentStatus
{
    public const PENDING = 'pending';
    public const PAID = 'paid';
    public const FAILED = 'failed';
    public const EXPIRED = 'expired';
    public const CANCELLED = 'cancelled';

    /**
     * Memeriksa apakah status pembayaran termasuk status final (tidak dapat berubah lagi).
     */
    public static function isFinal(string $status): bool
    {
        return in_array($status, [self::PAID, self::FAILED, self::EXPIRED, self::CANCELLED], true);
    }
}
