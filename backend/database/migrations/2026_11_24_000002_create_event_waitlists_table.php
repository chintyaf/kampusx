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
        Schema::create('event_waitlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('event_ticket_id')->nullable()->constrained('event_tickets')->nullOnDelete();
            $table->string('seat_number', 10)->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('queue_number');
            $table->enum('status', ['WAITING', 'OFFERED', 'CLAIMED', 'EXPIRED', 'CANCELLED'])->default('WAITING');
            $table->timestamp('offered_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('offer_token', 64)->nullable()->unique();
            $table->string('lock_token', 64)->nullable();
            $table->unsignedInteger('estimated_wait_seconds')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();

            // Indexes for fast FIFO queue lookup & expiration scanner
            $table->index(['event_id', 'status', 'queue_number'], 'idx_waitlist_fifo');
            $table->index(['user_id', 'event_id', 'status'], 'idx_waitlist_user_active');
            $table->index(['expires_at', 'status'], 'idx_waitlist_expiry');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_waitlists');
    }
};
