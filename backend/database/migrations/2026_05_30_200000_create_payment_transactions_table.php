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
        Schema::create('payment_transactions', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('token')->unique();
            $blueprint->string('order_id');
            $blueprint->decimal('amount', 15, 2);
            $blueprint->string('customer_name');
            $blueprint->string('customer_email');
            $blueprint->string('item_name');
            $blueprint->string('status')->default('pending'); // pending, success, failed, expired
            $blueprint->text('callback_url')->nullable();
            $blueprint->text('redirect_url')->nullable();
            $blueprint->timestamp('expired_at')->nullable();
            $blueprint->timestamp('paid_at')->nullable();
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
