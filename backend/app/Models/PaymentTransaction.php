<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $table = 'payment_transactions';

    protected $fillable = [
        'token',
        'order_id',
        'provider',
        'environment',
        'merchant_order_id',
        'provider_reference',
        'merchant_code',
        'payment_method',
        'amount',
        'customer_name',
        'customer_email',
        'item_name',
        'status',
        'callback_url',
        'redirect_url',
        'checkout_url',
        'raw_response',
        'expired_at',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'raw_response' => 'array',
        'expired_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /**
     * Relasi ke Order model berdasarkan order_id string.
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    /**
     * Scope to find pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Check if transaction is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction is success.
     */
    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if transaction is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if transaction is expired.
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    /**
     * Check if transaction has actually expired based on date.
     */
    public function hasExpiredByTime(): bool
    {
        return $this->isPending() && $this->expired_at && $this->expired_at->isPast();
    }
}
