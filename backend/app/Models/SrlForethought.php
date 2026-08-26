<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SrlForethought extends Model
{
    use HasFactory;

    protected $table = 'srl_forethoughts';

    protected $fillable = [
        'user_id',
        'learning_path_id',
        'learning_goals',
        'estimated_time_minutes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
