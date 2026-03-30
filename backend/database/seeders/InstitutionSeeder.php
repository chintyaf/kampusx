<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InstitutionSeeder extends Seeder
{
    public function run(): void
    {
        $institutions = [
            [
                'name' => 'Universitas Indonesia',
                'type' => 'university',
                'description' => 'Salah satu universitas riset terkemuka di Indonesia.',
            ],
            [
                'name' => 'Institut Teknologi Bandung',
                'type' => 'university',
                'description' => 'Universitas teknologi dan sains terkemuka di Indonesia.',
            ],
            [
                'name' => 'Gojek Indonesia',
                'type' => 'company',
                'description' => 'Perusahaan teknologi yang bergerak di bidang transportasi dan layanan digital.',
            ],
            [
                'name' => 'Tokopedia',
                'type' => 'company',
                'description' => 'Perusahaan e-commerce besar di Indonesia.',
            ],
            [
                'name' => 'Himpunan Mahasiswa Informatika',
                'type' => 'student_org',
                'description' => 'Organisasi mahasiswa yang fokus pada pengembangan bidang informatika.',
            ],
            [
                'name' => 'BEM Fakultas Teknik',
                'type' => 'student_org',
                'description' => 'Badan eksekutif mahasiswa yang menaungi kegiatan mahasiswa teknik.',
            ],
            [
                'name' => 'Jakarta AI Community',
                'type' => 'community',
                'description' => 'Komunitas yang fokus pada pembelajaran dan diskusi AI.',
            ],
            [
                'name' => 'Startup Indonesia Network',
                'type' => 'community',
                'description' => 'Komunitas startup dan entrepreneur teknologi.',
            ],
        ];

        foreach ($institutions as $inst) {
            DB::table('institutions')->insert([
                'name' => $inst['name'],
                'slug' => Str::slug($inst['name']),
                'type' => $inst['type'],
                'description' => $inst['description'],
                'logo_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
