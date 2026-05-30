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

        $statusFilter = $request->query('status'); // e.g. 'checked_in', 'active', 'cancelled'

        // Ambil tiket peserta yang sah (aktif, used) untuk Event yang ditentukan
        $query = Ticket::with(['participant.university', 'orderItem.order', 'attendanceLog'])
            ->whereHas('orderItem.order', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            });

        if ($statusFilter) {
            if ($statusFilter === 'checked_in') {
                $query->where('status', 'used');
            } else {
                $query->where('status', $statusFilter);
            }
        } else {
            $query->whereIn('status', ['active', 'used']);
        }

        $query->latest();

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
