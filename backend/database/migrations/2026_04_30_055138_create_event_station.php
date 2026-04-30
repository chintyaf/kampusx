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
        Schema::create('event_stations', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel events (Pos ini milik event yang mana)
            $table->foreignId('event_id')->constrained()->onDelete('cascade');

            // Nama Pos, contoh: "Pos A" atau "Pintu Depan" (Sesuai Poin 1 & 2 di gambar)
            $table->string('name');

            // PIN untuk login scanner (Sesuai Poin 1 & 3 di gambar)
            // Menggunakan string karena PIN diawali angka 0 tetap terjaga,
            // unique agar tidak ada PIN ganda di satu sistem.
            $table->string('access_code', 6)->unique();

            // Status apakah pos ini masih aktif atau tidak
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_stations');
    }
};
