<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Learning Paths
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('category', 100);
            $table->string('thumbnail', 500)->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
        });

        // 2. Modules
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_path_id')->constrained('learning_paths')->onDelete('cascade');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->json('learning_outcomes')->nullable();
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->integer('order_index')->default(1);
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamps();
        });

        // 3. Lessons
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->string('title', 200);
            $table->longText('content')->nullable();
            $table->text('summary')->nullable();
            $table->integer('order_index')->default(1);
            $table->unsignedSmallInteger('duration_minutes')->default(0);
            $table->timestamps();
        });

        // 4. Master Skills
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->timestamps();
        });

        // 5. Pivot Lesson - Skill (Many-to-Many)
        Schema::create('lesson_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->foreignId('skill_id')->constrained('skills')->onDelete('cascade');
            $table->decimal('relevance_weight', 5, 2)->default(1.00); // Bobot kontribusi skill pada lesson (0.00 - 1.00)
            $table->timestamps();

            $table->unique(['lesson_id', 'skill_id']); // Mencegah duplikasi skill pada lesson yang sama
        });

        // USER DATA
        // 6. Enrollments
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('learning_path_id')->constrained('learning_paths')->onDelete('cascade');
            $table->enum('status', ['active', 'completed', 'dropped'])->default('active');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('lesson_skills');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('learning_paths');
    }
};
