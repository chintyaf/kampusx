<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
use App\Models\Event;

class EventDashboardController extends Controller
{
    public function getGeneralInfo($slug)
    {
        // 1. Gunakan where() karena kita mencari berdasarkan kolom 'slug', bukan primary key 'id'
        // 2. Gunakan firstOrFail() agar otomatis return 404 jika slug tidak ditemukan
        $event = Event::select('id', 'title', 'slug', 'description')
            ->with(['categories' => function($query) {
                // Memilih kolom spesifik di relasi untuk efisiensi memori
                $query->select('categories.id', 'categories.name');
            }])
            ->where('slug', $slug)
            ->firstOrFail();

        // 3. Gunakan helper url() atau config('app.url') agar lebih dinamis dibanding hardcode domain
        return response()->json([
            'status' => 'success',
            'message' => 'Detail event berhasil diambil',
            'data' => [
                'judul_event'    => $event->title,
                'slug_event'     => $event->slug,
                'deskripsi'      => $event->description,
                'tags_kategori'  => $event->categories->map(function($cat) {
                    return [
                        'id'   => $cat->id,
                        'nama' => $cat->name
                    ];
                }),
                'full_url'       => url("/events/{$event->slug}")
            ]
        ]);
    }
}
