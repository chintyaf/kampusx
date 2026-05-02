<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventTicket extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi melalui mass assignment.
     */
    protected $fillable = [
        'event_id',
        'name',
        'type',
        'is_free',
        'price',
        'capacity',
        'sale_start',
        'sale_end',
    ];

    /**
     * Casting atribut ke tipe data asli Laravel.
     */
    protected $casts = [
        'is_free' => 'boolean',
        'price' => 'decimal:2',
        'capacity' => 'integer',
        'sale_start' => 'datetime',
        'sale_end' => 'datetime',
    ];

    /**
     * Relasi: Tiket ini milik sebuah Event.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Scope untuk memfilter tiket yang sedang dalam masa penjualan.
     */
    public function scopeAvailable($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('sale_start')
              ->orWhere('sale_start', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('sale_end')
              ->orWhere('sale_end', '>=', $now);
        });
    }

    /**
     * Accessor untuk mengecek apakah tiket unlimited.
     */
    public function getIsUnlimitedAttribute(): bool
    {
        return is_null($this->capacity);
    }
}
