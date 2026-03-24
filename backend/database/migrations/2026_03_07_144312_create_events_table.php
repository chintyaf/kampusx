<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id(); // BIGINT PK

            // $table->foreignId('organizer_id')->constrained('organizers')->cascadeOnDelete();
            // $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();

            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();


            $table->string('slug', 200)->unique()->nullable()->index();
            $table->string('title', 200)->nullable();
            $table->text('description')->nullable()->nullable();

            $table->enum('location_type', ['offline', 'online', 'hybrid'])->nullable();

            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();

            $table->enum('status', ['draft', 'published'])->default('draft');

            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->string('name', 100);
        });

        Schema::create('event_categories', function (Blueprint $table) {
            $table->id(); // BIGINT PK

            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();

            $table->foreignId('tag_id')->constrained('categories')->cascadeOnDelete();

            $table->unique(['event_id', 'tag_id']);
        });

        Schema::create('event_sessions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->dateTime('date');
            $table->time('start_time');
            $table->time('end_time');

            $table->string('location')->nullable();
            $table->integer('quota')->nullable();

            $table->timestamps();
        });

        

        Schema::create('speakers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('event_session_id')->constrained('event_sessions')->cascadeOnDelete();

            $table->string('name');
            $table->string('role')->nullable();
            $table->text('bio')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('expertise')->nullable();
        });

        Schema::create('event_session_speakers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('session_id')->constrained('event_sessions')->cascadeOnDelete();

            $table->foreignId('speaker_id')->constrained('speakers')->cascadeOnDelete();

            $table->unique(['session_id', 'speaker_id']);
        });

        // Schema::create('attendances', function (Blueprint $table) {
        //     $table->id();

        //     $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();

        //     $table->foreignId('session_id')->constrained('event_sessions')->cascadeOnDelete();

        //     $table->foreignId('scanned_by')->constrained('users')->cascadeOnDelete();

        //     $table->dateTime('checkin_time')->nullable();
        //     $table->dateTime('leave_time')->nullable();

        //     $table->enum('status', ['present', 'invalid'])->default('present');
        // });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('event_categories');
        Schema::dropIfExists('event_sessions');
        Schema::dropIfExists('speakers');
        Schema::dropIfExists('event_session_speakers');
        // Schema::dropIfExists('attendances');
    }
};
