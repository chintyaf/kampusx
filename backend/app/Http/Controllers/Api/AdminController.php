<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganizerRequest;
use App\Models\User;
use App\Models\Event;

class AdminController extends Controller
{
    /**
     * 1. Approve/Reject Organizer
     */
    public function approveOrganizer(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);
        $req = OrganizerRequest::findOrFail($id);
        
        $req->update(['status' => $request->status]);

        $user = User::findOrFail($req->user_id);
        if ($request->status === 'approved') {
            // Hanya ubah ke organizer jika sebelumnya participant/committee
            $user->update(['role' => 'organizer']);

            $user->notify(new \App\Notifications\OperationalNotification(
                'Persetujuan Organizer',
                'Selamat! Pengajuan Anda sebagai Organizer telah DI-SETUJUI oleh Admin Pusat. Silakan login kembali untuk menikmati akses fitur Organizer.',
                'organizer_approved'
            ));
        } else {
            $user->notify(new \App\Notifications\OperationalNotification(
                'Persetujuan Organizer',
                'Maaf, pengajuan Anda sebagai Organizer telah DI-TOLAK oleh Admin Pusat karena dokumen pendukung kurang lengkap atau belum memenuhi persyaratan.',
                'organizer_rejected'
            ));
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pengajuan berhasil diubah menjadi ' . $request->status
        ], 200);
    }

    /**
     * 2. Suspend/Ban User
     */
    public function changeUserStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:active,suspended,banned']);
        $user = User::findOrFail($id);
        
        $user->update(['status' => $request->status]);
        
        if ($request->status === 'suspended') {
            $user->notify(new \App\Notifications\OperationalNotification(
                'Keamanan Akun',
                'PENTING: Akun Anda ditangguhkan (SUSPENDED) sementara oleh Admin Pusat karena terdeteksi melanggar pedoman komunitas KampusX.',
                'account_suspended'
            ));
        } elseif ($request->status === 'banned') {
            $user->notify(new \App\Notifications\OperationalNotification(
                'Keamanan Akun',
                'PERINGATAN: Akun Anda telah diblokir secara permanen (BANNED) dari platform KampusX karena pelanggaran fatal terhadap syarat dan ketentuan.',
                'account_banned'
            ));

            $user->update(['is_verified' => false]);
            // Membatalkan semua token jika akun di-banned
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Status user berhasil diubah menjadi ' . $request->status
        ], 200);
    }

    /**
     * 3. View All Events (Admin Monitoring)
     */
    public function getEvents()
    {
        $events = Event::with('organizer')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'data' => $events
        ], 200);
    }

    /**
     * 4. Toggle Featured/Boost Event
     */
    public function toggleFeatureEvent($id)
    {
        $event = Event::findOrFail($id);
        // Membalikkan nilai true/false
        $event->update(['is_featured' => !$event->is_featured]);

        return response()->json([
            'success' => true,
            'message' => 'Status featured berhasil dikontrol.',
            'is_featured' => $event->is_featured
        ], 200);
    }

    /**
     * 5. View All Organizer Requests (Admin Verification)
     */
    public function getOrganizerRequests()
    {
        $requests = OrganizerRequest::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $requests
        ], 200);
    }
}

