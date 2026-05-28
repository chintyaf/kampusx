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
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('is_missing_info_reminded')->default(false);
            $table->boolean('is_ongoing_reminded')->default(false);
            $table->boolean('is_finished_reminded')->default(false);
            $table->boolean('is_post_event_reminded')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'is_missing_info_reminded',
                'is_ongoing_reminded',
                'is_finished_reminded',
                'is_post_event_reminded'
            ]);
        });
    }
};
