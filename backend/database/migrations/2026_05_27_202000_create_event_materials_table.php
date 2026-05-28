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

            // Tipe materi: video, document, link
            $table->string('type'); // 'video', 'document', 'link'

            $table->string('title');
            $table->text('url');
            $table->text('description')->nullable();
            
            // Apakah materi ini memerlukan kehadiran (check-in) untuk diakses
            $table->boolean('require_attendance')->default(false);

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
