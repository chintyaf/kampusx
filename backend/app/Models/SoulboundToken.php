<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoulboundToken extends Model
{
    use HasFactory;

    protected $table = 'soulbound_tokens';

    protected $fillable = [
        'user_id',
        'credential_submission_id',
        'ticket_code',
        'token_id',
        'title',
        'issuer',
        'tx_hash',
        'contract_address',
        'wallet_address',
        'block_number',
        'standard',
        'cognitive_score',
        'skill_category',
        'token_uri',
        'status',
        'minted_at',
    ];

    protected $casts = [
        'minted_at' => 'datetime',
        'cognitive_score' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
