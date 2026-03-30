<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Seminar',
            'Workshop',
            'Course',
            'Webinar',
            'Training',
            'Bootcamp',
            'Talkshow',
            'Conference',
            'Competition',
            'Networking Event',
            'Panel Discussion',
        ];

        foreach ($types as $type) {
            DB::table('event_types')->insert([
                'name' => $type
            ]);
        }
    }
}
