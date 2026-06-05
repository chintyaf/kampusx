<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model untuk merepresentasikan master jenis kegiatan/aktivitas berpoin.
 */
class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',             // Nama aktivitas (misal: "Kehadiran Webinar")
        'slug',             // Kode/identifier unik (misal: "webinar_attendance")
        'points_rewarded',  // Nilai poin bawaan untuk aktivitas ini
        'type',             // Jenis poin yang didapatkan: 'global' atau 'local'
        'description',      // Keterangan detail aktivitas
        'is_active',        // Status keaktifan jenis aktivitas ini
    ];
}
