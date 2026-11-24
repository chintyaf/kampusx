<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventWaitlist;
use App\Models\User;
use App\Services\WaitingListService;
use App\Services\SeatLockService;

class WaitingListController extends Controller
{
    public function __construct(
        protected WaitingListService $waitingListService,
        protected SeatLockService $seatLockService
    ) {}

    protected function getActiveUser(Request $request): ?User
    {
        $user = $request->user() ?: auth('sanctum')->user();
        return $user;
    }

    /**
     * POST /api/events/{id}/waitlist/join
     * Bergabung ke dalam waiting list event
     */
    public function join(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $ticketId = $request->input('ticket_id') ? (int) $request->input('ticket_id') : null;

        $result = $this->waitingListService->join($user, $id, $ticketId);

        $httpCode = match ($result['status'] ?? '') {
            'WAITING'            => 201,
            'already_queued'     => 409,
            'capacity_available' => 400,
            'event_closed'       => 422,
            default              => ($result['success'] ? 200 : 422),
        };

        return response()->json($result, $httpCode);
    }

    /**
     * GET /api/events/{id}/waitlist/my-status
     * Memeriksa posisi antrean dan status offer pengguna saat ini
     */
    public function myStatus(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $this->waitingListService->getMyStatus($user, $id);

        return response()->json([
            'success' => true,
            'data'    => $result,
        ], 200);
    }

    /**
     * POST /api/events/{id}/waitlist/cancel
     * Membatalkan antrean pengguna
     */
    public function cancel(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $this->waitingListService->cancel($user, $id);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * POST /api/waitlist/offer/{token}/accept
     * Menerima offer eksklusif dan mengonversi menjadi checkout hold
     */
    public function acceptOffer(Request $request, string $token)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $this->waitingListService->acceptOffer($token, $user, $this->seatLockService);

        $httpCode = match ($result['status'] ?? '') {
            'CLAIMED'   => 200,
            'expired'   => 410,
            'not_found' => 404,
            default     => ($result['success'] ? 200 : 422),
        };

        return response()->json($result, $httpCode);
    }

    /**
     * POST /api/waitlist/offer/{token}/decline
     * Menolak offer sukarela dan mengalihkan ke antrean berikutnya
     */
    public function declineOffer(Request $request, string $token)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $this->waitingListService->declineOffer($token, $user);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * GET /api/admin/events/{id}/waitlist
     * Organizer / Admin memantau antrean event miliknya
     */
    public function eventWaitlistAdmin(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $event = Event::findOrFail($id);

        // Authorization check: hanya organizer pemilik event atau role admin
        if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda hanya dapat melihat antrean event yang Anda kelola.',
            ], 403);
        }

        $waitlists = EventWaitlist::with(['user:id,name,email', 'eventTicket:id,name'])
            ->where('event_id', $id)
            ->orderBy('queue_number', 'asc')
            ->get();

        $metrics = [
            'total_waiting'   => $waitlists->where('status', EventWaitlist::STATUS_WAITING)->count(),
            'total_offered'   => $waitlists->where('status', EventWaitlist::STATUS_OFFERED)->count(),
            'total_claimed'   => $waitlists->where('status', EventWaitlist::STATUS_CLAIMED)->count(),
            'total_expired'   => $waitlists->where('status', EventWaitlist::STATUS_EXPIRED)->count(),
            'total_cancelled' => $waitlists->where('status', EventWaitlist::STATUS_CANCELLED)->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => [
                'event_id'  => $id,
                'title'     => $event->title,
                'metrics'   => $metrics,
                'waitlists' => $waitlists,
            ]
        ], 200);
    }

    /**
     * GET /api/my-waitlists
     * Mengambil seluruh riwayat antrean waiting list milik pengguna yang sedang login
     */
    public function myWaitlists(Request $request)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $waitlists = EventWaitlist::with(['event:id,title,start_date,slug', 'eventTicket:id,name,price'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($entry) {
                $position = $this->waitingListService->calculatePosition($entry);
                $remainingOfferSeconds = ($entry->isOffered() && $entry->expires_at && $entry->expires_at->isFuture())
                    ? (int) max(0, \Carbon\Carbon::now()->diffInSeconds($entry->expires_at, false))
                    : 0;

                return [
                    'id'                      => $entry->id,
                    'event_id'                => $entry->event_id,
                    'event_title'             => $entry->event?->title,
                    'event_slug'              => $entry->event?->slug ?: $entry->event_id,
                    'ticket_name'             => $entry->eventTicket?->name,
                    'seat_number'             => $entry->seat_number,
                    'status'                  => $entry->status,
                    'queue_number'            => $entry->queue_number,
                    'position'                => $position,
                    'offer_token'             => $entry->offer_token,
                    'offered_at'              => $entry->offered_at?->toISOString(),
                    'expires_at'              => $entry->expires_at?->toISOString(),
                    'remaining_offer_seconds' => $remainingOfferSeconds,
                    'can_claim'               => ($entry->isOffered() && $remainingOfferSeconds > 0),
                    'created_at'              => $entry->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $waitlists,
        ]);
    }

    /**
     * PUT /api/admin/events/{id}/waitlist/config
     * Mengatur konfigurasi offer TTL antrean untuk event (Task 12)
     */
    public function updateConfig(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $event = Event::findOrFail($id);
        if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'offer_ttl_minutes' => 'required|integer|min:1|max:10',
        ]);

        \Illuminate\Support\Facades\Cache::put("event_{$id}:offer_ttl_minutes", $validated['offer_ttl_minutes'], now()->addDays(30));

        return response()->json([
            'success'           => true,
            'message'           => "Batas waktu offer berhasil diubah menjadi {$validated['offer_ttl_minutes']} menit.",
            'offer_ttl_minutes' => $validated['offer_ttl_minutes'],
        ]);
    }
}
