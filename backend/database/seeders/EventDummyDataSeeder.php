<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventDummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil ID yang tersedia pertama, atau fall-back ke 1
        $userId = DB::table('users')->value('id') ?? 1;
        $eventId = DB::table('events')->value('id') ?? 1;
        $ticketId = DB::table('tickets')->value('id') ?? 1;

        // 1. Seed Event Staff
        DB::table('event_staff')->updateOrInsert(
            ['user_id' => $userId, 'event_id' => $eventId],
            ['created_at' => now(), 'updated_at' => now()]
        );

        // 2. Seed Attendance Logs
        DB::table('attendance_logs')->insert([
            'ticket_id' => $ticketId,
            'event_id' => $eventId,
            'session_id' => null,
            'scan_time' => now(),
            'scanned_by' => $userId,
            'method' => 'qr',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
