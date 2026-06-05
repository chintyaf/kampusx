<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasPushSubscriptions;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'status_reason',
        'university_id',
        'affiliation_valid_until',
        'is_verified',
        'avatar_path',
        'university_id' // Just in case they want to update university_id from profile settings
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_verified' => 'boolean',
    ];

    public function events()
    {
        return $this->hasMany(Event::class, 'organizer_id');
    }

    // User bisa punya banyak institusi (via pivot)
 // app/Models/User.php

    public function institutions(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class)
                    ->using(InstitutionUser::class) // Gunakan model pivot buatan kita
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // Relasi ke institusi asal (university_id dari migrasi terakhir)
    public function university(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'university_id');
    }

    // Event yang dibuat oleh user ini
    public function organizedEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'organizer_id');
    }

    /**
     * Check if the organizer's role has expired (no events created in the last 1 year)
     * and demote them back to a participant (general member) if they have.
     */
    public function checkAndDemoteIfExpired()
    {
        if ($this->role === 'organizer') {
            // 1. Check if they have created any event
            $latestEvent = \App\Models\Event::where('organizer_id', $this->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestEvent) {
                $expiryBasis = $latestEvent->created_at;
            } else {
                // 2. If no event created, check their approval date
                $approvedRequest = \App\Models\OrganizerRequest::where('user_id', $this->id)
                    ->where('status', 'approved')
                    ->orderBy('updated_at', 'desc')
                    ->first();

                if ($approvedRequest) {
                    $expiryBasis = $approvedRequest->updated_at;
                } else {
                    // Fallback to user creation date
                    $expiryBasis = $this->created_at;
                }
            }

            if ($expiryBasis && \Carbon\Carbon::parse($expiryBasis)->addYear()->isPast()) {
                // Demote user to participant (member)
                $this->update([
                    'role' => 'participant',
                    'university_id' => null,
                    'affiliation_valid_until' => null,
                ]);

                // Also update the organizer request status to rejected with resubmit allowed so they can apply again
                \App\Models\OrganizerRequest::where('user_id', $this->id)
                    ->where('status', 'approved')
                    ->update([
                        'status' => 'rejected',
                        'rejection_reason' => 'Masa kepengurusan/aktif Organizer Anda telah kedaluwarsa karena tidak ada event baru yang dibuat dalam 1 tahun terakhir. Silakan ajukan permohonan kembali jika ingin mengaktifkan akun Organizer Anda.',
                        'can_resubmit' => true,
                    ]);
            }
        }
    }

    // Minat user (Kategori event yang disukai)
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_user', 'user_id', 'category_id')->withTimestamps();
    }
}
