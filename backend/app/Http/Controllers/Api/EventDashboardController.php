<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class EventDashboardController extends Controller
{
    public function getGeneralInfo($eventId)
    {
        $event = Event::select('id', 'title', 'slug', 'description')
            ->with(['categories' => function($query) {
                $query->select('categories.id', 'categories.name');
            }])
            ->where('id', $eventId)
            ->firstOrFail();

        // 3. Gunakan helper url() atau config('app.url') agar lebih dinamis dibanding hardcode domain
        return response()->json([
            'status' => 'success',
            'message' => 'Detail event berhasil diambil',
            'data' => [
                'title'    => $event->title,
                'slug'     => $event->slug,
                'description'      => $event->description,
                'selectedKategori'  => $event->categories->map(function($cat) {
                    return [
                        'id'   => $cat->id,
                        'nama' => $cat->name
                    ];
                }),
                'full_url'       => url("/events/{$event->slug}")
            ]
        ]);
    }

    public function updateGeneralInfo(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:events,slug,' . $eventId,
            'description' => 'nullable|string',
            'categories'  => 'nullable|array',
            'categories.*'=> 'exists:categories,id'
        ]);

        try {
            return \DB::transaction(function () use ($event, $validated) {

                $event->update([
                    'title'       => $validated['title'],
                    'slug'        => $validated['slug'] ?? $event->slug,
                    'description' => $validated['description'] ?? null,
                ]);

                // 4. Update Relasi Kategori
                // Jika categories tidak dikirim atau null, kosongkan relasi (sync array kosong)
                $categoryIds = $validated['categories'] ?? [];
                $event->categories()->sync($categoryIds);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Informasi event berhasil diperbarui',
                ]);
            });

        } catch (\Exception $e) {
            \Log::error("Update Event Error ID {$eventId}: " . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);
        }
    }

    public function getOverview($eventId)
    {
        $event = Event::with(['categories', 'institution', 'locationDetail', 'organizer'])->findOrFail($eventId);

        $locationText = 'Belum diatur';
        if ($event->locationDetail) {
            if ($event->locationDetail->type === 'online') {
                $locationText = "Online (" . ($event->locationDetail->platform ?? 'Platform tidak diketahui') . ")";
            } else {
                $locationText = $event->locationDetail->location_name ?? 'Lokasi Offline';
            }
        }

        $now = now();
        $isPublished = in_array($event->status, ['published', 'ongoing', 'archived', 'completed']);
        
        $timeline = [
            [
                'label' => 'Draft',
                'date' => $event->created_at ? $event->created_at->format('d M Y') : 'Baru dibuat',
                'status' => 'done'
            ],
            [
                'label' => 'Published',
                'date' => $isPublished ? 'Sudah Live' : 'Menunggu',
                'status' => $isPublished ? 'done' : 'pending'
            ]
        ];

        $isRegActive = $isPublished && $event->start_date && $now->lt($event->start_date);
        $timeline[] = [
            'label' => 'Registrasi',
            'date' => $isPublished && $event->start_date ? 'Dibuka' : 'Terkunci',
            'status' => $isRegActive ? 'active' : ($isPublished && $event->start_date && $now->gt($event->start_date) ? 'done' : 'pending')
        ];

        $isStarted = $event->start_date && $now->gte($event->start_date);
        $timeline[] = [
            'label' => 'Hari Acara',
            'date' => $event->start_date ? $event->start_date->format('d M Y') : 'Belum diatur',
            'status' => $isStarted ? ($event->end_date && $now->gt($event->end_date) ? 'done' : 'active') : 'pending'
        ];

        $isEnded = $event->end_date && $now->gt($event->end_date);
        $timeline[] = [
            'label' => 'Selesai',
            'date' => $event->end_date ? $event->end_date->format('d M Y') : 'Belum diatur',
            'status' => $isEnded ? 'done' : 'pending'
        ];

        // 1. STATS: Tickets Sold, Revenue, Checked-In, Absent
        $ticketsSold = \DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->count();

        $capacity = \DB::table('event_tickets')
            ->where('event_id', $eventId)
            ->sum('capacity') ?: 0;

        $revenue = \DB::table('orders')
            ->where('event_id', $eventId)
            ->whereNotNull('paid_at')
            ->sum('total_price') ?: 0;

        if ($revenue >= 1000000) {
            $revenueText = 'Rp ' . number_format($revenue / 1000000, 1, ',', '.') . 'jt';
        } else {
            $revenueText = 'Rp ' . number_format($revenue, 0, ',', '.');
        }

        $checkedIn = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('attendance_logs')) {
            $checkedIn = \DB::table('attendance_logs')
                ->where('event_id', $eventId)
                ->count();
        }

        $absent = max(0, $ticketsSold - $checkedIn);

        $stats = [
            [
                'label' => 'Tickets Sold',
                'value' => $capacity > 0 ? "$ticketsSold / $capacity" : (string)$ticketsSold,
                'sub' => $capacity > 0 ? round(($ticketsSold / $capacity) * 100) . "% kapasitas terisi" : "Kapasitas tidak terbatas",
                'progress' => $capacity > 0 ? min(100, round(($ticketsSold / $capacity) * 100)) : null,
                'iconBg' => '#dff3ff',
                'iconColor' => '#00699e',
                'progressColor' => 'var(--primary)',
            ],
            [
                'label' => 'Revenue',
                'value' => $revenueText,
                'sub' => $ticketsSold > 0 ? "@ Rp " . number_format($revenue / $ticketsSold, 0, ',', '.') . " / tiket" : "Belum ada penjualan",
                'iconBg' => '#dcfce7',
                'iconColor' => '#166534',
            ],
            [
                'label' => 'Checked-In',
                'value' => (string)$checkedIn,
                'sub' => $ticketsSold > 0 ? round(($checkedIn / $ticketsSold) * 100) . "% kehadiran" : "Belum dimulai",
                'iconBg' => '#f3e8ff',
                'iconColor' => '#7c3aed',
            ],
            [
                'label' => 'Absent',
                'value' => (string)$absent,
                'sub' => $ticketsSold > 0 ? round(($absent / $ticketsSold) * 100) . "% dari pendaftar" : "0% dari pendaftar",
                'iconBg' => '#fef3c7',
                'iconColor' => '#92400e',
            ]
        ];

        // 2. SESSIONS: Format dynamic list
        $sessions = \App\Models\EventSession::with(['speakers', 'materials'])
            ->where('event_id', $eventId)
            ->orderBy('day_number', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        $sessionsData = $sessions->map(function ($s) {
            $prereqs = [];
            if (!empty($s->prerequisite_session_ids)) {
                $prereqs = \App\Models\EventSession::whereIn('id', $s->prerequisite_session_ids)->pluck('title')->toArray();
            }

            return [
                'title' => $s->title,
                'day' => $s->day_number,
                'time' => $s->start_time && $s->end_time 
                    ? substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5) 
                    : 'Belum diatur',
                'speaker' => $s->speakers->pluck('name')->implode(', ') ?: null,
                'materialStatus' => $s->materials->count() > 0 ? 'uploaded' : 'pending',
                'prerequisite' => implode(', ', $prereqs) ?: null,
            ];
        });

        // 3. DEMOGRAPHICS: Academic Origin / University
        $demographicsQuery = \DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('users', 'tickets.participant_id', '=', 'users.id')
            ->leftJoin('institutions', 'users.university_id', '=', 'institutions.id')
            ->where('orders.event_id', $eventId)
            ->select('institutions.name as label', \DB::raw('count(tickets.id) as count'))
            ->groupBy('institutions.id', 'institutions.name')
            ->get();

        $totalPeserta = $demographicsQuery->sum('count');
        $uniqueInstitutions = $demographicsQuery->pluck('label')->filter()->unique()->count();

        $palette = ['#00699e', '#3c84a8', '#7bd6fe', '#b9e7fe', '#dff3ff'];
        $idx = 0;

        $demographicsData = $demographicsQuery->map(function ($item) use ($totalPeserta, $palette, &$idx) {
            $pct = $totalPeserta > 0 ? round(($item->count / $totalPeserta) * 100) : 0;
            $color = $palette[$idx % count($palette)];
            $idx++;
            return [
                'label' => $item->label ?? 'Umum / Independen',
                'pct' => $pct,
                'color' => $color,
            ];
        })->sortByDesc('pct')->values()->take(5)->toArray();

        if (empty($demographicsData)) {
            $demographicsData = [
                ['label' => 'Umum / Independen', 'pct' => 0, 'color' => '#00699e']
            ];
        }

        $demographics = [
            'data' => $demographicsData,
            'totals' => [
                ['label' => 'Total Peserta', 'value' => $totalPeserta],
                ['label' => 'Institusi Asal', 'value' => $uniqueInstitutions ?: 0],
            ]
        ];

        // 4. TICKETS: Class distribution
        $eventTickets = \DB::table('event_tickets')
            ->where('event_id', $eventId)
            ->get();

        $ticketsData = [];
        $colors = ['#3c84a8', '#22c55e', '#f59e0b', '#7c3aed', '#ec4899'];
        $idx = 0;

        foreach ($eventTickets as $et) {
            $count = \DB::table('tickets')
                ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.event_id', $eventId)
                ->where('order_items.price', $et->price)
                ->count();

            $ticketsData[] = [
                'label' => $et->name,
                'count' => $count,
                'color' => $colors[$idx % count($colors)],
            ];
            $idx++;
        }

        if (empty($ticketsData)) {
            $generalCount = \DB::table('tickets')
                ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.event_id', $eventId)
                ->count();
            
            $ticketsData = [
                [
                    'label' => 'Tiket Reguler',
                    'count' => $generalCount,
                    'color' => '#3c84a8'
                ]
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => $event->title,
                'startDate' => $event->start_date ? $event->start_date->format('d M Y, H:i') : null,
                'endDate' => $event->end_date ? $event->end_date->format('d M Y, H:i') : null,
                'location' => $locationText,
                'organizer' => $event->organizer->name ?? null,
                'institution' => $event->institution->name ?? 'Independen / Umum',
                'categories' => $event->categories->pluck('name'),
                'status' => $event->status,
                'timeline' => $timeline,
                'stats' => $stats,
                'sessions' => $sessionsData,
                'demographics' => $demographics,
                'tickets' => $ticketsData,
            ]
        ]);
    }

    public function getStatus($eventId)
    {
        // Cari event, jika tidak ada langsung 404
        $event = Event::select('id', 'status')->findOrFail($eventId);

        return response()->json([
            'status' => $event->status
        ], 200);
    }

    public function updateStatus(Request $request, $eventId)
    {
        // 1. Validasi input agar hanya menerima status yang diizinkan
        $request->validate([
            'status' => 'required|string|in:draft,published,archived'
        ]);

        // 2. Cari event atau return 404 jika tidak ketemu
        $event = Event::findOrFail($eventId);

        // 3. Update HANYA kolom status
        $event->update([
            'status' => $request->status
        ]);

        // 4. Return response (biasanya sukses 200)
        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $event
        ], 200);
    }

}
