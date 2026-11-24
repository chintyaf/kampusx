<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EventWaitlist extends Model
{
    use HasFactory;

    protected $table = 'event_waitlists';

    protected $fillable = [
        'user_id',
        'event_id',
        'event_ticket_id',
        'seat_number',
        'quantity',
        'queue_number',
        'status',
        'offered_at',
        'expires_at',
        'offer_token',
        'lock_token',
        'estimated_wait_seconds',
        'claimed_at',
    ];

    protected $casts = [
        'quantity'               => 'integer',
        'queue_number'           => 'integer',
        'estimated_wait_seconds' => 'integer',
        'offered_at'             => 'datetime',
        'expires_at'             => 'datetime',
        'claimed_at'             => 'datetime',
    ];

    // Status Constants
    public const STATUS_WAITING   = 'WAITING';
    public const STATUS_OFFERED   = 'OFFERED';
    public const STATUS_CLAIMED   = 'CLAIMED';
    public const STATUS_EXPIRED   = 'EXPIRED';
    public const STATUS_CANCELLED = 'CANCELLED';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function eventTicket(): BelongsTo
    {
        return $this->belongsTo(EventTicket::class, 'event_ticket_id');
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', self::STATUS_WAITING);
    }

    public function scopeOffered($query)
    {
        return $query->where('status', self::STATUS_OFFERED);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_WAITING, self::STATUS_OFFERED]);
    }

    public function scopeExpiredOffers($query)
    {
        return $query->where('status', self::STATUS_OFFERED)
            ->where('expires_at', '<', Carbon::now());
    }

    public function isWaiting(): bool
    {
        return $this->status === self::STATUS_WAITING;
    }

    public function isOffered(): bool
    {
        return $this->status === self::STATUS_OFFERED;
    }

    public function isClaimed(): bool
    {
        return $this->status === self::STATUS_CLAIMED;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function hasOfferExpired(): bool
    {
        return $this->isOffered() && $this->expires_at && $this->expires_at->isPast();
    }
}
