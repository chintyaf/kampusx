<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;

class OrganizerEventController extends Controller
{
    //
    public function getOrgEvents(Request $request)
    {
        // 1. Get the events for this user
        $events = Event::with(['locationDetail', 'sessions'])
            ->where('organizer_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($event) {
                // Count tickets/attendees for this event
                $attendeesCount = Ticket::whereHas('orderItem.order', function ($q) use ($event) {
                    $q->where('event_id', $event->id);
                })->count();

                // Calculate total revenue for this event
                $revenue = Order::where('event_id', $event->id)->sum('total_price');

                // Determine if event needs attention
                $needsAttention = false;
                $attentionMessage = null;

                if ($event->status === 'draft') {
                    $errors = $event->getPublishErrors();
                    if (!empty($errors)) {
                        $needsAttention = true;
                        $attentionMessage = $errors[0] ?? 'Lengkapi data detail event';
                    }
                } elseif ($event->status === 'completed' || ($event->end_date && $event->end_date->isPast())) {
                    $needsAttention = true;
                    $attentionMessage = 'Sertifikat siap didistribusikan';
                }

                // Append custom fields
                $event->attendees = $attendeesCount;
                $event->revenue = $revenue;
                $event->needsAttention = $needsAttention;
                $event->attentionMessage = $attentionMessage;

                return $event;
            });

        // 2. Send it back
        return response()->json([
            'status' => 'success',
            'data' => $events
        ]);
    }

    public function getOrgParticipants(Request $request)
    {
        $limit = $request->query('limit', 15);
        $search = $request->query('search', '');

        // 1. Get the events for this user
        $eventIds = Event::where('organizer_id', $request->user()->id)->pluck('id');

        // 2. Fetch all tickets for these events
        $query = Ticket::with(['participant.university', 'orderItem.order.event'])
            ->whereHas('orderItem.order', function ($q) use ($eventIds) {
                $q->whereIn('event_id', $eventIds);
            })
            ->whereIn('status', ['active', 'checked_in']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('attendee_name', 'like', "%{$search}%")
                  ->orWhere('attendee_email', 'like', "%{$search}%")
                  ->orWhereHas('participant', function ($qp) use ($search) {
                      $qp->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $tickets = $query->latest()->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }
}
