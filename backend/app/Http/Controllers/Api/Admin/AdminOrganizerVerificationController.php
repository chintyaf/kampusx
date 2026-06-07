<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganizerRequest;
use App\Models\User;
use App\Models\Institution;
use App\Notifications\OperationalNotification;
use Illuminate\Support\Facades\DB;

class AdminOrganizerVerificationController extends Controller
{
    /**
     * View All Organizer Requests
     */
    public function getOrganizerRequests()
    {
        return response()->json([
            'success' => true,
            'data' => OrganizerRequest::with(['user', 'institution'])->latest()->get()
        ]);
    }

    /**
     * Approve/Reject Organizer
     */
    public function approveOrganizer(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,pending',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:1000',
            'can_resubmit' => 'nullable|boolean',
        ]);

        $req = OrganizerRequest::with('user')->findOrFail($id);
        $user = $req->user;

        // Menggunakan Database Transaction untuk keamanan data jika ada error di tengah jalan
        DB::transaction(function () use ($validated, $req, $user) {
            $isRejected = $validated['status'] === 'rejected';

            $req->update([
                'status' => $validated['status'],
                'rejection_reason' => $isRejected ? $validated['rejection_reason'] : null,
                'can_resubmit' => $isRejected ? ($validated['can_resubmit'] ?? true) : true,
            ]);

            match ($validated['status']) {
                'approved' => $this->processApproval($user, $req),
                'rejected' => $this->processRejection($user, $req, $validated['rejection_reason']),
                'pending'  => $this->resetUserToParticipant($user),
            };
        });

        return response()->json([
            'success' => true,
            'message' => "Status pengajuan berhasil diubah menjadi {$validated['status']}"
        ]);
    }

    private function processApproval(User $user, OrganizerRequest $req)
    {
        $universityId = null;

        if ($req->institution_id) {
            $universityId = $req->institution_id;
        }
        elseif (!empty($req->custom_institution_name)) {
            $institution = Institution::firstOrCreate(
                ['name' => $req->custom_institution_name],
                [
                    'type' => 'university',
                    'description' => 'Institusi baru terdaftar via pengajuan organizer.'
                ]
            );
            $universityId = $institution->id;
            $req->update(['institution_id' => $universityId]);
        }

        $user->update([
            'role' => 'organizer',
            'university_id' => $universityId
        ]);

        $user->notify(new OperationalNotification(
            'Persetujuan Organizer',
            'Selamat! Pengajuan Anda sebagai Organizer telah DI-SETUJUI oleh Admin Pusat...',
            'organizer_approved'
        ));
    }

    private function processRejection(User $user, OrganizerRequest $req, $reasonInput)
    {
        $this->resetUserToParticipant($user);

        $reason = $reasonInput ?? 'Maaf, pengajuan Anda belum memenuhi persyaratan.';
        $resubmitText = $req->can_resubmit ? ' Silakan klik notifikasi ini untuk melakukan pengajuan ulang.' : ' Penolakan ini bersifat permanen.';

        $user->notify(new OperationalNotification(
            'Persetujuan Organizer',
            "Maaf, pengajuan Anda sebagai Organizer ditolak/ditangguhkan oleh Admin Pusat. Alasan: {$reason}{$resubmitText}",
            'organizer_rejected'
        ));
    }

    private function resetUserToParticipant(User $user)
    {
        $user->update([
            'role' => 'participant',
            'university_id' => null,
        ]);
    }
}
