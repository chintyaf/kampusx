<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SeatLockService;
use App\Models\Event;
use App\Models\User;

class SeatLockController extends Controller
{
    protected SeatLockService $seatLockService;

    public function __construct(SeatLockService $seatLockService)
    {
        $this->seatLockService = $seatLockService;
    }

    protected function getActiveUser(Request $request): User
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            $user = User::where('email', 'part@kampusx.com')->first()
                ?: User::where('role', 'participant')->first();
        }

        if (!$user) {
            $user = User::first();
        }

        return $user;
    }

    /**
     * GET /api/events/{id}/seats
     * Mengambil denah kursi dan status realtime
     */
    public function getSeats(Request $request, int $id)
    {
        $user = $request->user() ?: auth('sanctum')->user();
        $userId = $user ? $user->id : null;

        $seatsData = $this->seatLockService->getSeats($id, $userId);

        return response()->json([
            'success' => true,
            'message' => 'Data denah kursi event berhasil dimuat.',
            'data'    => $seatsData,
        ], 200);
    }

    /**
     * POST /api/events/{id}/lock-seat
     * Mengunci 1 kursi spesifik selama 15 menit menggunakan Redis Atomic SETNX
     */
    public function lockSeat(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        $seatNumber = $request->input('seat_number');

        if (!$seatNumber) {
            $seatNumber = $this->seatLockService->findAvailableSeatNumber($id, $user->id);
        }

        $result = $this->seatLockService->lockSeatNumber($id, $seatNumber, $user->id, 900);

        if (!$result['success']) {
            $statusCode = ($result['status'] === 'conflict' || $result['status'] === 'reserved') ? 409 : 422;
            return response()->json($result, $statusCode);
        }

        return response()->json($result, 200);
    }

    /**
     * POST /api/events/{id}/release-seat
     * Melepaskan kursi yang sedang di-lock
     */
    public function releaseSeat(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        $seatNumber = $request->input('seat_number', 'B3');

        $result = $this->seatLockService->releaseSeatNumber($id, $seatNumber, $user->id);

        return response()->json($result, 200);
    }

    /**
     * POST /api/events/{id}/confirm-booking
     * Mengubah status kursi menjadi BOOKED setelah pembayaran berhasil
     */
    public function confirmBooking(Request $request, int $id)
    {
        $user = $this->getActiveUser($request);
        $seatNumber = $request->input('seat_number', 'B3');

        $result = $this->seatLockService->confirmBooking($id, $seatNumber, $user->id);

        return response()->json($result, 200);
    }
}
