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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();


            $table->string('name', 200);
            $table->string('slug', 200)->unique()->index();

            // Membedakan apakah ini kampus, himpunan, atau perusahaan sponsor
            $table->enum('type', ['university', 'company', 'student_org', 'community']);

            $table->text('description')->nullable();
            $table->string('logo_path')->nullable(); // Logo institusi

            $table->timestamps();
        });

        Schema::create('institution_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('institution_id')->constrained('institutions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Asumsi tabel users pakai BigInt bawaan

            // Role di dalam institusi:
            // owner = Kaprodi / Ketua BEM (bisa hapus/invite member)
            // admin / event_creator = Panitia yang diizinkan bikin event pakai nama institusi
            // member = read only access
            $table->enum('role', ['owner', 'admin', 'member'])->default('member');

            $table->unique(['institution_id', 'user_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institution');
        Schema::dropIfExists('institution_user');
    }
};
