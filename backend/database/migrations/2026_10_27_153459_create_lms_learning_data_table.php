<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. SRL Forethoughts (Fase 1 SRL: Perencanaan & Target Belajar)
        Schema::create('srl_forethoughts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->text('goal');
            $table->text('plan');
            $table->text('motivation')->nullable();
            $table->timestamps();
        });

        // 2. SRL Reflections (Fase 3 SRL: Evaluasi & Refleksi Mandiri)
        Schema::create('srl_reflections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->string('reflection_type', 50)->default('general');
            $table->text('content');
            $table->timestamps();
        });

        // 3. Learning Activities (Fase 2 SRL: Log & Durasi Belajar)
        Schema::create('learning_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->foreignId('module_id')->nullable()->constrained('modules')->onDelete('cascade');
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->onDelete('cascade');
            $table->string('activity_type', 50); // e.g., 'view_lesson', 'complete_lesson', 'quiz_submit'
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->decimal('progress', 5, 2)->default(0.00);
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });

        // 4. Readiness Predictions (Hasil Prediksi Random Forest AI)
        Schema::create('readiness_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('quiz_attempt_id')->nullable()->constrained('quiz_attempts')->onDelete('set null');
            $table->string('model_version', 100);
            $table->decimal('readiness_score', 6, 5); // 0.00000 - 1.00000
            $table->enum('readiness_level', ['belum_siap', 'cukup_siap', 'siap']);
            $table->dateTime('predicted_at');
            $table->timestamps();
        });

        // 5. Recommendations (Hasil Recommendation Engine Hybrid)
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('content_type', 50); // e.g., 'learning_path', 'module'
            $table->unsignedBigInteger('content_id');
            $table->decimal('cbf_score', 8, 6)->nullable();
            $table->decimal('cf_score', 8, 6)->nullable();
            $table->decimal('score', 8, 6);
            $table->integer('rank_position');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('readiness_predictions');
        Schema::dropIfExists('learning_activities');
        Schema::dropIfExists('srl_reflections');
        Schema::dropIfExists('srl_forethoughts');
    }
};
