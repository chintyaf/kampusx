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
        'reward_credits',
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

    public function waitlists(): HasMany
    {
        return $this->hasMany(EventWaitlist::class, 'user_id');
    }

    public function learningPaths(): HasMany
    {
        return $this->hasMany(LearningPath::class, 'created_by');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'user_id');
    }

    public function enrolledLearningPaths(): BelongsToMany
    {
        return $this->belongsToMany(LearningPath::class, 'enrollments', 'user_id', 'learning_path_id')
            ->withPivot(['status', 'enrolled_at', 'completed_at', 'last_accessed_at'])
            ->withTimestamps();
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'user_id');
    }

    public function readinessPredictions(): HasMany
    {
        return $this->hasMany(ReadinessPrediction::class, 'user_id');
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class, 'user_id');
    }

    public function srlLearningSessions(): HasMany
    {
        return $this->hasMany(SrlLearningSession::class, 'user_id');
    }

    public function learningActivities(): HasMany
    {
        return $this->hasMany(LearningActivity::class, 'user_id');
    }

    public function learningHistories(): HasMany
    {
        return $this->hasMany(LearningHistory::class, 'user_id');
    }

    public function learningCompletions(): HasMany
    {
        return $this->hasMany(LearningCompletion::class, 'user_id');
    }

    public function lmsUserBadges(): HasMany
    {
        return $this->hasMany(LmsUserBadge::class, 'user_id');
    }

    public function lmsUserCertificates(): HasMany
    {
        return $this->hasMany(LmsUserCertificate::class, 'user_id');
    }

    public function latestReadiness(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ReadinessPrediction::class, 'user_id')->latestOfMany();
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

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'student_badges', 'user_id', 'badge_id')
                    ->withPivot('unlocked_at')
                    ->withTimestamps();
    }

    public function studentBadges(): HasMany
    {
        return $this->hasMany(StudentBadge::class, 'user_id');
    }

    public function rewardDecisionLogs(): HasMany
    {
        return $this->hasMany(RewardDecisionLog::class, 'user_id');
    }

    public function externalAchievements(): HasMany
    {
        return $this->hasMany(ExternalAchievement::class, 'user_id');
    }

    /**
     * Hitung tier berdasarkan poin sesuai spesifikasi gamifikasi Tugas Akhir:
     * - Silver   : 0 - 499 poin
     * - Gold     : 500 - 999 poin
     * - Platinum : >= 1000 poin
     */
    public function calculateTier(): string
    {
        $currentPoints = (int) ($this->points ?? 0);
        if ($currentPoints >= 1000) {
            return 'Platinum';
        }
        if ($currentPoints >= 500) {
            return 'Gold';
        }
        return 'Silver';
    }

    /**
     * Tambahkan Global Points, rekam transaksi ledger, dan hitung ulang Tier.
     * Global Points TIDAK berkurang saat penukaran reward — hanya untuk tier.
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
            'user_id'     => $this->id,
            'event_id'    => $eventId,
            'activity_id' => $activityId,
            'amount'      => $amount,
            'type'        => 'global',
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

    /**
     * Tambahkan Reward Credits (saldo spendable) dengan expiry 12 bulan.
     * Anti-duplikasi via referenceKey. TIDAK mempengaruhi Global Points atau tier.
     *
     * @param int    $amount       Jumlah kredit yang diberikan
     * @param string $description  Deskripsi aktivitas
     * @param string $referenceKey Kunci unik aktivitas untuk mencegah duplikasi
     * @return array ['success', 'duplicate', 'amount', 'new_balance', 'expires_at']
     */
    public function addRewardCredits(int $amount, string $description, string $referenceKey): array
    {
        // Anti-duplikasi: cek apakah referenceKey sudah pernah diberikan
        $alreadyGiven = \App\Models\PointTransaction::where('user_id', $this->id)
            ->where('type', 'credit')
            ->where('amount', '>', 0)
            ->where('description', 'like', "%[REF:{$referenceKey}]%")
            ->exists();

        if ($alreadyGiven) {
            return [
                'success'     => false,
                'duplicate'   => true,
                'message'     => "Reward Credits untuk [{$referenceKey}] sudah pernah diberikan.",
                'amount'      => 0,
                'new_balance' => (int) ($this->reward_credits ?? 0),
            ];
        }

        $expiresAt = now()->addMonths(12);

        // Tambah saldo di kolom users.reward_credits
        $this->reward_credits = (int) ($this->reward_credits ?? 0) + $amount;
        $this->save();

        // Catat di ledger point_transactions (type=credit, expires_at diset)
        \App\Models\PointTransaction::create([
            'user_id'     => $this->id,
            'amount'      => $amount,
            'type'        => 'credit',
            'description' => "{$description} [REF:{$referenceKey}]",
            'expires_at'  => $expiresAt,
            'is_expired'  => false,
        ]);

        return [
            'success'     => true,
            'duplicate'   => false,
            'amount'      => $amount,
            'new_balance' => (int) $this->reward_credits,
            'expires_at'  => $expiresAt->toDateTimeString(),
        ];
    }

    /**
     * Kurangi Reward Credits untuk penukaran reward.
     * HARUS dipanggil dalam DB::transaction dari caller.
     * Global Points dan tier TIDAK terpengaruh.
     *
     * @throws \RuntimeException jika saldo tidak cukup
     */
    public function spendRewardCredits(int $amount, string $description): void
    {
        // lockForUpdate dipanggil dari caller (dalam transaksi)
        $balance = (int) ($this->reward_credits ?? 0);

        if ($balance < $amount) {
            throw new \RuntimeException(
                "Saldo Reward Credits tidak mencukupi. Saldo: {$balance}, Dibutuhkan: {$amount}."
            );
        }

        $this->reward_credits = $balance - $amount;
        $this->save();

        // Catat pengurangan di ledger (nilai negatif)
        \App\Models\PointTransaction::create([
            'user_id'     => $this->id,
            'amount'      => -$amount,
            'type'        => 'credit',
            'description' => $description,
        ]);
    }

    // JOb MATCHING
    public function userSkillScores(): HasMany
    {
        return $this->hasMany(UserSkillScore::class, 'user_id');
    }

    public function recalculateSkillScores(): void
    {
        app(UserSkillScoreService::class)->calculate($this);
    }
}
