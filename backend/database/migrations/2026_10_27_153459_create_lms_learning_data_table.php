
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('module_id')->nullable()->constrained()->nullOnDelete();

            $table->string('activity_type', 50);
            $table->string('target_type', 100)->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->timestamps();

            $table->uuid('client_uuid')->nullable()->unique();


            $table->index(['user_id', 'activity_type']);
            $table->index(['user_id', 'module_id', 'occurred_at']);
            $table->index(['target_type', 'target_id']);
        });

        Schema::create('learning_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->decimal('progress', 5, 2)->default(0);
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'last_accessed_at']);
        });

        Schema::create('readiness_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quiz_attempt_id')->nullable()->constrained()->nullOnDelete();
            $table->string('model_version', 100);
            $table->decimal('readiness_score', 6, 5);
            $table->enum('readiness_level', ['belum_siap', 'cukup_siap', 'siap']);
            $table->json('features')->nullable();
            $table->timestamp('predicted_at');
            $table->timestamps();

            $table->index(['user_id', 'predicted_at']);
            $table->index(['user_id', 'readiness_level']);
        });

        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
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
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('readiness_predictions');
        Schema::dropIfExists('learning_histories');
        Schema::dropIfExists('learning_activities');
    }
};
