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
        // Saldo Poin Lokal per Event (User memiliki saldo poin tersendiri untuk setiap event yang diikuti)
        Schema::create('local_member_points', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel users (peserta)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Relasi ke tabel events (acara yang sedang diikuti)
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            
            // Saldo akumulasi poin lokal yang dimiliki user khusus untuk event tersebut
            $table->integer('points_balance')->default(0);
            
            $table->timestamps();

            // Memastikan satu user hanya memiliki satu record saldo poin per event
            $table->unique(['user_id', 'event_id']);
        });

        // Ledger/Histori Transaksi Poin (Global & Lokal)
        // Menyimpan log riwayat penambahan atau pemakaian poin secara detail
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke user pemilik poin
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Relasi ke event (NULL jika berupa transaksi poin global)
            $table->foreignId('event_id')->nullable()->constrained('events')->cascadeOnDelete();
            
            // Relasi ke master aktivitas poin (NULL jika berupa penukaran reward atau adjustment manual)
            $table->foreignId('activity_id')->nullable()->constrained('activities')->nullOnDelete();
            
            // Jumlah poin yang dimutasi (Positif jika bertambah/earning, Negatif jika berkurang/spending)
            $table->integer('amount');
            
            // Tipe transaksi: global (lintas platform) atau local (terikat event tertentu)
            $table->enum('type', ['global', 'local']);
            
            // Deskripsi atau keterangan tambahan transaksi poin
            $table->string('description')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('local_member_points');
    }
};
