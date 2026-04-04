<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventLocation extends Model
{
    use HasFactory;

    // Pastikan ini sesuai dengan nama tabel di migration Anda.
    // Jika migration menggunakan Schema::create('event_location', ...), gunakan 'event_location'.
    // Namun best practice Laravel adalah plural: 'event_locations'.
    protected $table = 'event_locations';

    protected $fillable = [
        'event_id',
        'type',

        // --- Field untuk Online ---
        'platform',
        'meeting_link',
        'online_instruction',

        // --- Field untuk Offline ---
        'location_name', // Diperbaiki: sebelumnya ditulis 'location'
        'location_detail',
        'maps_url',
        'latitude',      // Ditambahkan
        'longitude',     // Ditambahkan

        // --- Hierarki Alamat --- (Ditambahkan karena belum ada di model lama)
        'country',
        'province',
        'city',
        'district',
        'address_detail',
        'offline_instruction',

        // --- Hybrid / Quota ---
        'online_quota',
        'offline_quota',
    ];

    // Opsional tapi sangat disarankan: Casting tipe data
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'online_quota' => 'integer',
        'offline_quota' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
