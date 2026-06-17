<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EventStatusController extends Controller
{
    private $allowedTransitions = [
        'draft'     => ['published'],
        'published' => ['draft', 'ongoing', 'completed', 'cancelled', 'archived'],
        'ongoing'   => ['paused', 'completed', 'cancelled'],
        'paused'    => ['ongoing', 'completed'],
        'completed' => ['post_event', 'archived'],
        'post_event'=> ['archived'],
        'cancelled' => [],
        'archived'  => [],
    ];

    private function validateTransition(Event $event, string $targetStatus)
    {
        $currentStatus = $event->status;
        $allowed = $this->allowedTransitions[$currentStatus] ?? [];
        
        if (!in_array($targetStatus, $allowed)) {
            return false;
        }
        return true;
    }

    public function index(Event $event)
    {
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

        return response()->json([
            'status' => 'success',
            'message' => 'Status event berhasil diambil',
            'data' => [
                'status' => $calculatedStatus,
            ]
        ], 200);
    }

    public function update(Request $request, Event $event)
    {
        // Cek apakah status yang dikirim memang 'draft'
        if ($request->status === 'draft') {
            if (!$this->validateTransition($event, 'draft')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Transisi status tidak valid.',
                ], 400);
            }

            $event->update([
                'status' => 'draft'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil diubah menjadi draft!',
            ], 200);
        }

        // Tangani kondisi jika status bukan draft atau tidak ada perubahan
        return response()->json([
            'status' => 'error',
            'message' => 'Tidak ada perubahan yang dilakukan.',
        ], 400);
    }
    /**
     * Melihat status kelayakan event untuk dipublish (apa saja yang kurang)
     */
    public function getMissingData(Event $event)
    {
        // Ambil daftar error dari model
        $missingData = $event->getPublishErrors();
        $isReady = count($missingData) === 0;

        return response()->json([
            'status' => 'success',
            'message' => $isReady ? 'Event sudah lengkap dan siap dipublish!' : 'Masih ada data yang perlu dilengkapi.',
            'data' => [
                'event_id'            => $event->id,
                'event_title'          => $event->title,
                'status_saat_ini'     => $event->status,
                'is_ready_to_publish' => $isReady,
                'total_missing'       => count($missingData),
                'missing_data'        => $missingData, // Array berisi daftar yang belum diisi
            ]
        ], 200);
    }

    /**
     * Action ketika user menekan tombol "Publish"
     */
    public function updatePublish(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'published')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transisi status tidak valid.',
            ], 400);
        }

        // ... (Kode publish yang sudah kita buat sebelumnya tetap sama) ...
        $errors = $event->getPublishErrors();

        $request->validate([
        'slug' => [
            'nullable',
            'string',
            Rule::unique('events', 'slug')->ignore($event->id), // Pastikan unik kecuali untuk event ini sendiri
            ],
        ]);

        // 2. Cek kelengkapan data (Logika kamu yang sudah ada)
        $errors = $event->getPublishErrors();
        if (count($errors) > 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tidak dapat mem-publish event karena data belum lengkap.',
                'errors'  => $errors
            ], 422);
        }

        // 3. Tentukan Slug
        // Jika user isi input 'slug', gunakan itu. Jika tidak, buat dari judul.
        $finalSlug = $request->slug
            ? Str::slug($request->slug)
            : Str::slug($event->title);

        // 4. Update Status dan Slug sekaligus
        $event->update([
            'status' => 'published',
            'slug'   => $finalSlug,
            'published_at' => now() // Opsional: untuk track kapan mulai live
        ]);

        // Notify users who favorited the event categories (event recommendation)
        $categoryIds = $event->categories()->pluck('categories.id')->toArray();
        if (!empty($categoryIds)) {
            $usersToNotify = \App\Models\User::whereHas('categories', function($q) use ($categoryIds) {
                $q->whereIn('categories.id', $categoryIds);
            })->where('id', '!=', $event->organizer_id)->get();

            foreach ($usersToNotify as $userToNotify) {
                $userToNotify->notify(new \App\Notifications\OperationalNotification(
                    "Rekomendasi Event Baru!",
                    "Event baru '{$event->title}' telah dipublikasikan dan cocok dengan minat kategori Anda.",
                    "event_recommendation",
                    [
                        'event_id' => $event->id,
                        'event_slug' => $event->slug
                    ]
                ));
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Event berhasil dipublish!',
        ], 200);
    }

    public function updateDraft(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'draft')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transisi status tidak valid.',
            ], 400);
        }

        // Cek apakah status yang dikirim memang 'draft'
        if ($request->status === 'draft') {
            $event->update([
                'status' => 'draft'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil diubah menjadi draft!',
            ], 200);
        }

        // Tangani kondisi jika status bukan draft atau tidak ada perubahan
        return response()->json([
            'status' => 'error',
            'message' => 'Tidak ada perubahan yang dilakukan.',
        ], 400);
    }

    public function updateArchive(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'archived')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transisi status tidak valid.',
            ], 400);
        }

        // Cek apakah status yang dikirim memang 'archived'
        if ($request->status === 'archived') {
            $event->update([
                'status' => 'archived'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil diarsipkan!',
            ], 200);
        }

        // Tangani kondisi jika status bukan archived atau tidak ada perubahan
        return response()->json([
            'status' => 'error',
            'message' => 'Tidak ada perubahan yang dilakukan.',
        ], 400);
    }

    public function updateCancel(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'cancelled')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event hanya dapat dibatalkan saat status Published atau Ongoing.'
            ], 400);
        }

        $cancelThresholdDays = 1; // Variabel batas waktu (H-1)

        if ($event->start_date) {
            $thresholdDate = \Carbon\Carbon::parse($event->start_date)->subDays($cancelThresholdDays);
            if (now()->gte($thresholdDate)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event hanya dapat dibatalkan maksimal H-' . $cancelThresholdDays . ' sebelum acara dimulai.'
                ], 400);
            }
        }

        $event->update([
            'status' => 'cancelled'
        ]);

        // Kirim notifikasi ke peserta
        $this->notifyParticipantsEventCancelled($event);

        return response()->json([
            'status' => 'success',
            'message' => 'Event berhasil dibatalkan dan notifikasi telah dikirim.'
        ], 200);
    }

    public function updateOngoing(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'ongoing')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transisi status tidak valid.',
            ], 400);
        }

        $event->update([
            'status' => 'ongoing'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status event berhasil diubah menjadi On Going!',
        ], 200);
    }

    public function updatePostEvent(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'post_event')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transisi status tidak valid.',
            ], 400);
        }

        $event->update([
            'status' => 'post_event'
        ]);

        \App\Services\CertificateNotificationHelper::checkAndNotify($event->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Status event berhasil diubah menjadi Setelah Acara!',
        ], 200);
    }

    public function updateCompleted(Request $request, Event $event)
    {
        if (!$this->validateTransition($event, 'completed')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transisi status tidak valid.',
            ], 400);
        }

        $event->update([
            'status' => 'completed'
        ]);

        \App\Services\CertificateNotificationHelper::checkAndNotify($event->id);

        $hasCertificate = \DB::table('certificate_templates')->where('event_id', $event->id)->exists();
        if (!$hasCertificate && $event->organizer) {
            $event->organizer->notify(new \App\Notifications\EventReminderNotification($event, 'FINISHED_NO_CERTIFICATE', 'organizer'));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status event berhasil diubah menjadi Selesai!',
        ], 200);
    }

    /**
     * Fungsi terpisah untuk mengirim notifikasi pembatalan ke peserta.
     * Dibuat terpisah agar mudah ditambahkan logic lain (seperti blast email/WhatsApp).
     */
    private function notifyParticipantsEventCancelled(Event $event)
    {
        // 1. Ambil ID user yang sudah membeli tiket (peserta)
        $userIds = \DB::table('users')
            ->join('tickets', 'users.id', '=', 'tickets.participant_id')
            ->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.event_id', $event->id)
            ->where('orders.status', 'paid')
            ->pluck('users.id')
            ->unique()
            ->toArray();

        if (empty($userIds)) {
            return;
        }

        // 2. Ambil model User berdasarkan ID
        $users = \App\Models\User::whereIn('id', $userIds)->get();

        // 3. Konfigurasi pesan notifikasi
        $title = "Acara Dibatalkan: {$event->title}";
        $message = "Mohon maaf, acara {$event->title} yang Anda ikuti telah dibatalkan oleh pihak penyelenggara. Informasi lebih lanjut (termasuk refund jika ada) akan segera diinformasikan.";

        // 4. Kirim notifikasi ke masing-masing peserta
        foreach ($users as $user) {
            $user->notify(new \App\Notifications\OperationalNotification(
                $title,
                $message,
                'event_cancelled',
                ['event_id' => $event->id]
            ));

            // TODO: Tambahkan kode pengiriman email di sini nantinya
            // contoh: \Mail::to($user->email)->queue(new \App\Mail\EventCancelledMail($event, $user));
        }
    }
}
