<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class InstitutionUser extends Pivot
{
    // Nama tabel harus didefinisikan secara eksplisit jika tidak mengikuti konvensi
    protected $table = 'institution_user';

    // Karena di migrasi kamu menambahkan $table->id(), set ini ke true
    public $incrementing = true;

    // Tambahkan kolom pivot agar bisa diisi (mass assignment)
    protected $fillable = [
        'institution_id',
        'user_id',
        'role',
    ];

    /**
     * Contoh Helper: Mengecek apakah user adalah owner
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Contoh Helper: Mengecek apakah user adalah admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
