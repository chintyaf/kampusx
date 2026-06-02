<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $table = 'attendance_logs';

    protected $fillable = [
        'event_id',
        'ticket_id',
        'user_id',       // Tambahkan jika kamu perlu melacak berdasarkan user yang login
        'method',        // (Misal: 'online_link', 'offline_scanner')
        'scanned_by',    // (Bisa diisi dengan ID Stasiun/Kiosk jika offline, null jika online)
        'scan_time',     // Waktu Check-in
        'checkout_time', // Waktu Check-out
        'device_id'      // WAJIB DITAMBAHKAN untuk fitur Layer 4: Device Lock
    ];

    // Mengubah string tanggal dari database otomatis menjadi objek Carbon
    // Ini akan sangat mempermudah manipulasi dan pengecekan waktu ke depannya
    protected $casts = [
        'scan_time' => 'datetime',
        'checkout_time' => 'datetime',
    ];
}
