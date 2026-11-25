<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TalentPostComment extends Model
{
    use HasFactory;

    protected $table = 'talent_post_comments';

    protected $fillable = [
        'talent_post_id',
        'user_id',
        'comment',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(TalentPost::class, 'talent_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
