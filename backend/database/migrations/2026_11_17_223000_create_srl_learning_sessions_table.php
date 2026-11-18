<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Sesi Pembelajaran Self-Regulated Learning (SRL):
     * Mencakup 3 fase siklus SRL (Forethought -> Performance -> Self-Reflection)
     * untuk mendukung interaksi pada fitur modal SRLModal.jsx
     */
    public function up(): void
    {
        Schema::create('srl_learning_sessions', function (Blueprint $table) {
            $table->id();

            // Relasi konteks belajar
            $table->foreignId('enrollment_id')->nullable()->constrained('enrollments')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('module_id')->nullable()->constrained('modules')->nullOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();

            // Status & Navigasi Fase Sesi
            $table->enum('status', ['planned', 'in_progress', 'completed', 'abandoned'])->default('in_progress');
            $table->string('current_phase', 50)->default('forethought'); // 'forethought', 'performance', 'reflection'

            // =================================================================
            // FASE 1: FORETHOUGHT (Perencanaan & Penetapan Sasaran)
            // =================================================================
            $table->text('goal')->nullable();                              // Target/sasaran belajar sesi ini (sessionGoal)
            $table->text('motivation')->nullable();                        // Motivasi belajar yang mendasari sesi ini
            $table->json('strategies')->nullable();                        // Strategi pilihan (selectedStrategies, e.g. Pomodoro, Catat Poin)
            $table->unsignedSmallInteger('estimated_minutes')->default(25);// Estimasi/alokasi target waktu belajar (menit)
            $table->unsignedTinyInteger('confidence_level')->nullable();   // Keyakinan diri / self-efficacy (skala 1 - 5)

            // =================================================================
            // FASE 2: PERFORMANCE (Pelaksanaan, Pemantauan & Timer Belajar)
            // =================================================================
            $table->timestamp('started_at')->nullable();                   // Waktu mulai timer sesi belajar
            $table->timestamp('ended_at')->nullable();                     // Waktu selesai sesi belajar
            $table->unsignedInteger('accumulated_seconds')->default(0);    // Durasi akumulatif waktu belajar aktual (detik)
            $table->text('notes')->nullable();                             // Catatan selama proses belajar mandiri
            $table->unsignedTinyInteger('focus_level')->nullable();        // Tingkat fokus yang dirasakan (skala 1 - 5)

            // =================================================================
            // FASE 3: SELF-REFLECTION (Evaluasi & Refleksi Mandiri)
            // =================================================================
            $table->enum('goal_achievement', ['tercapai', 'sebagian', 'belum'])->nullable(); // Evaluasi pencapaian target
            $table->json('factors')->nullable();                           // Faktor penyebab keberhasilan/hambatan (array string)
            $table->text('evaluation')->nullable();                        // Catatan evaluasi pemahaman materi
            $table->text('future_adjustment')->nullable();                 // Rencana penyesuaian strategi untuk sesi berikutnya

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('srl_learning_sessions');
        Schema::enableForeignKeyConstraints();
    }
};
