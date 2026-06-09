<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{

    public function index(Request $request)
    {
        // Ambil semua tiket milik user yang sedang login, urutkan dari yang terbaru
        $tickets = Ticket::with('orderItem.order.event')
            ->where('participant_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $tickets
        ], 200);
    }
    
    public function show($ticket_code, Request $request)
    {
        // Ambil tiket beserta relasi ke order dan event
        $ticket = Ticket::with('orderItem.order.event')
                        ->where('ticket_code', $ticket_code)
                        ->first();

        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        // Pastikan hanya pemilik tiket yang bisa melihatnya
        if ($ticket->participant_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        return response()->json(['data' => $ticket], 200);
    }

    public function generateQrHash($ticket_code, Request $request)
    {
        $ticket = Ticket::where('ticket_code', $ticket_code)
                        ->where('participant_id', $request->user()->id)
                        ->first();

        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        // Membentuk Signed Hash kombinasi Ticket ID + Secret Key
        $secretKey = config('app.key');
        $stringToSign = $ticket->id . '|' . $ticket->ticket_code;
        $signedHash = hash_hmac('sha256', $stringToSign, $secretKey);

        // Gabungkan format untuk dikembalikan (Opsional: [ticket_code].[hash] agar mudah diekstrak scanner)
        // Kita berikan string token QR nya
        $qrToken = $ticket->ticket_code . '.' . $signedHash;

        return response()->json([
            'qr_string' => $qrToken
        ], 200);
    }
}