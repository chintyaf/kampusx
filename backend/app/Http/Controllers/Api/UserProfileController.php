<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\SurveyResponse;
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
        // Pastikan hanya order yang sudah dibayar (status = paid)
        $orders = Order::where('user_id', $id)
            ->where('status', 'paid')
            ->with(['event.organizer', 'event.institution'])
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

        // 4. Hitung points & level dinamis
        $points = $user->points ?? 0;
        $level = floor($points / 500) + 1;

        // 5. Cek kepemilikan profil (is_own_profile)
        $isOwnProfile = false;
        $authUser = auth('sanctum')->user();
        if ($authUser && $authUser->id === $user->id) {
            $isOwnProfile = true;
        }

        // 6. Bangun list sertifikat dinamis dari tiket yang sudah di-klaim/di-unlock (lewat pengisian survei)
        $tickets = Ticket::with(['orderItem.order.event.institution', 'orderItem.order.event.organizer', 'orderItem.order.event.certificateTemplate'])
            ->where('participant_id', $id)
            ->where(function($query) {
                $query->where('status', 'used')
                      ->orWhere(function($q) {
                          $q->where('status', 'active')
                            ->whereHas('orderItem.order.event', function($evQuery) {
                                $evQuery->whereIn('status', ['published', 'ongoing', 'post_event', 'completed']);
                            });
                      });
            })
            ->get();

        $certificates = [];
        foreach ($tickets as $ticket) {
            $event = $ticket->orderItem->order->event ?? null;
            if (!$event) continue;

            // User mendapatkan sertifikat jika sudah mengisi kuesioner/survei event tersebut
            $isUnlocked = SurveyResponse::where('user_id', $id)
                ->where('event_id', $event->id)
                ->exists();

            if ($isUnlocked) {
                $template = $event->certificateTemplate;
                $imageUrl = 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // fallback
                
                if ($template && $template->background_path) {
                    $imageUrl = url("/api/certificate/background/{$event->id}");
                } elseif ($event->image_path) {
                    $imageUrl = asset('storage/' . $event->image_path);
                }

                $certificates[] = [
                    'id' => 'CERT-' . $ticket->ticket_code,
                    'eventName' => $event->title,
                    'date' => $event->start_date ? Carbon::parse($event->start_date)->format('d M Y') : '',
                    'organizer' => $event->institution->name ?? ($event->organizer->name ?? 'KampusX Organizer'),
                    'status' => 'unlocked',
                    'image' => $imageUrl,
                    'validation_url' => '/certificate/verify/' . $ticket->ticket_code
                ];
            }
        }

        // 7. Return data JSON
        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $avatarUrl,
                    'institution' => $institutionName,
                    'joined_at' => $user->created_at->format('F Y'),
                    'points' => $points,
                    'level' => $level,
                    'total_events' => count($orders),
                ],
                'interests' => $interests,
                'certificates' => $certificates,
                'history' => [
                    'upcoming' => $upcomingEvents,
                    'past' => $pastEvents
                ],
                'is_own_profile' => $isOwnProfile
            ]
        ], 200);
    }
}
