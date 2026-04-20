<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EngagementController extends Controller
{
    /**
     * POST /api/engagement/claim
     * Mengecek status scan dan mengeksekusi penambahan poin
     */
    public function claimPoints(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|integer',
            'event_id' => 'required|integer'
        ]);

        // Cek apakah user telah di-scan / hadir di logs
        $attendance = DB::table('attendance_logs')
            ->where('ticket_id', $request->ticket_id)
            ->where('event_id', $request->event_id)
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'Tidak dapat klaim poin: Kehadiran belum divalidasi oleh panitia.'], 403);
        }

        // Dapatkan user ID pemilik tiket
        $ticket = DB::table('tickets')->where('id', $request->ticket_id)->first();
        if (!$ticket || !$ticket->participant_id) {
            return response()->json(['message' => 'Tiket tidak memiliki relasi user valid'], 404);
        }

        // Tentukan jumlah poin yang diklaim 
        $pointsToAward = 50; // Asumsi per kehadiran

        // Cek apakah poin ini sudah diklaim sebelumnya 
        // (Misalnya membuat table reward_claims. Disini disederhanakan)
        // Kita asumsikan poin langsung ditambah saat ini. Sebaiknya ada layer anti-duplikat klaim
        
        DB::table('users')
            ->where('id', $ticket->participant_id)
            ->increment('points', $pointsToAward);

        return response()->json([
            'success' => true,
            'message' => 'Poin engagement berhasil diklaim!',
            'points_awarded' => $pointsToAward
        ], 200);
    }
}
