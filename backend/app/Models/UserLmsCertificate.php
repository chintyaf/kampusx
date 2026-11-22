<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLmsCertificate extends Model
{
    protected $table = 'lms_user_certificates';

    protected $fillable = [
        'user_id',
        'completion_id',
        'certificate_number',
        'title',
        'description',
        'file_path',
        'issued_at',
        'status',
        'external_credential_id',
        'external_response',
    ];

    protected $casts = [
        'issued_at'         => 'datetime',
        'external_response' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function completion(): BelongsTo
    {
        return $this->belongsTo(LearningCompletion::class, 'completion_id');
    }
}
