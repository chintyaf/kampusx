<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizerRequest extends Model
{
    protected $fillable = [
        'user_id',
        'institution_id',
        'custom_institution_name',
        'organization_name',
        'proof_path',
        'note',
        'rejection_reason',
        'can_resubmit',
        'status',
    ];

    protected $appends = ['proof_url'];

    public function getProofUrlAttribute()
    {
        return $this->proof_path ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->proof_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
