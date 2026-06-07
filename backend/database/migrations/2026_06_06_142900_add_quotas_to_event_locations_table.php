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
        Schema::table('event_locations', function (Blueprint $table) {
            if (!Schema::hasColumn('event_locations', 'online_quota')) {
                $table->integer('online_quota')->nullable()->default(0)->after('offline_instruction');
            }
            if (!Schema::hasColumn('event_locations', 'offline_quota')) {
                $table->integer('offline_quota')->nullable()->default(0)->after('online_quota');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_locations', function (Blueprint $table) {
            if (Schema::hasColumn('event_locations', 'online_quota')) {
                $table->dropColumn('online_quota');
            }
            if (Schema::hasColumn('event_locations', 'offline_quota')) {
                $table->dropColumn('offline_quota');
            }
        });
    }
};
