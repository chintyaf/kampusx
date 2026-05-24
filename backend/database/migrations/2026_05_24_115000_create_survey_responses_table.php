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
        Schema::create('survey_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->integer('rating'); // General event rating (1-5)
            $table->integer('speaker_rating')->nullable(); // Speaker rating (1-5)
            $table->integer('material_rating')->nullable(); // Material rating (1-5)
            $table->text('comments')->nullable(); // User feedback/comments
            $table->timestamps();

            // Ensure a user can only submit one survey response per event
            $table->unique(['user_id', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_responses');
    }
};
