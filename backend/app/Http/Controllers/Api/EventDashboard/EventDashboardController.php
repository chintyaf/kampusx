<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use Maatwebsite\Excel\Facades\Excel;

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

        $visitorCount = $event->views ?: 0;
        $conversionRate = $visitorCount > 0 ? round(($ticketsSold / $visitorCount) * 100, 1) : 0;

        $isFreeEvent = !\DB::table('event_tickets')
            ->where('event_id', $eventId)
            ->where('price', '>', 0)
            ->exists();

        $stats = [
            [
                'label' => 'Tickets Sold',
                'value' => $capacity > 0 ? "$ticketsSold / $capacity" : (string)$ticketsSold,
                'sub' => $capacity > 0 ? round(($ticketsSold / $capacity) * 100) . "% kapasitas terisi" : "Kapasitas tidak terbatas",
                'progress' => $capacity > 0 ? min(100, round(($ticketsSold / $capacity) * 100)) : null,
                'iconBg' => '#dff3ff',
                'iconColor' => '#00699e',
                'progressColor' => 'var(--primary)',
            ]
        ];

        if (!$isFreeEvent) {
            $stats[] = [
                'label' => 'Revenue',
                'value' => $revenueText,
                'sub' => $ticketsSold > 0 ? "@ Rp " . number_format($revenue > 0 ? $revenue / $ticketsSold : 0, 0, ',', '.') . " / tiket" : "Belum ada penjualan",
                'iconBg' => '#dcfce7',
                'iconColor' => '#166534',
            ];
        }

        // Determine event status logic for stats
        $calculatedStatus = $event->status;
        $now = now();

        $sessions = \App\Models\EventSession::with(['speakers', 'materials'])
            ->where('event_id', $eventId)
            ->orderBy('day_number', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        if ($calculatedStatus === 'published' && $event->start_date && $event->end_date) {
            $startDate = \Carbon\Carbon::parse($event->start_date);
            $endDate = \Carbon\Carbon::parse($event->end_date);

            if ($now->gt($endDate)) {
                $calculatedStatus = 'completed';
            } elseif ($now->gte($startDate) && $now->lte($endDate)) {
                $calculatedStatus = 'ongoing';

                if ($sessions->isNotEmpty()) {
                    $isAnySessionActive = false;
                    $hasFutureSessions = false;

                    foreach ($sessions as $session) {
                        $sessionDate = $startDate->copy()->addDays($session->day_number - 1);

                        $sessionStart = $sessionDate->copy();
                        if ($session->start_time) {
                            $timeParts = explode(':', $session->start_time);
                            $sessionStart->setTime($timeParts[0], $timeParts[1]);
                        } else {
                            $sessionStart->setTime(0, 0);
                        }

                        $sessionEnd = $sessionDate->copy();
                        if ($session->end_time) {
                            $timeParts = explode(':', $session->end_time);
                            $sessionEnd->setTime($timeParts[0], $timeParts[1]);
                        } else {
                            $sessionEnd->setTime(23, 59, 59);
                        }

                        if ($now->between($sessionStart, $sessionEnd)) {
                            $isAnySessionActive = true;
                        }

                        if ($sessionStart->gt($now)) {
                            $hasFutureSessions = true;
                        }
                    }

                    if (!$isAnySessionActive) {
                        if ($hasFutureSessions) {
                            $calculatedStatus = 'paused';
                        } else {
                            $calculatedStatus = 'completed';
                        }
                    }
                }
            }
        }

        if (in_array($calculatedStatus, ['ongoing', 'paused', 'completed'])) {
            $stats[] = [
                'label' => 'Checked-In',
                'value' => (string)$checkedIn,
                'sub' => $ticketsSold > 0 ? round(($checkedIn / $ticketsSold) * 100) . "% kehadiran" : "Belum ada check-in",
                'iconBg' => '#f3e8ff',
                'iconColor' => '#7c3aed',
            ];

            $stats[] = [
                'label' => 'Absent',
                'value' => (string)$absent,
                'sub' => $ticketsSold > 0 ? round(($absent / $ticketsSold) * 100) . "% tidak hadir" : "0% tidak hadir",
                'iconBg' => '#fee2e2',
                'iconColor' => '#b91c1c',
            ];

            if ($calculatedStatus === 'completed') {
                $surveyCount = 0;
                if (\Illuminate\Support\Facades\Schema::hasTable('survey_responses') && \Illuminate\Support\Facades\Schema::hasTable('surveys')) {
                    $surveyCount = \DB::table('survey_responses')
                        ->join('surveys', 'survey_responses.survey_id', '=', 'surveys.id')
                        ->where('surveys.event_id', $eventId)
                        ->count();
                }

                $stats[] = [
                    'label' => 'Survey Responses',
                    'value' => (string)$surveyCount,
                    'sub' => $checkedIn > 0 ? round(($surveyCount / $checkedIn) * 100) . "% dari peserta hadir" : "Belum ada survey",
                    'iconBg' => '#ecfccb',
                    'iconColor' => '#4d7c0f',
                ];
            }
        } else {
            $stats[] = [
                'label' => 'Page Views',
                'value' => number_format($visitorCount, 0, ',', '.'),
                'sub' => $conversionRate . "% conversion rate",
                'iconBg' => '#f3e8ff',
                'iconColor' => '#7c3aed',
            ];

            // Add Sisa Waktu Registrasi for published/draft
            $daysLeft = $event->end_date ? (int) ceil(now()->floatDiffInDays($event->end_date, false)) : 0;
            $sisaValue = $daysLeft > 0 ? "{$daysLeft} Hari" : "Selesai";
            $sisaSub = $event->end_date ? "Ditutup " . $event->end_date->format('d M Y') : "Belum diatur";

            $stats[] = [
                'label' => 'Sisa Waktu Registrasi',
                'value' => $sisaValue,
                'sub' => $sisaSub,
                'iconBg' => '#fef3c7',
                'iconColor' => '#92400e',
            ];
        }

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
        $calculatedStatus = $event->status;
        $now = now();

        if ($calculatedStatus === 'published' && $event->start_date && $event->end_date) {
            $startDate = \Carbon\Carbon::parse($event->start_date);
            $endDate = \Carbon\Carbon::parse($event->end_date);

            if ($now->gt($endDate)) {
                $calculatedStatus = 'completed';
            } elseif ($now->gte($startDate) && $now->lte($endDate)) {
                $calculatedStatus = 'ongoing';
            }
        }

        $cancelThresholdDays = 1;
        $canCancel = false;
        $cancelMessage = '';

        if (in_array($calculatedStatus, ['published', 'ongoing'])) {
            if ($event->start_date) {
                $thresholdDate = \Carbon\Carbon::parse($event->start_date)->subDays($cancelThresholdDays);
                if ($now->lt($thresholdDate)) {
                    $canCancel = true;
                } else {
                    $cancelMessage = 'Hanya dapat dibatalkan maksimal H-' . $cancelThresholdDays . ' sebelum acara dimulai.';
                }
            } else {
                $canCancel = true; // if no start date, can cancel
            }
        }

        // 5. PART 2 PREPARATION CHECKLIST (Before D-Day)
        $locationType = $event->locationDetail->type ?? 'offline'; // default offline jika belum diisi
        $isOnlineOrHybrid  = in_array($locationType, ['online', 'hybrid']);
        $isOfflineOrHybrid = in_array($locationType, ['offline', 'hybrid']);

        $hasMeetingLink  = $event->locationDetail && !empty($event->locationDetail->meeting_link);
        $hasCheckinLink  = !empty($event->checkin_link);
        $hasCheckoutLink = !empty($event->checkout_link);
        $hasOnlineLinks  = $hasCheckinLink && $hasCheckoutLink; // Keduanya harus ada

        $hasSurvey      = \DB::table('surveys')->where('event_id', $eventId)->exists();
        $hasStations    = \DB::table('event_stations')->where('event_id', $eventId)->exists();
        $hasCertificate = \DB::table('certificate_templates')->where('event_id', $eventId)->exists();
        $hasMaterial    = \DB::table('event_materials')->where('event_id', $eventId)->exists();

        $preparationChecklist = [
            // Item 1: Link Zoom — hanya relevan untuk event online/hybrid
            [
                'id'        => 'zoom',
                'label'     => 'Masukkan Link Zoom / Platform Meeting Online',
                'completed' => $hasMeetingLink,
                'required'  => $isOnlineOrHybrid,
                'link'      => "/organizer/{$eventId}/event-dashboard/detail/tempat",
                'hint'      => 'Diperlukan agar peserta online bisa bergabung ke sesi.'
            ],

            // Item 2: Link Presensi Online — hanya relevan untuk event online/hybrid
            // Selesai jika KEDUA link (check-in & check-out) sudah dibuat
            [
                'id'        => 'online_attendance',
                'label'     => 'Buat Link Presensi Online (Check-in & Check-out)',
                'completed' => $hasOnlineLinks,
                'required'  => $isOnlineOrHybrid,
                'link'      => "/organizer/{$eventId}/event-dashboard/check-in",
                'hint'      => 'Peserta online menggunakan magic link untuk konfirmasi kehadiran mereka.'
            ],

            // Item 3: Scanner/POS Station — hanya relevan untuk event offline/hybrid
            [
                'id'        => 'pos',
                'label'     => 'Atur Stasiun Scanner / Pos Check-in (QR)',
                'completed' => $hasStations,
                'required'  => $isOfflineOrHybrid,
                'link'      => "/organizer/{$eventId}/event-dashboard/check-in",
                'hint'      => 'Panitia akan men-scan QR tiket peserta di lokasi menggunakan pos ini.'
            ],

            // Item 4: Sertifikat
            [
                'id'        => 'certificate',
                'label'     => 'Desain Template & Layout Sertifikat',
                'completed' => $hasCertificate,
                'required'  => true,
                'link'      => "/organizer/{$eventId}/event-dashboard/sertifikat",
                'hint'      => 'Sertifikat akan otomatis dikirim ke peserta yang hadir setelah acara selesai.'
            ],

            // Item 5: Materi (opsional)
            [
                'id'        => 'material',
                'label'     => 'Upload Materi Acara (Opsional)',
                'completed' => $hasMaterial,
                'required'  => true,
                'link'      => "/organizer/{$eventId}/event-dashboard/modul-belajar/materi-after",
                'hint'      => 'Materi sesi dapat diakses peserta setelah acara selesai.'
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => $event->title,
                'startDate' => $event->start_date ? $event->start_date->format('d M Y, H:i') : null,
                'endDate' => $event->end_date ? $event->end_date->format('d M Y, H:i') : null,
                'location' => $locationText,
                'location_type' => $event->locationDetail->type ?? 'offline',
                'organizer' => $event->organizer->name ?? null,
                'institution' => $event->institution->name ?? 'Independen / Umum',
                'categories' => $event->categories->pluck('name'),
                'status' => $calculatedStatus,
                'canCancel' => $canCancel,
                'cancelMessage' => $cancelMessage,
                'pos_pin' => $event->pos_pin,
                'timeline' => $timeline,
                'stats' => $stats,
                'sessions' => $sessionsData,
                'demographics' => $demographics,
                'tickets' => $ticketsData,
                'preparation_checklist' => $preparationChecklist,
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

    public function getRevenueAnalytics($eventId)
    {
        $event = Event::findOrFail($eventId);

        // 1. Total Penjualan & Tiket Terjual
        // Get paid orders and their order_items & tickets
        $paidOrders = \DB::table('orders')
            ->where('event_id', $eventId)
            ->where('status', 'paid')
            ->get();

        $grossSales = $paidOrders->sum('amount');

        // Net Revenue mock logic (usually gross minus fees)
        $netRevenue = $grossSales * 0.97; // Example: 3% platform fee

        // Ticket count from paid orders
        $totalTickets = \DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->where('orders.status', 'paid')
            ->count();

        // 2. Conversion Rate (Ticket Sold / Event Views)
        $visitorCount = $event->views ?: 1; // Avoid division by zero
        $conversionRate = $event->views > 0 ? round(($totalTickets / $visitorCount) * 100, 1) : 0;

        // 3. Refund Rate
        // Get cancelled/refunded tickets
        $refundedTicketsQuery = \DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->where('tickets.status', 'cancelled');

        $refundCount = $refundedTicketsQuery->count();
        $refundAmount = $refundedTicketsQuery->sum('order_items.price'); // Approximation if 1 qty per ticket

        $refundRate = $totalTickets > 0 ? round(($refundCount / $totalTickets) * 100, 1) : 0;

        // 4. Breakdown per tier (EventTicket)
        $tierDataRaw = \DB::table('tickets')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('event_tickets', function($join) use ($eventId) {
                $join->on('order_items.price', '=', 'event_tickets.price')
                     ->where('event_tickets.event_id', '=', $eventId); // Basic join by price as proxy if direct relation is missing
            })
            ->where('orders.event_id', $eventId)
            ->where('orders.status', 'paid')
            ->select('event_tickets.name', \DB::raw('count(tickets.id) as count'))
            ->groupBy('event_tickets.name')
            ->get();

        $colors = ['#0369a1', '#0ea5e9', '#7dd3fc', '#38bdf8', '#bae6fd'];
        $tierData = [];
        foreach ($tierDataRaw as $index => $tier) {
            $tierData[] = [
                'name' => $tier->name,
                'value' => $tier->count,
                'fill' => $colors[$index % count($colors)]
            ];
        }

        // Check if event is free (has no tickets with price > 0)
        $isFreeEvent = !\DB::table('event_tickets')
            ->where('event_id', $eventId)
            ->where('price', '>', 0)
            ->exists();

        // 5. Revenue Trend (30 days)
        $trendRaw = \DB::table('orders')
            ->where('event_id', $eventId)
            ->where('status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                \DB::raw('DATE(created_at) as date'),
                \DB::raw('SUM(amount) as sales'),
                \DB::raw('COUNT(id) as order_count')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $salesTrend30d = $trendRaw->map(function ($item) {
            return [
                'date' => \Carbon\Carbon::parse($item->date)->format('d M'),
                'sales' => $item->sales,
                'tickets' => $item->order_count,
                'refunds' => 0 // Can be aggregated from cancelled tickets similarly if needed
            ];
        });

        // 6. Recent Transactions (Ticket Orders)
        $transactionsRaw = \DB::table('tickets')
            ->join('users', 'tickets.participant_id', '=', 'users.id')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $eventId)
            ->select(
                'tickets.ticket_code as code',
                'users.name',
                'users.email',
                'order_items.price as total',
                'orders.status as order_status',
                'tickets.status as ticket_status',
                'tickets.created_at as date'
            )
            ->orderBy('tickets.created_at', 'desc')
            ->limit(10)
            ->get();

        $transactions = $transactionsRaw->map(function ($tx) {
            return [
                'code' => $tx->code,
                'name' => $tx->name,
                'email' => $tx->email,
                'tier' => 'Ticket', // Should join with event_tickets properly if available
                'qty' => 1,
                'total' => $tx->total,
                'status' => $tx->ticket_status === 'cancelled' ? 'Refunded' : ($tx->order_status === 'paid' ? 'Paid' : 'Pending'),
                'date' => \Carbon\Carbon::parse($tx->date)->format('Y-m-d')
            ];
        });

        // Funnel Data (Mocked based on visitorCount for now, but dynamic based on real values)
        $funnelData = [
            ['name' => 'Kunjungan Detail', 'value' => $event->views ?: 0, 'percentage' => 100, 'fill' => 'var(--bahama-blue-800)'],
            ['name' => 'Tambah ke Cart', 'value' => round(($event->views ?: 0) * 0.36), 'percentage' => 36.3, 'fill' => 'var(--bahama-blue-600)'],
            ['name' => 'Mulai Pengisian', 'value' => round(($event->views ?: 0) * 0.16), 'percentage' => 16.8, 'fill' => 'var(--bahama-blue-400)'],
            ['name' => 'Konfirmasi Bayar', 'value' => $totalTickets, 'percentage' => $conversionRate, 'fill' => '#10b981'],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'isFreeEvent' => $isFreeEvent,
                'grossSales' => $grossSales,
                'netRevenue' => $netRevenue,
                'totalTickets' => $totalTickets,
                'refundCount' => $refundCount,
                'refundAmount' => $refundAmount,
                'visitorCount' => $event->views,
                'conversionRate' => $conversionRate,
                'refundRate' => $refundRate,
                'transactions' => $transactions,
                'salesTrend30d' => $salesTrend30d,
                'tierData' => $tierData,
                'funnelData' => $funnelData
            ]
        ]);
    }

    public function getVenueQr(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $type = $request->query('type', 'in'); // 'in' or 'out'
        if (!in_array($type, ['in', 'out'])) {
            $type = 'in';
        }

        $expiresAt = $request->query('expires_at');

        $secretKey = config('app.key');
        $stringToSign = "venue_{$type}_{$eventId}";
        if ($expiresAt) {
            $stringToSign .= "_{$expiresAt}";
        }
        $signature = hash_hmac('sha256', $stringToSign, $secretKey);

        return response()->json([
            'success' => true,
            'data' => [
                'event_id' => $eventId,
                'type' => $type,
                'expires_at' => $expiresAt,
                'signature' => $signature,
                'qr_string' => "venue_{$type}_{$eventId}" . ($expiresAt ? "_{$expiresAt}" : "") . ".{$signature}"
            ]
        ], 200);
    }

    public function exportReport($eventId)
    {
        $event = Event::findOrFail($eventId);

        // Fetch dynamic survey questions if exist
        $survey = \DB::table('surveys')->where('event_id', $eventId)->first();
        $questions = [];
        if ($survey) {
            $questions = \DB::table('survey_questions')
                ->where('survey_id', $survey->id)
                ->orderBy('sort_order', 'asc')
                ->get();
        }

        // Headers
        $headers = [
            'ID Tiket',
            'Nama Peserta',
            'Email',
            'Institusi',
            'Jenis Tiket',
            'Waktu Check-in',
            'Waktu Check-out',
            'Metode Presensi',
            'Rating Acara',
            'Rating Pembicara',
            'Rating Materi',
            'Komentar Survey'
        ];

        // Add dynamic question labels to headers
        foreach ($questions as $q) {
            $headers[] = $q->label;
        }

        // Fetch Data
        $tickets = \App\Models\Ticket::with([
                'participant.university',
                'orderItem.order'
            ])
            ->whereHas('orderItem.order', function($q) use ($eventId) {
                $q->where('event_id', $eventId)->where('status', 'paid');
            })
            ->get();

        // Fetch Attendance Logs grouped by ticket_id
        $attendanceLogs = \DB::table('attendance_logs')
            ->where('event_id', $eventId)
            ->get()
            ->keyBy('ticket_id');

        // Fetch Survey Responses grouped by user_id
        $surveyResponses = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('survey_responses')) {
            $responses = \DB::table('survey_responses')
                ->where('event_id', $eventId)
                ->get();

            $responseIds = $responses->pluck('id')->toArray();

            $answers = collect();
            if (count($responseIds) > 0 && \Illuminate\Support\Facades\Schema::hasTable('survey_answers')) {
                $answers = \DB::table('survey_answers')
                    ->whereIn('response_id', $responseIds)
                    ->get()
                    ->groupBy('response_id');
            }

            foreach ($responses as $resp) {
                $resp->answers = $answers->get($resp->id, collect())->keyBy('question_id');
            }
        }

        $filename = "laporan_kehadiran_event_{$eventId}.xlsx";
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\EventParticipantExport($tickets, $attendanceLogs, $surveyResponses, $questions, $headers), $filename);
    }
}
