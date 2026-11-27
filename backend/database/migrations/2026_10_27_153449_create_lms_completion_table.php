
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->foreignId('lesson_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('module_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('learning_path_id')->nullable()->constrained()->cascadeOnDelete();

            $table->decimal('score', 5, 2)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('completed_at');
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id'], 'completion_user_lesson_unique');
            $table->unique(['user_id', 'module_id'], 'completion_user_module_unique');
            $table->unique(['user_id', 'learning_path_id'], 'completion_user_path_unique');

            $table->index(['user_id', 'completed_at']);
        });
        

        // Schema::create('lms_badges', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('code', 100)->unique();
        //     $table->string('name', 150);
        //     $table->text('description')->nullable();
        //     $table->string('icon', 500)->nullable();
        //     $table->string('image', 500)->nullable();
        //     $table->json('criteria')->nullable();
        //     $table->enum('status', ['active', 'inactive'])->default('active');
        //     $table->timestamps();
        // });

        Schema::create('lms_user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('completion_id')->nullable()
                ->constrained('learning_completions')->nullOnDelete();

            $table->string('badge_code', 100);
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->string('icon', 500)->nullable();

            $table->timestamp('awarded_at');
            $table->timestamps();

            $table->unique(['user_id', 'badge_code']);
            $table->index(['user_id', 'awarded_at']);
        });


        Schema::create('lms_user_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('completion_id')->constrained('learning_completions')->cascadeOnDelete();
            $table->string('certificate_number', 100)->unique();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->enum('status', ['pending', 'issued', 'failed', 'revoked'])->default('pending');
            $table->string('external_credential_id', 150)->nullable();
            $table->json('external_response')->nullable();
            $table->timestamps();

            $table->unique('completion_id');
            $table->index(['user_id', 'issued_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lms_user_certificates');
        Schema::dropIfExists('lms_user_badges');
        Schema::dropIfExists('lms_badges');
        Schema::dropIfExists('learning_completions');
    }
};
