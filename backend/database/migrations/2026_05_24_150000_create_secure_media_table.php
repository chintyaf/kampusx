<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('secure_media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->string('storage_type'); // 'blob' or 'local'
            $table->string('file_path')->nullable(); // Path on private disk
            $table->timestamps();
        });

        // Use raw SQL to add LONGBLOB in MySQL for blob storage type
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE secure_media ADD content LONGBLOB NULL AFTER file_path");
        } else {
            Schema::table('secure_media', function (Blueprint $table) {
                $table->binary('content')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secure_media');
    }
};
