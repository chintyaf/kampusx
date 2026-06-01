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
        Schema::create('event_materials', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel events
            $table->foreignId('event_id')
                  ->constrained('events')
                  ->cascadeOnDelete();

            $table->string('session_name')->nullable();
            $table->string('speaker_name')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type'); // document, code_repo, design_interactive, media_form
            $table->string('content_url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status')->default('published'); // draft, published

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_materials');
    }
};
