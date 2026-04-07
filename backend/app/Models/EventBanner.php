<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventBanner extends Model
{
    protected $appends = ['image_path'];

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }
}
