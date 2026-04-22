<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;

class EventParticipantController extends Controller
{
    public function index(Request $request, $eventId)
    {
        $limit = $request->query('limit', 10);
        $fetchAll = $request->query('all', 'false') === 'true';

        // Ambil tiket peserta yang sah (aktif atau sudah check-in) untuk Event yang ditentukan
        $query = Ticket::with(['participant.university', 'orderItem.order'])
            ->whereHas('orderItem.order', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            })
            ->whereIn('status', ['active', 'checked_in'])
            ->latest();

        if ($fetchAll) {
            return response()->json([
                'success' => true,
                'data' => $query->get()
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($limit)
        ]);
    }
}
