<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Sains Hewan',
            'Bisnis & Ekonomi',
            'Pendidikan',
            'Teknik & Tech',
            'Hukum',
            'Kesehatan',
            'Matematika',
            'Sains Fisik',
            'Studi Regional',
            'Ilmu Sosial',
            'Seni & Desain',
            'Musik & Hiburan',
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category
            ]);
        }
    }
}
