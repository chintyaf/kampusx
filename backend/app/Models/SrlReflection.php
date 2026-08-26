<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SrlReflection extends Model
{
    use HasFactory;

    protected $table = 'srl_reflections';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'module_id',
        'reflection_note',
        'understanding_level',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
