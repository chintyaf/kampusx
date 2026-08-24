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
        // 1. Table: srl_forethoughts (Fase Perencanaan)
        Schema::create('srl_forethoughts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('learning_path_id')->constrained('learning_paths')->onDelete('cascade');
            $table->text('learning_goals')->nullable();
            $table->integer('estimated_time_minutes')->default(0);
            $table->timestamps();
        });

        // 2. Table: srl_reflections (Fase Evaluasi Diri)
        Schema::create('srl_reflections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->text('reflection_note')->nullable();
            // understanding_level menggunakan skala 1-5
            $table->tinyInteger('understanding_level')->default(3); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('srl_reflections');
        Schema::dropIfExists('srl_forethoughts');
    }
};