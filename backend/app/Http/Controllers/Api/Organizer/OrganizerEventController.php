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
        $events = Event::where('organizer_id', $request->user()->id)
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

}
