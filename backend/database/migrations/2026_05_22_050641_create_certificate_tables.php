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
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('background_path'); // Path gambar template kosong (tanpa teks)
            // SANGAT PENTING: Simpan resolusi asli kanvas saat desain
            // Ini agar koordinat X dan Y tetap presisi meskipun di-generate di server
            $table->integer('canvas_width')->default(1920); 
            $table->integer('canvas_height')->default(1080);
            $table->timestamps();
        });

        Schema::create('certificate_elements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('certificate_templates')->cascadeOnDelete();
            
            // Jenis elemen: 'nama_peserta', 'id_sertifikat', 'qr_code', 'teks_kustom'
            $table->string('element_type'); 
            
            // Koordinat penempatan (Gunakan float/decimal untuk presisi)
            $table->float('position_x'); 
            $table->float('position_y');
            
            // Styling (Bisa null jika elemen berupa QR Code)
            $table->integer('font_size')->nullable();
            $table->string('font_color')->default('#000000')->nullable();
            $table->string('font_family')->default('Arial')->nullable();
            $table->string('text_align')->default('center'); // left, center, right
            
            // Jika tipe elemen adalah 'teks_kustom', simpan value statisnya di sini
            $table->string('custom_value')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_elements');
        Schema::dropIfExists('certificate_templates');
    }
};

