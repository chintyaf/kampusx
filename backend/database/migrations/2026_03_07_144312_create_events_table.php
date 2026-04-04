<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organizer_id')->nullable()->constrained('users')->nullOnDelete();
            // Asosiasi or smth
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->cascadeOnDelete();

            $table->string('title', 200);
            $table->string('slug', 200)->nullable()->unique()->index();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable(); // Untuk poster event

            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->string('timezone', 50)->nullable();

            $table->enum('status', ['draft', 'published', 'cancelled'])->default('draft');
            $table->softDeletes(); // Tambahan fitur restore
            $table->timestamps();

            $table->boolean('is_featured')->default(false);
        });

        Schema::create('event_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();

            // Institusi partner yang diajak kerja sama
            $table->foreignId('institution_id')->constrained('institutions')->cascadeOnDelete();

            $table->enum('role', ['co_host', 'sponsor', 'media_partner']);
            $table->unique(['event_id', 'institution_id']);
        });


        Schema::create('categories', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->string('name', 100);
        });

        Schema::create('event_categories', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->unique(['event_id', 'category_id']);
        });

        Schema::create('event_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // Tambahkan ini untuk menandakan "Hari ke-X"
            $table->unsignedTinyInteger('day_number')->nullable()->comment('Contoh: 1 untuk Hari 1, 2 untuk Hari 2');

            // Date dan time tetap dipertahankan untuk kalender eksak
            $table->date('date')->nullable(); // Diganti jadi nullable agar bisa diisi belakangan
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            $table->timestamps();
        });

        Schema::create('speakers', function (Blueprint $table) {
            $table->id();

            // Menghubungkan ke tabel utama events
            // Supaya organizer bisa mengakses speaker yang sudah ditambahkan di event tertentu
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();

            $table->string('name');
            $table->string('role')->nullable();
            $table->text('bio')->nullable();
            $table->json('social_link')->nullable();
            $table->json('expertise')->nullable();
        });

        Schema::create('event_session_speakers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('session_id')->constrained('event_sessions')->cascadeOnDelete();
            $table->foreignId('speaker_id')->constrained('speakers')->cascadeOnDelete();
            $table->unique(['session_id', 'speaker_id']);
        });

        Schema::create('event_locations', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke tabel utama events
            $table->foreignId('event_id')->unique()->constrained('events')->cascadeOnDelete();

            // Pembeda tipe: online, offline, atau hybrid
            $table->enum('type', ['online', 'offline', 'hybrid']);

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
            $table->integer('online_quota')->nullable()->default(0);
            $table->integer('offline_quota')->nullable()->default(0);

            $table->timestamps();
        });

    }

    public function down(): void
    {
        // Hapus child/pivot tables dulu
        Schema::dropIfExists('event_locations');
        Schema::dropIfExists('event_session_speakers');
        Schema::dropIfExists('event_categories');
        Schema::dropIfExists('event_sessions');
        Schema::dropIfExists('speakers');
        Schema::dropIfExists('categories');

        // Hapus parent table terakhir
        Schema::dropIfExists('events');
    }
};
