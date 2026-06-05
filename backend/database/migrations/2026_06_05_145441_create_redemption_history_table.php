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
        // Tabel riwayat transaksi penukaran reward oleh user
        Schema::create('redemption_history', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke user yang melakukan penukaran
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Relasi ke reward yang ditukarkan
            $table->foreignId('reward_id')->constrained('rewards')->cascadeOnDelete();
            
            // Jumlah saldo poin yang dikurangkan pada saat penukaran ini terjadi
            $table->integer('points_spent');
            
            // Status penukaran: 
            // - pending (menunggu verifikasi)
            // - claimed (khusus reward fisik yang sudah diambil/diterima)
            // - delivered (khusus reward digital yang sudah sukses dikirim kodenya)
            // - cancelled (penukaran dibatalkan/ditolak oleh panitia/user)
            $table->enum('status', ['pending', 'claimed', 'delivered', 'cancelled'])->default('pending');
            
            // Catatan tambahan (misal: alamat pengiriman barang fisik, atau kode voucher digital yang diberikan)
            $table->text('notes')->nullable();
            
            // Keterangan atau alasan pembatalan jika status transaksi diubah menjadi 'cancelled'
            $table->text('cancellation_reason')->nullable();
            
            // Waktu terjadinya penukaran reward
            $table->timestamp('redeemed_at')->useCurrent();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redemption_history');
    }
};
