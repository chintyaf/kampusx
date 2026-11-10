<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SeatLockService;
use App\Models\Event;
use App\Models\EventTicket;

/**
 * Controller untuk mengelola endpoints Redis Seat-Locking
 * Sesuai Flow 2 Tugas Akhir.
 */
class SeatLockController extends Controller
{
    protected SeatLockService $seatLockService;

    public function __construct(SeatLockService $seatLockService)
    {
        $this->seatLockService = $seatLockService;
    }

    /**
     * POST /api/events/{id}/lock-seat
     * Mengunci 1 kuota tiket untuk user selama 15 menit menggunakan Redis atomic SETNX.
     */
    public function lockSeat(Request $request, int $eventId)
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            // Local fallback untuk kemudahan pengujian Postman / Thesis demo jika belum login
            $user = \App\Models\User::where('role', 'participant')->first() ?? \App\Models\User::first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan login terlebih dahulu untuk mengunci kursi tiket event.'
            ], 401);
        }

        $event = Event::findOrFail($eventId);

        // Cari ticket ID jika tidak dikirim dalam request
        $ticketId = $request->input('ticket_id');
        if (!$ticketId || !is_numeric($ticketId)) {
            $defaultTicket = EventTicket::where('event_id', $eventId)->first();
            $ticketId = $defaultTicket ? $defaultTicket->id : 1;
        }

        $result = $this->seatLockService->lockSeat(
            (int) $eventId,
            (int) $ticketId,
            (int) $user->id,
            900 // 15 Menit = 900 Detik
        );

        if (!$result['success']) {
            $httpCode = ($result['status'] === 'full') ? 409 : 422;
            return response()->json([
                'success' => false,
                'status'  => $result['status'],
                'message' => $result['message'],
                'available' => $result['available'] ?? 0,
            ], $httpCode);
        }

        return response()->json([
            'success'     => true,
            'status'      => 'locked',
            'message'     => $result['message'],
            'data'        => [
                'event_id'    => $eventId,
                'ticket_id'   => $ticketId,
                'user_id'     => $user->id,
                'lock_token'  => $result['lock_token'],
                'expires_at'  => $result['expires_at'],
                'ttl_seconds' => $result['ttl_seconds'],
                'driver'      => $result['driver'] ?? 'redis',
            ]
        ], 200);
    }

    /**
     * POST /api/events/{id}/release-seat
     * Membebaskan lock kursi jika user batal checkout.
     */
    public function releaseSeat(Request $request, int $eventId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $ticketId = $request->input('ticket_id', 1);
        $this->seatLockService->releaseSeatLock($eventId, (int)$ticketId, $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Lock kursi berhasil dibebaskan.'
        ], 200);
    }
}
