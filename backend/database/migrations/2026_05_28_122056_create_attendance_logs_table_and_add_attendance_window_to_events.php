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
        // Tambahkan window control ke tabel events
        Schema::table('events', function (Blueprint $table) {
            $table->dateTime('attendance_open_at')->nullable()->after('end_date');
            $table->dateTime('attendance_close_at')->nullable()->after('attendance_open_at');
        });

        // Buat tabel attendance_logs jika belum ada
        if (!Schema::hasTable('attendance_logs')) {
            Schema::create('attendance_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->foreignId('session_id')->nullable()->constrained('event_sessions')->nullOnDelete();
                
                $table->dateTime('scan_time')->nullable(); // check-in
                $table->dateTime('check_out_time')->nullable(); // check-out
                
                $table->unsignedBigInteger('scanned_by')->nullable(); // panitia yang scan
                $table->string('method', 50)->default('qr'); // qr, manual
                
                $table->timestamps();
            });
        } else {
            // Jika sudah ada, pastikan kolom check_out_time ada
            Schema::table('attendance_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('attendance_logs', 'check_out_time')) {
                    $table->dateTime('check_out_time')->nullable()->after('scan_time');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['attendance_open_at', 'attendance_close_at']);
        });

        Schema::dropIfExists('attendance_logs');
    }
};
