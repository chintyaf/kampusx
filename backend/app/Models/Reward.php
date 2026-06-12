<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model untuk merepresentasikan hadiah/reward yang dapat ditukarkan peserta.
 */
class Reward extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',        // NULL jika global reward, terisi event_id jika lokal reward
        'title',           // Nama reward
        'description',     // Deskripsi detail reward
        'points_cost',     // Poin yang dibutuhkan untuk redeem
        'stock',           // Stok item (null jika tidak dibatasi)
        'limit_per_user',  // Batas penukaran per pengguna
        'image_path',      // Jalur file poster/gambar reward
        'reward_type',     // Tipe: 'physical' atau 'digital'
        'type',            // Saldo poin yang didebet: 'global' atau 'local'
        'is_active',       // Apakah reward aktif dipajang
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (empty($this->image_path)) {
            return null;
        }

        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }

        return asset('storage/' . $this->image_path);
    }

    /**
     * Mendapatkan Event tempat reward lokal ini berada.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
