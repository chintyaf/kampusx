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
}