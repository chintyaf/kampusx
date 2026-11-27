<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/skills_seed.csv');

        if (!File::exists($path)) {
            throw new \RuntimeException('Skills CSV file not found.');
        }

        $file = fopen($path, 'r');

        // Read CSV header
        $header = fgetcsv($file);

        $now = Carbon::now();

        while (($row = fgetcsv($file)) !== false) {

            if (count($row) !== count($header)) {
                continue;
            }

            $data = array_combine($header, $row);

            DB::table('skills')->updateOrInsert(
                ['name' => trim($data['name'])],
                [
                    'description' => $data['description'] ?: null,
                    'category' => $data['category'] ?: null,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        fclose($file);
    }
}
