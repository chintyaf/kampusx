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
        'is_verified',
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

}
