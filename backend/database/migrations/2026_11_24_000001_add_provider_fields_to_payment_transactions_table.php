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
        Schema::table('payment_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_transactions', 'provider')) {
                $table->string('provider', 50)->default('duitku')->after('order_id')->index();
            }
            if (!Schema::hasColumn('payment_transactions', 'environment')) {
                $table->string('environment', 20)->default('sandbox')->after('provider');
            }
            if (!Schema::hasColumn('payment_transactions', 'merchant_order_id')) {
                $table->string('merchant_order_id', 100)->nullable()->after('environment')->unique();
            }
            if (!Schema::hasColumn('payment_transactions', 'provider_reference')) {
                $table->string('provider_reference', 100)->nullable()->after('merchant_order_id')->index();
            }
            if (!Schema::hasColumn('payment_transactions', 'merchant_code')) {
                $table->string('merchant_code', 50)->nullable()->after('provider_reference');
            }
            if (!Schema::hasColumn('payment_transactions', 'payment_method')) {
                $table->string('payment_method', 50)->nullable()->after('merchant_code');
            }
            if (!Schema::hasColumn('payment_transactions', 'checkout_url')) {
                $table->text('checkout_url')->nullable()->after('redirect_url');
            }
            if (!Schema::hasColumn('payment_transactions', 'raw_response')) {
                $table->text('raw_response')->nullable()->after('checkout_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['raw_response', 'checkout_url', 'payment_method', 'merchant_code', 'provider_reference', 'merchant_order_id', 'environment', 'provider'] as $col) {
                if (Schema::hasColumn('payment_transactions', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
