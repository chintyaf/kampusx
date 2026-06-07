<?php

namespace App\Services;

use App\Models\User;
use App\Models\PointTransaction;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class ProcessGlobalPointConversion
{
    /**
     * Convert local points of a user for a specific event into global points.
     *
     * @param User $user
     * @param int $eventId
     * @param int $localPoints
     * @return int The global points added
     */
    public function execute(User $user, int $eventId, int $localPoints): int
    {
        // 1. Dapatkan rasio konversi secara dinamis
        // Coba ambil dari database settings first, jika tidak ada, ambil dari config/env
        $dbRatioSetting = Setting::where('key', 'local_to_global_ratio')->first();
        
        if ($dbRatioSetting) {
            $ratioValue = floatval($dbRatioSetting->value);
        } else {
            $ratioValue = floatval(config('services.gamification.local_to_global_ratio', 10.0));
        }

        // Hitung global points.
        // Jika nilai rasio >= 1 (seperti 10), itu berarti "10 Local = 1 Global", maka kita bagi dengan rasio.
        // Jika rasio adalah pecahan desimal (seperti 0.1), kita kalikan secara langsung.
        if ($ratioValue >= 1.0) {
            $globalPoints = (int) floor($localPoints / $ratioValue);
        } else {
            $globalPoints = (int) floor($localPoints * $ratioValue);
        }

        if ($globalPoints <= 0) {
            return 0;
        }

        DB::transaction(function () use ($user, $eventId, $localPoints, $globalPoints) {
            // 2. Inject global points ke point_transactions
            PointTransaction::create([
                'user_id' => $user->id,
                'event_id' => null, // Global
                'activity_id' => null,
                'amount' => $globalPoints,
                'type' => 'global',
                'description' => "Konversi otomatis dari sisa Poin Lokal (Event ID: {$eventId})",
            ]);

            // 3. Kurangi / bersihkan Poin Lokal user untuk event ini dengan pencatatan mutasi negatif
            PointTransaction::create([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'activity_id' => null,
                'amount' => -$localPoints,
                'type' => 'local',
                'description' => "Pengurangan poin lokal karena dikonversi ke Global Point",
            ]);

            // 4. Update saldo di local_member_points menjadi 0
            DB::table('local_member_points')
                ->where('user_id', $user->id)
                ->where('event_id', $eventId)
                ->update([
                    'points_balance' => 0,
                    'updated_at' => now(),
                ]);
        });

        return $globalPoints;
    }
}
