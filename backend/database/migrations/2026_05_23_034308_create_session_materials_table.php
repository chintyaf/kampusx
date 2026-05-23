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
        Schema::create('session_materials', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel event_sessions
            $table->foreignId('event_session_id')
                  ->constrained('event_sessions')
                  ->cascadeOnDelete();

            // Sesuai dengan state 'materialFormType' di React
            $table->enum('type', ['url', 'video_file', 'document']);

            // Nama file (cth: "Slide_Sesi_1.pdf") atau label URL
            $table->string('name');

            // Menyimpan path dari AWS S3 / local storage, atau URL asli YouTube
            $table->text('path_or_url');

            // Ukuran file untuk di-render di UI (cth: "2.5 MB"). 
            // Nullable karena tipe 'url' tidak punya ukuran file.
            $table->string('file_size', 50)->nullable();

            // Menyimpan urutan index untuk fitur Drag & Drop (GripVertical)
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_materials');
    }
};
