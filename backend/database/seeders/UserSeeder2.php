<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Str;

class UserSeeder2 extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // 4 User Sebelumnya
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi99@gmail.com',
                'phone' => '081234567890',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(10),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'siti.aminah@gmail.com',
                'phone' => '085712345678',
                'password' => Hash::make('12345678'),
                'role' => 'participant',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(5),
                'updated_at' => now(),
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso21@yahoo.com',
                'phone' => '081987654321',
                'password' => Hash::make('12345678'),
                'role' => 'organizer',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(7),
                'updated_at' => now(),
            ],
            [
                'name' => 'Diana Lestari',
                'email' => 'diana.lestari@outlook.com',
                'phone' => '082123456789',
                'password' => Hash::make('12345678'),
                'role' => 'participant',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(2),
                'updated_at' => now(),
            ],

            // Tambahan 5 User Baru
            [
                'name' => 'Rizky Ramadhan',
                'email' => 'rizky.ramadhan95@gmail.com',
                'phone' => '081398765432',
                'password' => Hash::make('12345678'),
                'role' => 'participant',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(4),
                'updated_at' => now(),
            ],
            [
                'name' => 'Citra Kirana',
                'email' => 'citra.kirana@yahoo.com',
                'phone' => '087812345678',
                'password' => Hash::make('12345678'),
                'role' => 'organizer',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(6),
                'updated_at' => now(),
            ],
            [
                'name' => 'Aditya Wijaya',
                'email' => 'aditya.wijaya@gmail.com',
                'phone' => '085211223344',
                'password' => Hash::make('12345678'),
                'role' => 'participant',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subHours(12), // Baru mendaftar 12 jam yang lalu
                'updated_at' => now(),
            ],
            [
                'name' => 'Eka Putri',
                'email' => 'eka.putri22@gmail.com',
                'phone' => '089677889900',
                'password' => Hash::make('12345678'),
                'role' => 'participant',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(1),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hendra Gunawan',
                'email' => 'hendra.gunawan@outlook.com',
                'phone' => '081122334455',
                'password' => Hash::make('12345678'),
                'role' => 'organizer',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(3),
                'updated_at' => now(),
            ],
        ]);
    }
}
