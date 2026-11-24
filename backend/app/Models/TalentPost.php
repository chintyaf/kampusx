<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TalentPost extends Model
{
    use HasFactory;

    protected $table = 'talent_posts';

    protected $fillable = [
        'user_id',
        'sbt_credential_id',
        'content',
        'badge_highlight',
        'likes_count',
        'comments_count',
        'shares_count',
    ];

    protected $casts = [
        'badge_highlight' => 'array',
        'likes_count'     => 'integer',
        'comments_count'  => 'integer',
        'shares_count'    => 'integer',
        'created_at'      => 'datetime',
        'updated_at'      => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sbtCredential(): BelongsTo
    {
        return $this->belongsTo(SbtCredential::class, 'sbt_credential_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(TalentPostLike::class, 'talent_post_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TalentPostComment::class, 'talent_post_id')->latest();
    }

    public function isLikedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $this->likes()->where('user_id', $user->id)->exists();
    }
}
