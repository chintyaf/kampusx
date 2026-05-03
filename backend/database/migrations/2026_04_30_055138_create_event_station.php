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
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('description')->nullable();

            // KODE AKSES (PERBAIKAN)
            // 1. Dibuat unique() secara global, BUKAN composite unique dengan event_id.
            // Alasannya: Karena kita akan pakai format URL `kampusx.com/scan/X7B9Q`.
            // Kalau kode X7B9Q ada di event lain, backend akan bingung ini pos event yang mana.
            // 2. Panjang string dibiarkan default atau set misal 10, agar fleksibel kalau nanti butuh kode lebih panjang.
            $table->boolean('is_active')->default(true)->index();
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
