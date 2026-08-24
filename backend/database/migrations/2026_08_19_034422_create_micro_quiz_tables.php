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
        // 1. Table: micro_quizzes
        Schema::create('micro_quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->string('title');
            $table->integer('passing_score')->default(70);
            $table->timestamps();
        });

        // 2. Table: micro_quiz_questions
        Schema::create('micro_quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('micro_quizzes')->onDelete('cascade');
            $table->text('question_text');
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();
        });

        // 3. Table: micro_quiz_options
        Schema::create('micro_quiz_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('micro_quiz_questions')->onDelete('cascade');
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });

        // 4. Table: micro_quiz_attempts
        Schema::create('micro_quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained('micro_quizzes')->onDelete('cascade');
            $table->decimal('score', 5, 2)->default(0);
            $table->enum('status', ['lulus', 'gagal'])->default('gagal');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('micro_quiz_attempts');
        Schema::dropIfExists('micro_quiz_options');
        Schema::dropIfExists('micro_quiz_questions');
        Schema::dropIfExists('micro_quizzes');
    }
};
