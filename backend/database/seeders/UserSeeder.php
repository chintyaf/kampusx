<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // ── Admin ──────────────────────────────────────────
            [
                'name'              => 'Admin KampusX',
                'email'             => 'admin@kampusx.com',
                'phone'             => null,
                'password'          => Hash::make('12345678'),
                'role'              => 'admin',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],

            // ── Participant ─────────────────────────────────────
            [
                'name'              => 'Participant KampusX',
                'email'             => 'part@kampusx.com',
                'phone'             => null,
                'password'          => Hash::make('12345678'),
                'role'              => 'participant',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],

            // ── Organizers ─────────────────────────────────────
            [
                'name'              => 'Organizer KampusX',
                'email'             => 'org@kampusx.com',
                'phone'             => '081234567890',
                'password'          => Hash::make('12345678'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Gemilang Nusantara Event',
                'email'             => 'gemilang@kampusx.com',
                'phone'             => '081200000001',
                'password'          => Hash::make('12345678'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Inovasi Digital Hub',
                'email'             => 'inovasihub@kampusx.com',
                'phone'             => '081200000002',
                'password'          => Hash::make('12345678'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Kreasi Muda Indonesia',
                'email'             => 'kreasimuda@kampusx.com',
                'phone'             => '081200000003',
                'password'          => Hash::make('12345678'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Wira Karya Collective',
                'email'             => 'wirakarya@kampusx.com',
                'phone'             => '081200000004',
                'password'          => Hash::make('12345678'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Akselerasi Kampus',
                'email'             => 'akselerasi@kampusx.com',
                'phone'             => '081200000005',
                'password'          => Hash::make('12345678'),
                'role'              => 'organizer',
                'status'            => 'active',
                'is_verified'       => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ]);
    }
}
