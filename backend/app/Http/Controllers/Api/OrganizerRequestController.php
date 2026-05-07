<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganizerRequest;

class OrganizerRequestController extends Controller
{
    public function apply(Request $request)
    {
        // Cek apakah user sudah mengirim request
        $existing = OrganizerRequest::where('user_id', $request->user()->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah memiliki permohonan yang aktif atau sudah disetujui.'
            ], 400);
        }

        $req = OrganizerRequest::create([
            'user_id' => $request->user()->id,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan menjadi Organizer berhasil diajukan.',
            'data' => $req
        ], 201);
    }
}
