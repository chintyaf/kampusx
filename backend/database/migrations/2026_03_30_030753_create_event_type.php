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

        Schema::create('event_types', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->string('name', 100);
        });

        Schema::create('event_types_event', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('event_types_id')->constrained('event_types')->cascadeOnDelete();
            $table->unique(['event_id', 'event_types_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_type');
    }
};
