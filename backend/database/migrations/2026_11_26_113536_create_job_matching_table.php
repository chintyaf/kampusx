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
        Schema::create('user_skill_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();

            $table->decimal('score', 6, 5)->default(0);          // 0..1, dipakai untuk vektor
            $table->unsignedSmallInteger('lesson_count')->default(0);
            $table->decimal('quiz_avg', 5, 2)->nullable();
            $table->unsignedSmallInteger('event_count')->default(0);  // opsional, dari kehadiran event
            $table->timestamp('last_evidence_at')->nullable();
            $table->timestamp('computed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'skill_id']);
            $table->index(['skill_id', 'score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_skill_scores');
    }
};
