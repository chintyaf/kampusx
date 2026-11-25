<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_reference',
        'user_id',
        'source_system',
        'endpoint',
        'request_payload',
        'status',
        'processing_result',
        'points_result',
        'credential_status',
        'credential_id',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'points_result' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
