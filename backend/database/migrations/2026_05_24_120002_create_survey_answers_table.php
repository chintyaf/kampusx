<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survey_answers', function (Blueprint $table) {
            $table->id();
            // Link ke header respons
            $table->foreignId('response_id')->constrained('survey_responses')->cascadeOnDelete();
            // Link ke pertanyaan yang dijawab
            $table->foreignId('question_id')->constrained('survey_questions')->cascadeOnDelete();
            // Jawaban dalam bentuk teks (untuk semua tipe pertanyaan)
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_answers');
    }
};
