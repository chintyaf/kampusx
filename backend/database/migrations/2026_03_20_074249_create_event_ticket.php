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
        Schema::create('event_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();

            $table->enum('type', ['online', 'offline'])->default('offline')->index();

            $table->boolean('is_free')->default(false)->index();
            // Menggunakan unsigned agar harga tidak bisa negatif
            $table->decimal('price', 15, 2)->unsigned()->default(0);

            // Menggunakan unsignedInteger untuk kuota
            $table->unsignedInteger('capacity')->nullable()->comment('Null means unlimited');

            $table->dateTime('sale_start')->nullable();
            $table->dateTime('sale_end')->nullable();

            // Membantu performa saat mengecek tiket per event
            $table->timestamps();

            $table->index(['event_id', 'sale_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_tickets');
    }
};
