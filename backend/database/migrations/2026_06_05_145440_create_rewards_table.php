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
        // Tabel item-item reward/hadiah yang bisa ditukarkan oleh user
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke event (NULL jika reward bersifat Global, terisi event_id jika Lokal khusus untuk event tersebut)
            $table->foreignId('event_id')->nullable()->constrained('events')->cascadeOnDelete();
            
            // Judul/Nama reward
            $table->string('title', 150);
            
            // Penjelasan detail reward
            $table->text('description')->nullable();
            
            // Jumlah poin yang harus dibayarkan untuk menukar reward ini
            $table->integer('points_cost');
            
            // Jumlah stok reward yang tersedia (NULL jika tidak dibatasi)
            $table->integer('stock')->nullable();
            
            // Batas penukaran reward per user (NULL jika user bebas menukar berapa kali pun)
            $table->integer('limit_per_user')->nullable();
            
            // Jalur/path gambar representasi reward
            $table->string('image_path')->nullable();
            
            // Tipe reward: fisik (physical) atau digital (digital)
            $table->enum('reward_type', ['physical', 'digital'])->default('physical');
            
            // Jenis poin yang digunakan untuk memotong saldo user: global (poin global) atau local (poin local event)
            $table->enum('type', ['global', 'local'])->default('global');
            
            // Status keaktifan reward di aplikasi
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};
