<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Notifications\EventGamificationReminder;
use Illuminate\Support\Facades\Log;

class RemindUnredeemedPoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'points:remind-members';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send automatic notifications and emails to users with unredeemed global points who have not redeemed anything in 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Mencari user yang memenuhi kriteria pengingat poin global...');

        // Query: User dengan global balance > 0 dan tidak ada redemption dalam 30 hari terakhir (atau belum pernah)
        $users = User::whereHas('pointTransactions', function ($query) {
                $query->where('type', 'global');
            })
            ->whereDoesntHave('redemptions', function ($query) {
                $query->where('redeemed_at', '>=', now()->subDays(30));
            })
            ->get()
            ->filter(function ($user) {
                $globalBalance = $user->pointTransactions()
                    ->where('type', 'global')
                    ->sum('amount');
                
                // Simpan nilai global_balance di model agar bisa dipakai saat notifikasi
                $user->global_balance = (int) $globalBalance;
                
                return $globalBalance > 0;
            });

        $sentCount = 0;

        foreach ($users as $user) {
            try {
                $points = (int) $user->global_balance;
                $user->notify(new EventGamificationReminder($points));
                $sentCount++;
                $this->line("Mengirim pengingat ke User ID {$user->id} ({$user->name}) dengan {$points} Pts.");
            } catch (\Exception $e) {
                $this->error("Gagal mengirim pengingat ke User ID {$user->id}: " . $e->getMessage());
            }
        }

        Log::info("Kirim pengingat poin global ke {$sentCount} user.");
        $this->info("Proses selesai. {$sentCount} user berhasil dikirimi pengingat.");
    }
}
