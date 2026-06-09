<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberPointBalanceResource;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MemberDashboardController extends Controller
{
    /**
     * Get the current global points and event-specific local points for the authenticated user.
     */
    public function getBalance(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan login terlebih dahulu.'
                ], 401);
            }

            $eventId = $request->query('event_id');

            // Hitung saldo poin lokal real-time
            $currentLocalPoints = 0;
            if ($eventId) {
                $currentLocalPoints = (int) LocalMemberPoint::where('user_id', $user->id)
                    ->where('event_id', $eventId)
                    ->value('points_balance') ?? 0;
            } else {
                // Sum all local points across all events for this user
                $currentLocalPoints = (int) LocalMemberPoint::where('user_id', $user->id)
                    ->sum('points_balance');

                // Determine the fallback event_id to return in response
                $latestTicket = Ticket::where('participant_id', $user->id)
                    ->with(['orderItem.order'])
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if ($latestTicket && $latestTicket->orderItem && $latestTicket->orderItem->order) {
                    $eventId = $latestTicket->orderItem->order->event_id;
                }

                if (!$eventId) {
                    $latestLocalPoint = LocalMemberPoint::where('user_id', $user->id)
                        ->orderBy('updated_at', 'desc')
                        ->first();
                    $eventId = $latestLocalPoint ? $latestLocalPoint->event_id : null;
                }
            }

            // Hitung saldo poin global real-time
            $currentGlobalPoints = (int) PointTransaction::where('user_id', $user->id)
                ->where('type', 'global')
                ->sum('amount');

            return new MemberPointBalanceResource([
                'current_local_points' => $currentLocalPoints,
                'current_global_points' => $currentGlobalPoints,
                'event_id' => $eventId
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching member points balance: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server.'
            ], 500);
        }
    }
}
