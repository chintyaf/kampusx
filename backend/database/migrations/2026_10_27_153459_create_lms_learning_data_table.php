
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Learning Activities
        |--------------------------------------------------------------------------
        | Log aktivitas belajar Member.
        | Digunakan untuk:
        | - SRL Performance Phase
        | - Durasi dan aktivitas belajar
        | - Data training/model AI
        |
        | Contoh activity_type:
        | view_lesson, start_lesson, complete_lesson,
        | start_quiz, quiz_submit
        */

        Schema::create('learning_activities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('module_id')
                ->nullable()
                ->constrained('modules')
                ->nullOnDelete();

            $table->foreignId('lesson_id')
                ->nullable()
                ->constrained('lessons')
                ->nullOnDelete();

            $table->string('activity_type', 50);

            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();

            $table->unsignedInteger('duration_seconds')->default(0);

            $table->decimal('progress', 5, 2)->default(0.00);

            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'activity_type']);
            $table->index(['user_id', 'start_time']);
            $table->index(['lesson_id', 'user_id']);
            $table->index(['module_id', 'user_id']);
        });


        /*
        |--------------------------------------------------------------------------
        | 2. Learning Histories
        |--------------------------------------------------------------------------
        | Ringkasan riwayat pembelajaran setiap Member.
        | Satu record untuk satu Member pada satu Lesson.
        |
        | Berbeda dari learning_activities yang menyimpan
        | setiap aktivitas, tabel ini menyimpan progress terakhir.
        */

        Schema::create('learning_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('lesson_id')
                ->constrained('lessons')
                ->cascadeOnDelete();

            $table->enum('status', [
                'in_progress',
                'completed'
            ])->default('in_progress');

            $table->decimal('progress', 5, 2)->default(0.00);

            $table->unsignedInteger('duration_seconds')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // Satu ringkasan riwayat per Member untuk setiap Lesson
            $table->unique(['user_id', 'lesson_id']);

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'last_accessed_at']);
        });


        /*
        |--------------------------------------------------------------------------
        | 3. Learning Completions
        |--------------------------------------------------------------------------
        | Riwayat pencapaian Member untuk:
        | - Lesson
        | - Module
        | - Learning Path
        |
        | Tidak bergantung pada enrollments.
        */

        Schema::create('learning_completions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // lesson, module, learning_path
            $table->string('completable_type', 50);
            $table->unsignedBigInteger('completable_id');

            // Nilai akhir jika pencapaian melibatkan kuis
            $table->decimal('score', 5, 2)->nullable();

            // Informasi tambahan pencapaian
            $table->json('metadata')->nullable();

            $table->timestamp('completed_at');

            $table->timestamps();

            // Satu pencapaian untuk satu target per Member
            $table->unique(
                ['user_id', 'completable_type', 'completable_id'],
                'learning_completion_unique'
            );

            $table->index(['user_id', 'completed_at']);
            $table->index(['completable_type', 'completable_id']);
        });


        /*
        |--------------------------------------------------------------------------
        | 4. Readiness Predictions
        |--------------------------------------------------------------------------
        | Hasil prediksi Learning Readiness menggunakan
        | Random Forest Classifier.
        */

        Schema::create('readiness_predictions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('quiz_attempt_id')
                ->nullable()
                ->constrained('quiz_attempts')
                ->nullOnDelete();

            $table->string('model_version', 100);

            // 0.00000 - 1.00000
            $table->decimal('readiness_score', 6, 5);

            $table->enum('readiness_level', [
                'belum_siap',
                'cukup_siap',
                'siap'
            ]);

            $table->timestamp('predicted_at');

            $table->timestamps();

            $table->index(['user_id', 'predicted_at']);
        });


        /*
        |--------------------------------------------------------------------------
        | 5. Recommendations
        |--------------------------------------------------------------------------
        | Hasil Recommendation Engine Hybrid.
        | Menggabungkan Content-Based Filtering dan
        | Item-Based Collaborative Filtering.
        */

        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // learning_path atau module
            $table->string('content_type', 50);
            $table->unsignedBigInteger('content_id');

            $table->decimal('cbf_score', 8, 6)->nullable();
            $table->decimal('cf_score', 8, 6)->nullable();

            $table->decimal('score', 8, 6);
            $table->unsignedInteger('rank_position');

            $table->timestamps();

            $table->index(['user_id', 'content_type']);
            $table->index(['user_id', 'rank_position']);
            $table->index(['content_type', 'content_id']);
        });





        /*
        |--------------------------------------------------------------------------
        | 8. Certificates
        |--------------------------------------------------------------------------
        | Sertifikat yang diterbitkan berdasarkan pencapaian.
        |
        | Terutama untuk penyelesaian Learning Path.
        | Mendukung integrasi dengan modul kredensial eksternal.
        */

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('completion_id')
                ->constrained('learning_completions')
                ->cascadeOnDelete();

            $table->string('certificate_number', 100)->unique();

            $table->string('title', 200);
            $table->text('description')->nullable();

            // Lokasi file sertifikat
            $table->string('file_path', 500)->nullable();

            $table->timestamp('issued_at')->nullable();

            $table->enum('status', [
                'pending',
                'issued',
                'failed',
                'revoked'
            ])->default('pending');

            // Integrasi dengan modul kredensial eksternal
            $table->string('external_credential_id', 150)->nullable();
            $table->json('external_response')->nullable();

            $table->timestamps();

            // Satu pencapaian hanya menghasilkan satu sertifikat
            $table->unique('completion_id');

            $table->index(['user_id', 'issued_at']);
            $table->index('status');
        });
    }


    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('certificates');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('readiness_predictions');
        Schema::dropIfExists('learning_completions');
        Schema::dropIfExists('learning_histories');
        Schema::dropIfExists('learning_activities');

        Schema::enableForeignKeyConstraints();
    }
};
