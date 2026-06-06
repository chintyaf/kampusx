<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganizerRequest;
use Illuminate\Validation\Rule;

class OrganizerRequestController extends Controller
{
    public function apply(Request $request)
    {
        $user = $request->user();

        // 1. Cek Penolakan Permanen
        $existing = OrganizerRequest::where('user_id', $user->id)->first();
        if ($existing && $existing->status === 'rejected' && !$existing->can_resubmit) {
            return response()->json(['message' => 'Permohonan Anda ditolak secara permanen oleh Admin.'], 400);
        }

        // 2. Validasi
        $request->validate([
            'institution_id' => 'nullable|exists:institutions,id',
            'custom_institution_name' => 'nullable|string|max:255',
            'organization_name' => 'required|string|max:255',
            'proof' => [Rule::requiredIf(!$existing?->proof_path), 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'note' => 'nullable|string|max:1000',
        ]);

        // 3. Handle Upload File
        $proofPath = $existing?->proof_path;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proofs', 'public');
        }

        // 4. Simpan / Update Otomatis
        $req = OrganizerRequest::updateOrCreate(
            ['user_id' => $user->id],
            [
                'institution_id' => $request->input('institution_id'),
                'custom_institution_name' => $request->input('custom_institution_name'),
                'organization_name' => $request->organization_name,
                'proof_path' => $proofPath,
                'note' => $request->input('note'),
                'rejection_reason' => null,
                'status' => 'pending'
            ]
        );

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
