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
        Schema::table('organizer_requests', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('note');
            $table->boolean('can_resubmit')->default(true)->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizer_requests', function (Blueprint $table) {
            $table->dropColumn(['rejection_reason', 'can_resubmit']);
        });
    }
};
