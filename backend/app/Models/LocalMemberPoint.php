<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model untuk merepresentasikan saldo akumulasi poin lokal peserta per event.
 */
class LocalMemberPoint extends Model
{
    use HasFactory;

    protected $table = 'local_member_points';

    protected $fillable = [
        'user_id',         // ID User pemilik poin
        'event_id',        // ID Event tempat poin lokal berlaku
        'points_balance',  // Saldo poin saat ini
    ];

    /**
     * Relasi ke User pemilik poin.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Event terkait.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
