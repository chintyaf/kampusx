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
        'event_id',     // ID Event jika bertipe 'local', atau null jika global
        'activity_id',  // ID Activity jika dipicu oleh aktivitas berpoin, atau null jika redemption/manual adjustment
        'amount',       // Jumlah mutasi poin (positif = penambahan, negatif = pengurangan)
        'type',         // Tipe transaksi: 'global' atau 'local'
        'description',  // Keterangan transaksi
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
}
