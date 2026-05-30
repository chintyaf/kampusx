<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\PaymentController;

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
    protected $description = 'Expire pending payment transactions that have passed their expiration date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking and expiring payment transactions...');

        $controller = new PaymentController();
        $expiredCount = $controller->expire();

        $this->info("Expired {$expiredCount} transactions successfully.");
    }
}
