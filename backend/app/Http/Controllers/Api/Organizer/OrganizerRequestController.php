<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganizerRequest;

class OrganizerRequestController extends Controller
{
    public function apply(Request $request)
    {
        // Cek apakah user sudah mengirim request pending atau approved
        $existing = OrganizerRequest::where('user_id', $request->user()->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah memiliki permohonan yang aktif atau sudah disetujui.'
            ], 400);
        }

        // Cek apakah permohonan sebelumnya ditolak secara permanen
        $permanentRejected = OrganizerRequest::where('user_id', $request->user()->id)
            ->where('status', 'rejected')
            ->where('can_resubmit', false)
            ->first();

        if ($permanentRejected) {
            return response()->json([
                'message' => 'Permohonan Anda ditolak secara permanen oleh Admin. Anda tidak dapat mengajukan ulang.'
            ], 400);
        }

        $existingRequest = OrganizerRequest::where('user_id', $request->user()->id)->first();

        $request->validate([
            'institution_id' => 'nullable|exists:institutions,id',
            'custom_institution_name' => 'nullable|string|max:255',
            'organization_name' => 'required|string|max:255',
            'proof' => ($existingRequest && $existingRequest->proof_path) ? 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120' : 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'note' => 'nullable|string|max:1000',
        ]);

        $proofPath = $existingRequest ? $existingRequest->proof_path : null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proofs', 'public');
        }

        if ($existingRequest) {
            $existingRequest->update([
                'institution_id' => $request->filled('institution_id') ? $request->input('institution_id') : null,
                'custom_institution_name' => $request->filled('custom_institution_name') ? $request->input('custom_institution_name') : null,
                'organization_name' => $request->organization_name,
                'proof_path' => $proofPath,
                'note' => $request->input('note'),
                'rejection_reason' => null, // Reset alasan penolakan
                'status' => 'pending'
            ]);
            $req = $existingRequest;
        } else {
            $req = OrganizerRequest::create([
                'user_id' => $request->user()->id,
                'institution_id' => $request->filled('institution_id') ? $request->input('institution_id') : null,
                'custom_institution_name' => $request->filled('custom_institution_name') ? $request->input('custom_institution_name') : null,
                'organization_name' => $request->organization_name,
                'proof_path' => $proofPath,
                'note' => $request->input('note'),
                'status' => 'pending'
            ]);
        }

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

