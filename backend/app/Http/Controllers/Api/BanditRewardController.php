<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\User;
use App\Services\Bandit\RewardDecisionEngine;

/**
 * Controller untuk mengeksekusi Reward Decision Engine (Contextual Bandit)
 * Sesuai Flow 3: Pemilihan Diskon Cerdas di Halaman Checkout.
 */
class BanditRewardController extends Controller
{
    protected RewardDecisionEngine $banditEngine;

    public function __construct(RewardDecisionEngine $banditEngine)
    {
        $this->banditEngine = $banditEngine;
    }

    /**
     * GET /api/checkout/bandit-reward/{eventId}
     * Menjalankan Thompson Sampling + DISCO constraints untuk menentukan diskon checkout.
     */
    public function getPersonalizedReward(Request $request, int $eventId)
    {
        $event = Event::findOrFail($eventId);
        $user = $request->user();

        // Jika user belum login, ambil fallback user
        if (!$user) {
            $user = User::first() ?? new User(['name' => 'Peserta Demo', 'points' => 1200, 'tier' => 'Silver']);
        }

        $basePrice = (float) ($event->price ?? 50000);
        $ticketId = $request->query('ticketId');
        if ($ticketId) {
            $ticket = \App\Models\EventTicket::find($ticketId);
            if ($ticket && $ticket->price !== null) {
                $basePrice = (float) $ticket->price;
            }
        }

        $rewardDecision = $this->banditEngine->selectOptimalReward($event, $user, $basePrice);

        return response()->json([
            'success' => true,
            'status'  => 'success',
            'data'    => array_merge($rewardDecision, [
                'event_id'   => $event->id,
                'event_title'=> $event->title,
                'base_price' => $basePrice,
                'final_price'=> max(0, $basePrice - $rewardDecision['discount_amount']),
            ])
        ], 200);
    }
}
