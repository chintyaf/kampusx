
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('bloom_level', 50)->nullable();
            $table->unsignedSmallInteger('time_limit_minutes')->nullable();
            $table->decimal('passing_score', 5, 2)->default(70);
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->unique('module_id', 'quizzes_module_unique');
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->text('question_text');
            $table->string('bloom_level', 50)->nullable();
            $table->text('explanation')->nullable();
            $table->unsignedInteger('order_index')->default(1);
            $table->timestamps();

            $table->unique(['quiz_id', 'order_index'], 'quiz_questions_order_unique');
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->char('option_label', 1);
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedTinyInteger('order_index')->default(1);
            $table->timestamps();

            $table->unique(['question_id', 'option_label'], 'question_options_label_unique');
            $table->unique(['question_id', 'order_index'], 'question_options_order_unique');
        });


        // USER DATA
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('attempt_number')->default(1);
            $table->decimal('score', 5, 2)->nullable();
            $table->boolean('is_passed')->nullable();
            $table->dateTime('started_at')->useCurrent();
            $table->dateTime('completed_at')->nullable();
            $table->enum('status', ['in_progress', 'submitted', 'graded'])->default('in_progress');
            $table->timestamps();

            $table->unique(['user_id', 'quiz_id', 'attempt_number'], 'quiz_attempts_user_quiz_number_unique');
            $table->index(['user_id', 'quiz_id']);
        });

        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->text('answer_text')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->dateTime('answered_at')->nullable();
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id'], 'quiz_answers_attempt_question_unique');
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
