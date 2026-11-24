<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\SeatLockService;
use App\Http\Controllers\PaymentController;
use Carbon\Carbon;

class ExpireTransactionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire pending reservations and payment transactions that have passed their expiration hold';

    /**
     * Execute the console command.
     */
    public function handle(SeatLockService $seatLockService)
    {
        $this->info('Checking and expiring hold reservations and payment transactions...');

        // 1. Bersihkan kunci kursi expired di Redis & MySQL
        $releasedSeats = $seatLockService->cleanupExpiredLocks();
        $this->info("Released {$releasedSeats} expired seat locks.");

        // 2. Cari order pending yang sudah melewati masa hold (15 menit)
        $holdCutoff = Carbon::now()->subSeconds($seatLockService->getHoldTtl());
        $expiredOrders = Order::where('status', PaymentStatus::PENDING)
            ->where('created_at', '<', $holdCutoff)
            ->get();

        $expiredOrderCount = 0;
        foreach ($expiredOrders as $order) {
            $seatLockService->releaseReservationByOrder($order, 'expired');
            $expiredOrderCount++;
        }
        $this->info("Expired {$expiredOrderCount} pending orders and returned quota.");

        // 3. Sinkronkan status transaksi payment simulator & gateway
        $controller = new PaymentController();
        $expiredTxCount = $controller->expire();
        $this->info("Expired {$expiredTxCount} payment transaction sessions.");

        // 4. Bersihkan penawaran waiting list yang kedaluwarsa (3 menit) dan majukan antrean
        $waitingListService = app(\App\Services\WaitingListService::class);
        $expiredOffers = $waitingListService->cleanupExpiredOffers();
        $this->info("Processed {$expiredOffers} expired waitlist offers and dispatched to next in queue.");

        // 5. Ekspirasi Reward Credits yang sudah melewati masa berlaku 12 bulan
        $gamificationService = app(\App\Services\Gamification\GamificationService::class);
        $expiredCredits = $gamificationService->expireCredits();
        $this->info("Expired {$expiredCredits} Reward Credits from users.");

        $this->info('Total cleanup complete.');
        return Command::SUCCESS;
    }
}
