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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'tier')) {
                $table->enum('tier', ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'])
                      ->default('Silver')
                      ->after('points');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'tier')) {
                $table->dropColumn('tier');
            }
        });
    }
};
