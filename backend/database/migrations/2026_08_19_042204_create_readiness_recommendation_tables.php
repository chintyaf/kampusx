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
        // 1. Table: learning_readiness
        Schema::create('learning_readiness', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            
            // Skor kesiapan belajar (misal: 0.00 hingga 100.00)
            $table->decimal('readiness_score', 5, 2)->default(0);
            
            // Status tingkat kesiapan
            $table->enum('readiness_level', ['siap', 'belum siap'])->default('belum siap');
            
            // Feedback dari sistem jika belum siap
            $table->text('remedial_feedback')->nullable();
            
            $table->timestamps();
        });

        // 2. Table: learning_recommendations
        Schema::create('learning_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Modul yang direkomendasikan
            $table->foreignId('recommended_module_id')->constrained('modules')->onDelete('cascade');
            
            // [BARU] Modul pemicu: Rekomendasi ini muncul karena user berinteraksi dengan modul apa? 
            // (Bisa null jika rekomendasinya murni dari Profil Minat, bukan dari history belajar)
            $table->foreignId('context_module_id')->nullable()->constrained('modules')->onDelete('set null');
            
            // [BARU] Skor kemiripan/relevansi dari algoritma AI (misal 95.50%)
            // Berguna untuk mengurutkan (ORDER BY match_score DESC) daftar rekomendasi
            $table->decimal('match_score', 5, 2)->default(0);
            
            // Alasan mengapa modul ini direkomendasikan (opsional)
            $table->text('recommendation_reason')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_recommendations');
        Schema::dropIfExists('learning_readiness');
    }
};