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
        // Tabel master jenis aktivitas yang dapat menghasilkan poin bagi user
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            
            // Nama aktivitas (misal: "Kehadiran Sesi", "Pengisian Kuesioner")
            $table->string('name', 150);
            
            // Kode unik pengenal aktivitas (misal: "attendance", "fill_survey")
            $table->string('slug', 100)->unique();
            
            // Jumlah poin default yang dihadiahkan untuk aktivitas ini
            $table->integer('points_rewarded');
            
            // Tipe poin yang dihasilkan: global (poin platform) atau local (poin event)
            $table->enum('type', ['global', 'local'])->default('global');
            
            // Deskripsi atau petunjuk aktivitas
            $table->text('description')->nullable();
            
            // Menandakan apakah aktivitas ini masih aktif digunakan
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
