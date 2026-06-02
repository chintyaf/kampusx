<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            // Menambahkan user_id (opsional: bisa dikaitkan sebagai foreign key jika tabel users kamu ada)
            $table->unsignedBigInteger('user_id')->nullable()->after('ticket_id');

            // Menambahkan device_id untuk keperluan Anti-Titip Absen
            $table->string('device_id')->nullable()->after('checkout_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'device_id']);
        });
    }
};
