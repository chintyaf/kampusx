<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('university_id')->nullable()->constrained(); // Uncomment jika tabel universities sudah ada
            $table->string('name', 100);
            $table->string('email', 150)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');
            $table->enum('role', ['participant', 'organizer', 'admin', 'committee'])->default('participant');
            $table->enum('status', ['active', 'suspended', 'banned'])->default('active');
            $table->boolean('is_verified')->default(false);
            $table->rememberToken();
            $table->timestamps();
            $table->timestamp('email_verified_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
