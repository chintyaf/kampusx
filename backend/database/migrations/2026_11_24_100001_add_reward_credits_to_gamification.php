<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah kolom pendukung Reward Credits ke skema existing.
 *
 * Reward Credits = saldo spendable TERPISAH dari Global Points.
 * - Global Points (users.points) → menentukan tier, TIDAK berkurang saat redeem.
 * - Reward Credits (users.reward_credits) → saldo spendable, bisa hangus 12 bulan.
 * - Local Points (local_member_points.points_balance) → per-event saja, tidak berubah.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tambah saldo reward_credits ke users
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('reward_credits')->default(0)->after('tier')
                ->comment('Saldo Reward Credits spendable, terpisah dari Global Points tier');
        });

        // Tambah kolom expires_at dan is_expired ke point_transactions
        // Hanya berlaku untuk type='credit' (reward credits yang bisa hangus)
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('description')
                ->comment('Masa berlaku kredit (hanya untuk type=credit, null = tidak hangus)');
            $table->boolean('is_expired')->default(false)->after('expires_at')
                ->comment('Apakah kredit ini sudah diproses expired (untuk mencegah double expiry)');
        });

        // Perluas ENUM type pada point_transactions agar mendukung 'credit'
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE point_transactions MODIFY COLUMN type ENUM('global','local','credit') NOT NULL DEFAULT 'global'");
    }

    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->dropColumn(['expires_at', 'is_expired']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('reward_credits');
        });
    }
};
