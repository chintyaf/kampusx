<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institution extends Model
{
    protected $fillable = ['name', 'slug', 'type', 'description', 'logo_path'];

    // User yang tergabung dalam institusi ini
// app/Models/Institution.php

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
                    ->using(InstitutionUser::class) // Gunakan model pivot buatan kita
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // Event yang diselenggarakan oleh institusi ini
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    // Event dimana institusi ini menjadi collaborator (co-host/sponsor)
    public function collaboratedEvents(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_collaborators')
                    ->withPivot('role');
    }


}
