<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model untuk merepresentasikan riwayat transaksi penukaran reward oleh peserta.
 */
class RedemptionHistory extends Model
{
    use HasFactory;

    protected $table = 'redemption_history';

    protected $fillable = [
        'user_id',              // ID User yang melakukan penukaran
        'reward_id',            // ID Reward yang ditukarkan
        'points_spent',         // Jumlah poin yang dikurangkan pada saat penukaran
        'status',               // Status: 'pending', 'claimed', 'delivered', 'cancelled'
        'notes',                // Catatan/alamat pengiriman atau e-voucher code
        'cancellation_reason',  // Alasan pembatalan jika status 'cancelled'
        'redeemed_at',          // Waktu penukaran reward
    ];

    /**
     * Relasi ke User yang melakukan penukaran.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Reward terkait.
     */
    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }
}
