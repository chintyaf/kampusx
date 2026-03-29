<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// php artisan migrate --path=/database/migrations/2026_03_21_052905_create_event_location_detail.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_locations', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke tabel utama events
            $table->foreignId('event_id')->unique()->constrained('events')->cascadeOnDelete();

            // Pembeda tipe: online, offline, atau hybrid
            $table->string('type');

            // --- Field untuk Online ---
            $table->text('platform')->nullable();
            $table->text('meeting_link')->nullable();
            $table->text('online_instruction')->nullable();


            // --- Field untuk Offline ---
            $table->string('location')->nullable();
            $table->string('location_detail')->nullable();
            $table->text('maps_url')->nullable();
            $table->text('offline_instruction')->nullable();


            // Hybird
            $table->integer('online_quota')->nullable();
            $table->integer('offline_quota')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_locations');
    }
};
