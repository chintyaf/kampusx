<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\EventSeat;
use App\Services\SeatLockService;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SeatLockTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user1;
    protected User $user2;
    protected Event $event;
    protected SeatLockService $seatLockService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seatLockService = app(SeatLockService::class);

        $this->user1 = User::firstOrCreate(
            ['email' => 'test.user1.seat@example.com'],
            ['name' => 'User 1 Seat', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->user2 = User::firstOrCreate(
            ['email' => 'test.user2.seat@example.com'],
            ['name' => 'User 2 Seat', 'password' => bcrypt('password'), 'role' => 'participant']
        );

        $this->event = Event::first() ?? Event::create([
            'title'       => 'Seminar Testing Seat Lock',
            'organizer_id'=> $this->user1->id,
            'start_date'  => now()->addDays(5),
            'status'      => 'published',
        ]);
    }

    public function test_lock_seat_with_atomic_redis_and_15_minute_ttl()
    {
        // Pastikan denah kursi diinisialisasi
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // User 1 mengunci kursi B4
        $res = $this->seatLockService->lockSeatNumber($this->event->id, 'B4', $this->user1->id, 900);

        $this->assertTrue($res['success']);
        $this->assertEquals('RESERVED', $res['status']);
        $this->assertEquals(900, $res['data']['ttl_seconds']);

        // Cek database MySQL status RESERVED
        $this->assertDatabaseHas('event_seats', [
            'event_id'          => $this->event->id,
            'seat_number'       => 'B4',
            'status'            => 'RESERVED',
            'locked_by_user_id' => $this->user1->id,
        ]);
    }

    public function test_prevents_concurrent_booking_for_already_reserved_seat()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // User 1 mengunci kursi C3
        $this->seatLockService->lockSeatNumber($this->event->id, 'C3', $this->user1->id, 900);

        // User 2 mencoba mengunci kursi C3 yang sama
        $resConflict = $this->seatLockService->lockSeatNumber($this->event->id, 'C3', $this->user2->id, 900);

        $this->assertFalse($resConflict['success']);
        $this->assertContains($resConflict['status'], ['reserved', 'conflict']);
    }

    public function test_release_and_confirm_booking()
    {
        $this->seatLockService->getSeats($this->event->id, $this->user1->id);

        // Lock -> Confirm Booking -> Status jadi BOOKED
        $this->seatLockService->lockSeatNumber($this->event->id, 'B5', $this->user1->id, 900);
        $resBook = $this->seatLockService->confirmBooking($this->event->id, 'B5', $this->user1->id);

        $this->assertTrue($resBook['success']);
        $this->assertEquals('BOOKED', $resBook['status']);

        $this->assertDatabaseHas('event_seats', [
            'event_id'    => $this->event->id,
            'seat_number' => 'B5',
            'status'      => 'BOOKED',
        ]);
    }
}
