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
        // Table: smart_contract_credentials
        // Menjembatani hasil belajar (Microlearning) dengan pencetakan sertifikat di Blockchain (SBT)
        Schema::create('smart_contract_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Sertifikat diterbitkan setelah menyelesaikan sebuah Learning Path
            $table->foreignId('learning_path_id')->constrained('learning_paths')->onDelete('cascade');
            

            // Integrasi Modul Blockchain & Smart Contract
    
            $table->string('wallet_address')->nullable();  // Alamat dompet kripto (Web3) milik pengguna
            $table->string('transaction_hash')->unique()->nullable(); // Bukti (hash) transaksi pencetakan sertifikat di jaringan blockchain
            $table->string('token_id')->nullable(); // ID unik dari sertifikat digital (Soulbound Token) yang diterbitkan
            $table->string('metadata_uri')->nullable(); // Tautan penyimpanan terdesentralisasi (IPFS) untuk detail data kelulusan
            $table->enum('status', ['pending', 'processing', 'minted', 'failed'])->default('pending'); // Status proses minting (pencetakan) ke blockchain
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smart_contract_credentials');
    }
};