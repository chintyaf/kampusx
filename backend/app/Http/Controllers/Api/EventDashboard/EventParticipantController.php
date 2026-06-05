<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\AttendanceLog;

class EventParticipantController extends Controller
{
    public function index(Request $request, $eventId)
    {
        $limit      = $request->query('limit', 15);
        $fetchAll   = $request->query('all', 'false') === 'true';

        // Nilai: '' (semua), 'not_attended', 'checked_in', 'checked_out'
        $attendanceFilter = $request->query('attendance');

        // ── Base query: tiket yang valid untuk event ini ──────────────────────
        $baseQuery = Ticket::with([
                'participant.university',
                'orderItem.order',
                'attendanceLog',
            ])
            ->withCount('attendanceLogs')
            ->withCount(['attendanceLogs as checkouts_count' => function($q) {
                $q->whereNotNull('checkout_time');
            }])
            ->whereHas('orderItem.order', fn($q) => $q->where('event_id', $eventId))
            ->whereIn('status', ['active', 'used']);

        // ── Hitung ringkasan kehadiran (selalu dari semua data, bukan per-page) ─
        $allTicketIds = (clone $baseQuery)->pluck('id');

        $checkedInCount  = AttendanceLog::whereIn('ticket_id', $allTicketIds)
            ->whereNull('session_id')
            ->whereNotNull('scan_time')
            ->whereNull('checkout_time')
            ->count();

        $checkedOutCount = AttendanceLog::whereIn('ticket_id', $allTicketIds)
            ->whereNull('session_id')
            ->whereNotNull('checkout_time')
            ->count();

        $totalValid      = $allTicketIds->count();
        $notAttendedCount = $totalValid - $checkedInCount - $checkedOutCount;

        // Hitung total sesi kehadiran yang tersedia (total sesi + total hari unik)
        $sessions = \App\Models\EventSession::where('event_id', $eventId)->get();
        $totalSessions = $sessions->count();
        $uniqueDays = $sessions->pluck('day_number')->filter()->unique()->count();
        if ($uniqueDays === 0 && $totalSessions > 0) {
            $uniqueDays = $sessions->pluck('date')->filter()->unique()->count();
        }
        if ($uniqueDays === 0) {
            $uniqueDays = 1;
        }
        $totalAttendance = $totalSessions + $uniqueDays;

        // ── Terapkan filter kehadiran ─────────────────────────────────────────
        $query = clone $baseQuery;

        if ($attendanceFilter === 'checked_in') {
            // Sudah scan masuk, belum checkout
            $query->whereHas('attendanceLog', fn($q) => $q->whereNotNull('scan_time')->whereNull('checkout_time'));
        } elseif ($attendanceFilter === 'checked_out') {
            // Sudah checkout
            $query->whereHas('attendanceLog', fn($q) => $q->whereNotNull('checkout_time'));
        } elseif ($attendanceFilter === 'not_attended') {
            // Belum punya log kehadiran sama sekali
            $query->whereDoesntHave('attendanceLog');
        }

        $query->latest();

        // ── Ringkasan kehadiran yang disertakan di setiap response ────────────
        $attendanceSummary = [
            'total'            => $totalValid,
            'not_attended'     => max(0, $notAttendedCount),
            'checked_in'       => $checkedInCount,
            'checked_out'      => $checkedOutCount,
            'total_attendance' => $totalAttendance,
        ];

        // ── Return ────────────────────────────────────────────────────────────
        if ($fetchAll) {
            return response()->json([
                'success'            => true,
                'attendance_summary' => $attendanceSummary,
                'data'               => $query->get(),
            ]);
        }

        return response()->json([
            'success'            => true,
            'attendance_summary' => $attendanceSummary,
            'data'               => $query->paginate($limit),
        ]);
    }
}
