<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model untuk merepresentasikan mutasi/transaksi poin user (global & lokal).
 */
class PointTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',      // ID User penerima/pengguna poin
        'event_id',     // ID Event jika bertipe 'local', atau null jika global/credit
        'activity_id',  // ID Activity jika dipicu oleh aktivitas berpoin
        'reward_id',    // ID Reward jika merupakan penukaran reward
        'amount',       // Jumlah mutasi (positif = masuk, negatif = keluar)
        'type',         // Tipe: 'global' | 'local' | 'credit'
        'description',  // Keterangan transaksi
        'expires_at',   // Masa berlaku (hanya untuk type=credit dengan amount>0)
        'is_expired',   // Sudah diproses expired? (mencegah double-expiry)
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_expired' => 'boolean',
    ];

    /**
     * Relasi ke User pemilik transaksi.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Event terkait (nullable).
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Relasi ke master Activity terkait (nullable).
     */
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * Relasi ke Reward terkait (nullable).
     */
    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }
}
