<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_session_id',
        'type',
        'name',
        'path_or_url',
        'file_size',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(EventSession::class, 'event_session_id');
    }
}
