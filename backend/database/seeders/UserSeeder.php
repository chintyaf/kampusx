<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Admin KampusX',
                'email' => 'admin@kampusx.com',
                'phone' => null,
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Participant KampusX',
                'email' => 'part@kampusx.com',
                'phone' => null,
                'password' => Hash::make('12345678'),
                'role' => 'participant',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Organizer KampusX',
                'email' => 'org@kampusx.com',
                'phone' => null,
                'password' => Hash::make('12345678'),
                'role' => 'organizer',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
