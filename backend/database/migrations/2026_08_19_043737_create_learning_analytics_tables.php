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
        // 1. Table: learning_progress
        // Melacak aktivitas belajar per lesson secara granular
        Schema::create('learning_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            
            $table->enum('status', ['in_progress', 'completed'])->default('in_progress');
            
            // Total waktu yang dihabiskan user di materi ini (penting untuk analitik)
            $table->integer('time_spent_seconds')->default(0);
            
            // Kapan terakhir kali user membuka materi ini
            $table->timestamp('last_accessed_at')->useCurrent();
            
            $table->timestamps();
        });

        // 2. Table: learning_streaks
        // Melacak konsistensi belajar user (gamifikasi dasar & input untuk AI)
        Schema::create('learning_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Jumlah hari berturut-turut belajar
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            
            // Tanggal terakhir aktivitas (untuk mengecek apakah streak putus atau lanjut)
            $table->date('last_activity_date')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_streaks');
        Schema::dropIfExists('learning_progress');
    }
};