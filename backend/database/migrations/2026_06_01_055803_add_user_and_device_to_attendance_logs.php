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
        Schema::table('attendance_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_logs', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('ticket_id');
            }

            if (!Schema::hasColumn('attendance_logs', 'device_id')) {
                $table->string('device_id')->nullable()->after('checkout_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'device_id']);
        });
    }
};
