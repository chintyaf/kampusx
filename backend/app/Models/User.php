<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
        'points',
        'tier',
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

    protected $appends = [
        'organization_name',
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

    public function approvedOrganizerRequest(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(OrganizerRequest::class, 'user_id')->where('status', 'approved');
    }

    public function getOrganizationNameAttribute()
    {
        if ($this->role === 'organizer') {
            return $this->approvedOrganizerRequest?->organization_name;
        }
        return null;
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

    public function localPoints(): HasMany
    {
        return $this->hasMany(LocalMemberPoint::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(RedemptionHistory::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'participant_id');
    }

    public function soulboundTokens(): HasMany
    {
        return $this->hasMany(SoulboundToken::class, 'user_id');
    }

    /**
     * Hitung tier berdasarkan poin sesuai spesifikasi gamifikasi skripsi:
     * - Bronze   : 0 - 999 poin
     * - Silver   : 1000 - 2499 poin
     * - Gold     : 2500 - 4499 poin
     * - Platinum : >= 4500 poin
     */
    public function calculateTier(): string
    {
        $currentPoints = (int) ($this->points ?? 0);
        if ($currentPoints >= 4500) {
            return 'Platinum';
        }
        if ($currentPoints >= 2500) {
            return 'Gold';
        }
        if ($currentPoints >= 1000) {
            return 'Silver';
        }
        return 'Bronze';
    }

    /**
     * Tambahkan Global Points, rekam transaksi ledger, dan hitung ulang Tier.
     */
    public function addPoints(int $amount, string $description = '', ?int $activityId = null, ?int $eventId = null): array
    {
        $previousTier = $this->tier ?? $this->calculateTier();
        $this->points = (int) ($this->points ?? 0) + $amount;
        $newTier = $this->calculateTier();
        $this->tier = $newTier;
        $this->save();

        // Catat di ledger transaksi poin
        \App\Models\PointTransaction::create([
            'user_id' => $this->id,
            'event_id' => $eventId,
            'activity_id' => $activityId,
            'amount' => $amount,
            'type' => 'global',
            'description' => $description ?: 'Penambahan poin gamifikasi',
        ]);

        return [
            'points_awarded' => $amount,
            'total_points'   => $this->points,
            'previous_tier'  => $previousTier,
            'current_tier'   => $newTier,
            'tier_upgraded'  => $previousTier !== $newTier,
        ];
    }
}
