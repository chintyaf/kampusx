<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    public $timestamps = false; // Karena di migrasi tidak ada timestamps

    protected $fillable = ['name'];

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_categories', 'tag_id', 'event_id');
    }
}
