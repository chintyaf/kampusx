<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecureMedia extends Model
{
    use HasFactory;

    protected $table = 'secure_media';

    protected $fillable = [
        'filename',
        'mime_type',
        'file_size',
        'storage_type',
        'file_path',
        'content',
    ];

    /**
     * The attributes that should be hidden for arrays (e.g., when serialized to JSON).
     */
    protected $hidden = [
        'content', // Never expose raw binary content in API responses directly
    ];
}
