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
            // Asumsi organizer adalah entitas dari tabel users
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
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
            $table->enum('content_type', ['article', 'video'])->default('article');
            $table->longText('content_body')->nullable();
            $table->string('video_url')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('learning_paths');
    }
};
