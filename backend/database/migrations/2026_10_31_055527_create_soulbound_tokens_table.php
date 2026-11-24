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
        Schema::create('soulbound_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('credential_submission_id')->nullable();
            $table->string('ticket_code')->unique();
            $table->string('token_id')->index();
            $table->string('title');
            $table->string('issuer')->default('KampusX Verified Authority & GDSC Indonesia');
            $table->string('tx_hash')->index();
            $table->string('contract_address')->default('0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5');
            $table->string('wallet_address')->nullable();
            $table->string('block_number')->default('51351780');
            $table->string('standard')->default('ERC-5192 (Soulbound / Non-Transferable)');
            $table->integer('cognitive_score')->default(98);
            $table->string('skill_category')->default('Python & Machine Learning');
            $table->text('token_uri')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('minted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soulbound_tokens');
    }
};
