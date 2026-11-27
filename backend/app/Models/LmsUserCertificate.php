<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LmsUserCertificate extends Model
{
    use HasFactory;

    protected $table = 'lms_user_certificates';

    protected $fillable = [
        'user_id',
        'completion_id',
        'learning_path_id',
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
        'issued_at'          => 'datetime',
        'external_response'  => 'array',
        'created_at'         => 'datetime',
        'updated_at'         => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_ISSUED  = 'issued';
    const STATUS_FAILED  = 'failed';
    const STATUS_REVOKED = 'revoked';

    // ----------------------------------------------------------------
    // Relasi
    // ----------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function completion(): BelongsTo
    {
        return $this->belongsTo(LearningCompletion::class, 'completion_id');
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'learning_path_id');
    }
}
