<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SbtCredential extends Model
{
    use HasFactory;

    protected $table = 'sbt_credentials';

    protected $fillable = [
        'user_id',
        'talent_profile_id',
        'certificate_id',
        'token_id',
        'title',
        'issuer',
        'contract_address',
        'tx_hash',
        'block_number',
        'network',
        'token_standard',
        'minted_at',
        'metadata_uri',
        'is_verified',
    ];

    protected $casts = [
        'minted_at'   => 'datetime',
        'is_verified' => 'boolean',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function talentProfile(): BelongsTo
    {
        return $this->belongsTo(TalentProfile::class, 'talent_profile_id');
    }

    public function certificate(): BelongsTo
    {
        return $this->belongsTo(LmsUserCertificate::class, 'certificate_id');
    }
}
