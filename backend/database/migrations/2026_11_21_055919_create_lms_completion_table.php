
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
        | 1. Learning Histories
        |--------------------------------------------------------------------------
        | Riwayat Lesson yang pernah diikuti Member.
        | Tidak bergantung pada enrollments.
        */

        Schema::create('learning_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();

            $table->enum('status', [ 'in_progress', 'completed' ])->default('in_progress');
            $table->decimal('progress', 5, 2)->default(0.00);

            $table->unsignedInteger('duration_seconds')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // Satu riwayat per Member untuk setiap Lesson
            $table->unique(['user_id', 'lesson_id']);

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'last_accessed_at']);
        });


        /*
        |--------------------------------------------------------------------------
        | 2. Learning Completions
        |--------------------------------------------------------------------------
        | Riwayat pencapaian Member untuk:
        | - Lesson
        | - Module
        | - Learning Path
        */

        Schema::create('learning_completions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

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
        | 3. Badges
        |--------------------------------------------------------------------------
        | Master data badge yang tersedia di sistem.
        */

        Schema::create('badges', function (Blueprint $table) {
            $table->id();

            $table->string('code', 100)->unique();
            $table->string('name', 150);
            $table->text('description')->nullable();

            $table->string('icon', 500)->nullable();
            $table->string('image', 500)->nullable();

            // Contoh:
            // {"type":"learning_path","required_count":1}
            // {"type":"module","required_count":5}
            $table->json('criteria')->nullable();

            $table->enum('status', [
                'active',
                'inactive'
            ])->default('active');

            $table->timestamps();
        });


        /*
        |--------------------------------------------------------------------------
        | 4. User Badges
        |--------------------------------------------------------------------------
        | Riwayat badge yang diperoleh Member.
        */

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('badge_id')
                ->constrained('badges')
                ->cascadeOnDelete();

            // Pencapaian yang menyebabkan badge diberikan
            $table->foreignId('completion_id')
                ->nullable()
                ->constrained('learning_completions')
                ->nullOnDelete();

            $table->timestamp('awarded_at');

            $table->timestamps();

            // Satu badge hanya dapat diperoleh satu kali
            $table->unique(['user_id', 'badge_id']);

            $table->index(['user_id', 'awarded_at']);
        });


        /*        |--------------------------------------------------------------------------
        | 5. Certificates
        |--------------------------------------------------------------------------
        | Sertifikat yang diterbitkan berdasarkan pencapaian.
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
        Schema::dropIfExists('learning_completions');
        Schema::dropIfExists('learning_histories');

        Schema::enableForeignKeyConstraints();
    }
};
