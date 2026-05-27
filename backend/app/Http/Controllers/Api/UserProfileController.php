<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use Carbon\Carbon;

class UserProfileController extends Controller
{
    /**
     * Menampilkan profil publik dari seorang user.
     * Dapat diakses tanpa login.
     */
    public function show($id)
    {
        // 1. Ambil data user dasar
        $user = User::with('categories')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // 2. Data Avatar (Inisial dari UI Avatars jika tidak ada foto)
        $avatarUrl = 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&background=random&color=fff&size=150';
        
        // Mock data institusi (karena belum dilink ke User untuk Profil Publik)
        $institutionName = 'KampusX Member'; 
        
        // 3. Ambil data ketertarikan (Interests) dari relasi categories
        $interests = $user->categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name
            ];
        });

        // 4. Ambil Histori Event yang diikuti user
        // Kita cari dari tabel Orders dimana user_id = $id, lalu ambil relasi event-nya
        // Pastikan hanya order yang sudah dibayar jika Anda menerapkan sistem pembayaran, 
        // tapi untuk sementara kita ambil semua.
        $orders = Order::where('user_id', $id)
            ->with(['event' => function($query) {
                // Ambil field penting saja agar efisien
                $query->select('id', 'title', 'start_date', 'end_date', 'image_path', 'status');
            }])
            ->get();

        $upcomingEvents = [];
        $pastEvents = [];

        $now = Carbon::now();

        foreach ($orders as $order) {
            if ($order->event) {
                $event = $order->event;
                // Parse tanggal event
                $eventStartDate = Carbon::parse($event->start_date);
                $eventEndDate = Carbon::parse($event->end_date);

                // Tentukan status event (Mendatang atau Selesai)
                // Jika event_end_date sudah lewat dari sekarang, berarti selesai
                if ($eventEndDate->isPast()) {
                    $pastEvents[] = $event;
                } else {
                    $upcomingEvents[] = $event;
                }
            }
        }

        // 4. Return data JSON
        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $avatarUrl,
                    'institution' => $institutionName,
                    'joined_at' => $user->created_at->format('F Y'),
                ],
                'interests' => $interests,
                'history' => [
                    'upcoming' => $upcomingEvents,
                    'past' => $pastEvents
                ]
            ]
        ], 200);
    }
}
