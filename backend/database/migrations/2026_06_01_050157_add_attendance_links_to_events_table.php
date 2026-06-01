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
        Schema::table('events', function (Blueprint $table) {
            // Menggunakan text() untuk link karena URL lengkap bisa cukup panjang
            // Menggunakan dateTime() atau timestamp() untuk waktu kedaluwarsa
            $table->text('checkin_link')->nullable()->after('description');
            $table->dateTime('checkin_expires_at')->nullable()->after('checkin_link');

            $table->text('checkout_link')->nullable()->after('checkin_expires_at');
            $table->dateTime('checkout_expires_at')->nullable()->after('checkout_link');

            // Catatan: Kamu bisa mengubah parameter ->after('description')
            // agar sesuai dengan letak kolom terakhir di tabel events milikmu.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Menghapus kolom jika dilakukan rollback
            $table->dropColumn([
                'checkin_link',
                'checkin_expires_at',
                'checkout_link',
                'checkout_expires_at'
            ]);
        });
    }
};
