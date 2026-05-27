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
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('post_id')->nullable()->constrained('event_stations')->onDelete('cascade');
            $table->foreignId('session_id')->nullable()->constrained('event_sessions')->onDelete('cascade');
            $table->dateTime('scan_time');
            $table->foreignId('scanned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('method', 20)->default('qr'); // qr, manual
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
