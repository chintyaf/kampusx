<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Quizzes
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('bloom_level', 50)->nullable();
            $table->unsignedSmallInteger('time_limit_minutes')->nullable();
            $table->decimal('passing_score', 5, 2)->default(70.00);
            $table->timestamps();
        });

        // 2. Quiz Questions
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->text('question_text');
            $table->string('bloom_level', 50)->nullable();
            $table->text('explanation')->nullable();
            $table->integer('order_index')->default(1);
            $table->timestamps();
        });

        // 3. Question Options
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->char('option_label', 1); // e.g., 'A', 'B', 'C', 'D'
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->tinyInteger('order_index')->default(1);
            $table->timestamps();
        });


        // USER DATA
        // 4. Quiz Attempts
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->unsignedSmallInteger('attempt_number')->default(1);
            $table->decimal('score', 5, 2)->default(0.00);
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->string('status', 50)->default('in_progress');
            $table->timestamps();
        });

        // 5. Quiz Answers
        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('quiz_attempts')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->onDelete('set null');
            $table->text('answer_text')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->dateTime('answered_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};
