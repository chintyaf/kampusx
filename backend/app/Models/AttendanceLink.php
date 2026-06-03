<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceLink extends Model
{
    protected $fillable = [
        'code',
        'event_id',
        'session_id',
        'type',
        'expires_at',
        'signature',
    ];
}
