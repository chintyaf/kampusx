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
        'method',
        'scanned_by',
        'scan_time',
        'checkout_time'
    ];
}
