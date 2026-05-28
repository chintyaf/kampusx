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
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete()->after('user_id');
            $table->string('custom_institution_name')->nullable()->after('institution_id');
            $table->string('organization_name')->nullable()->after('custom_institution_name');
            $table->string('proof_path')->nullable()->after('organization_name');
        });
    }

    /**
 * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizer_requests', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
            $table->dropColumn(['institution_id', 'custom_institution_name', 'organization_name', 'proof_path']);
        });
    }
};
