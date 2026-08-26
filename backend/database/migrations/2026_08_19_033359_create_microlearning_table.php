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
        // 1. Table: learning_paths
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('thumbnail')->nullable(); // Gambar Sampul UI
            $table->string('category')->nullable(); // Tagging Topik
            $table->text('description')->nullable();
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->integer('points_reward')->default(0); // Gamifikasi Poin
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
        });

        // 2. Table: modules
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_path_id')->constrained('learning_paths')->onDelete('cascade');
            $table->string('title');
            $table->integer('sequence_order')->default(1);
            // Mendukung prerequisite module (Self-referencing foreign key)
            $table->foreignId('prerequisite_module_id')->nullable()->constrained('modules')->onDelete('set null');
            $table->timestamps();
        });

        // 3. Table: lessons
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->string('title');
            $table->integer('sequence_order')->default(1); // Urutan lesson
            $table->integer('estimated_duration_minutes')->default(5); // Durasi untuk UI
            $table->enum('content_type', ['article', 'video', 'quiz'])->default('article');
            $table->longText('content_body')->nullable();
            $table->string('video_url')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();
        });

        // 4. Table: user_learning_paths
        Schema::create('user_learning_paths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('learning_path_id')->constrained('learning_paths')->onDelete('cascade');
            $table->enum('status', ['enrolled', 'in_progress', 'completed'])->default('enrolled');
            $table->integer('progress_percentage')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 5. Table: user_lesson_completions
        Schema::create('user_lesson_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->timestamp('completed_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_lesson_completions');
        Schema::dropIfExists('user_learning_paths');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('learning_paths');
    }
};
