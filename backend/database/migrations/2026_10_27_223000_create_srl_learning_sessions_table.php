<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('srl_learning_sessions', function (Blueprint $table) {
            $table->id();

            // Learning Context
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // $table->foreignId('enrollment_id')->nullable()->constrained('enrollments')->nullOnDelete();
            // $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            // $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();

            // Session Status
            $table->enum('status', ['planned', 'in_progress', 'completed', 'abandoned'])->default('planned');
            $table->enum('current_phase', ['forethought', 'performance', 'reflection'])->default('forethought');

            // Forethought Phase
            $table->text('goal')->nullable();
            $table->text('motivation')->nullable();
            $table->json('strategies')->nullable();
            $table->unsignedSmallInteger('estimated_minutes')->default(25);
            $table->unsignedTinyInteger('confidence_level')->nullable();

            // Performance Phase
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('accumulated_seconds')->default(0);
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('focus_level')->nullable();

            // Self-Reflection Phase
            $table->enum('goal_achievement', ['tercapai', 'sebagian', 'belum'])->nullable();
            $table->json('factors')->nullable();
            $table->text('evaluation')->nullable();
            $table->text('future_adjustment')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'status']);
            // $table->index(['user_id', 'module_id']); // Di-comment karena kolom module_id di atas di-comment
            $table->index(['user_id', 'created_at']);
            $table->index('current_phase');
        });

        Schema::create('srl_session_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('srl_learning_session_id')
                ->constrained('srl_learning_sessions')
                ->cascadeOnDelete();

            // Polymorphic target (konsisten dengan learning_activities: Lesson, Module, Quiz, dll.)
            $table->string('target_type', 100);
            $table->unsignedBigInteger('target_id');

            // Tracking interaksi & durasi per materi di dalam sesi ini
            $table->string('activity_type', 50)->default('viewed'); // contoh: viewed, completed, quiz_attempted
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['srl_learning_session_id', 'started_at']);
            $table->index(['srl_learning_session_id', 'target_type', 'target_id'], 'srl_session_target_idx');
            $table->index(['target_type', 'target_id']);
        });
    }

    public function down(): void
    {
        // Drop child table lebih dulu sebelum parent table
        Schema::dropIfExists('srl_session_materials');
        Schema::dropIfExists('srl_learning_sessions');
    }
};
