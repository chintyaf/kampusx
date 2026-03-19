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
        Schema::create('interest', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
        });

        Schema::create('event_interest', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('categories')->cascadeOnDelete();
            $table->unique(['event_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interest');
        Schema::dropIfExists('event_interest');
    }
};
