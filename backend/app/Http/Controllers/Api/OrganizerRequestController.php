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

        $request->validate([
            'institution_id' => 'nullable|exists:institutions,id',
            'custom_institution_name' => 'nullable|string|max:255',
            'organization_name' => 'required|string|max:255',
            'proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120', // Maks 5MB
            'note' => 'nullable|string|max:1000',
        ]);

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proofs', 'public');
        }

        $req = OrganizerRequest::create([
            'user_id' => $request->user()->id,
            'institution_id' => $request->filled('institution_id') ? $request->input('institution_id') : null,
            'custom_institution_name' => $request->filled('custom_institution_name') ? $request->input('custom_institution_name') : null,
            'organization_name' => $request->organization_name,
            'proof_path' => $proofPath,
            'note' => $request->input('note'),
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan menjadi Organizer berhasil diajukan.',
            'data' => $req
        ], 201);
    }

    /**
     * Get the latest organizer request status for the logged-in user.
     */
    public function checkStatus(Request $request)
    {
        $existing = OrganizerRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $existing
        ], 200);
    }
}

