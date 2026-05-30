<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id', 'order_item_id', 'attendee_name',
        'attendee_email', 'ticket_code', 'qr_token', 'status'
    ];

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function attendanceLog()
    {
        return $this->hasOne(AttendanceLog::class, 'ticket_id');
    }

    // Tambahkan properti ini di bagian atas kelas model
    protected $appends = ['certificate_code'];

    /**
     * Accessor untuk otomatis generate CERT-[Ticket Code]
     */
    public function getCertificateCodeAttribute()
    {
        return 'CERT-' . $this->ticket_code;
    }
}
