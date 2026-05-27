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
     * 0. Admin Dashboard Overview / Stats
     */
    public function getDashboardOverview()
    {
        // 1. Metrics
        $organizerPending = OrganizerRequest::where('status', 'pending')->count();
        $eventActive = Event::where('status', 'published')->count();
        $userSuspended = User::where('status', 'suspended')->count();
        $totalOrders = \App\Models\Order::count();

        // 2. Pending Organizer Requests (max 5)
        $pendingOrganizers = OrganizerRequest::with(['user', 'institution'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 3. Events for Moderation (max 5)
        $events = Event::with('organizer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'organizer_name' => $event->organizer->name ?? 'Unknown',
                    'start_date' => $event->start_date ? $event->start_date->format('Y-m-d') : null,
                    'is_featured' => $event->is_featured,
                    'status' => $event->status,
                ];
            });

        // 4. User Security (max 5 recently changed or active/suspended/banned)
        $users = User::orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'status_reason' => $user->status_reason,
                ];
            });

        // 5. Dynamic Audit Log / Activity Feed
        $activities = [];

        // Recent users status changes (suspended/banned)
        $recentUsers = User::whereIn('status', ['suspended', 'banned'])
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();
        foreach ($recentUsers as $ru) {
            $activities[] = [
                'type' => 'user_security',
                'dot' => 'dot-red',
                'text' => "Akun <strong>{$ru->name}</strong> di-{$ru->status}" . ($ru->status_reason ? " · alasan: {$ru->status_reason}" : ""),
                'time' => $ru->updated_at->diffForHumans(),
                'timestamp' => $ru->updated_at->timestamp,
            ];
        }

        // Recent organizer requests approved/pending
        $recentOrgs = OrganizerRequest::with('user')
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();
        foreach ($recentOrgs as $ro) {
            if (!$ro->user) continue;
            $statusStr = $ro->status === 'approved' ? 'disetujui' : ($ro->status === 'rejected' ? 'ditolak' : 'mengajukan sebagai organizer');
            $dot = $ro->status === 'approved' ? 'dot-green' : ($ro->status === 'rejected' ? 'dot-red' : 'dot-blue');
            $activities[] = [
                'type' => 'organizer',
                'dot' => $dot,
                'text' => "Pengajuan Organizer <strong>{$ro->user->name}</strong> {$statusStr}",
                'time' => $ro->updated_at->diffForHumans(),
                'timestamp' => $ro->updated_at->timestamp,
            ];
        }

        // Recent featured events
        $recentFeatured = Event::where('is_featured', true)
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();
        foreach ($recentFeatured as $rf) {
            $activities[] = [
                'type' => 'event',
                'dot' => 'dot-blue',
                'text' => "Event <strong>{$rf->title}</strong> mendapat status Featured",
                'time' => $rf->updated_at->diffForHumans(),
                'timestamp' => $rf->updated_at->timestamp,
            ];
        }

        // Recent transactions / orders
        $recentOrders = \App\Models\Order::orderBy('created_at', 'desc')
            ->take(3)
            ->get();
        foreach ($recentOrders as $ro) {
            $activities[] = [
                'type' => 'transaction',
                'dot' => 'dot-amber',
                'text' => "Transaksi tiket baru sebesar <strong>Rp " . number_format($ro->total_price, 0, ',', '.') . "</strong> oleh Order #{$ro->id}",
                'time' => $ro->created_at->diffForHumans(),
                'timestamp' => $ro->created_at->timestamp,
            ];
        }

        // Sort activities by timestamp desc
        usort($activities, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        // Limit to 5 items
        $activities = array_slice($activities, 0, 5);

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'organizer_pending' => $organizerPending,
                    'event_active' => $eventActive,
                    'user_suspended' => $userSuspended,
                    'total_transactions' => $totalOrders,
                ],
                'pending_organizers' => $pendingOrganizers,
                'events' => $events,
                'users' => $users,
                'activities' => $activities,
            ]
        ], 200);
    }

    /**
     * 1. Approve/Reject Organizer
     */
    public function approveOrganizer(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,pending',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:1000',
            'can_resubmit' => 'nullable|boolean',
        ]);
        
        $req = OrganizerRequest::findOrFail($id);
        $user = User::findOrFail($req->user_id);
        
        $req->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->input('rejection_reason') : null,
            'can_resubmit' => $request->status === 'rejected' ? ($request->has('can_resubmit') ? (bool)$request->input('can_resubmit') : true) : true,
        ]);
        if ($request->status === 'approved') {
            $updateData = [
                'role' => 'organizer',
                'affiliation_valid_until' => null, // Dynamic inactivity basis is used instead of fixed expiry date
            ];
            
            // Set university affiliation dynamically on user if it exists on request
            if ($req->institution_id) {
                $updateData['university_id'] = $req->institution_id;
            } elseif ($req->custom_institution_name) {
                // Buat institusi baru secara otomatis jika nama kustom diisi
                $newInstitution = \App\Models\Institution::create([
                    'name' => $req->custom_institution_name,
                    'type' => 'university',
                    'description' => 'Institusi baru terdaftar via pengajuan organizer.',
                ]);
                $updateData['university_id'] = $newInstitution->id;
                
                // Update request agar terhubung ke institusi baru
                $req->update(['institution_id' => $newInstitution->id]);
            } else {
                // EO Independen / Luar
                $updateData['university_id'] = null;
            }
            
            $user->update($updateData);

            $user->notify(new \App\Notifications\OperationalNotification(
                'Persetujuan Organizer',
                'Selamat! Pengajuan Anda sebagai Organizer telah DI-SETUJUI oleh Admin Pusat. Akun Anda aktif secara permanen dan otomatis kembali menjadi member jika tidak membuat event baru dalam 1 tahun. Silakan login kembali untuk menikmati akses fitur Organizer.',
                'organizer_approved'
            ));
        } elseif ($request->status === 'rejected') {
            // Demote user role back to participant if they were approved before
            $user->update([
                'role' => 'participant',
                'university_id' => null,
                'affiliation_valid_until' => null,
            ]);

            $reason = $request->input('rejection_reason') ?? 'Maaf, pengajuan Anda belum memenuhi persyaratan.';
            $resubmitText = $req->can_resubmit ? ' Silakan klik notifikasi ini untuk melakukan pengajuan ulang.' : ' Penolakan ini bersifat permanen.';
            $user->notify(new \App\Notifications\OperationalNotification(
                'Persetujuan Organizer',
                'Maaf, pengajuan Anda sebagai Organizer ditolak/ditangguhkan oleh Admin Pusat. Alasan: ' . $reason . $resubmitText,
                'organizer_rejected'
            ));
        } else {
            // Reset to pending
            $user->update([
                'role' => 'participant',
                'university_id' => null,
                'affiliation_valid_until' => null,
            ]);
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
        $request->validate([
            'status' => 'required|in:active,suspended,banned',
            'status_reason' => 'required_if:status,suspended,banned|nullable|string|max:255',
        ]);
        
        $user = User::findOrFail($id);
        
        $statusReason = null;
        if ($request->status !== 'active') {
            $rawReason = $request->input('status_reason') ?? $request->input('reason');
            $reasonMap = [
                'spam' => 'User melakukan spam',
                'ticket_fraud' => 'Penipuan tiket',
                'platform_violation' => 'Melanggar aturan platform',
                'multi_account' => 'Membuat banyak akun (multi-account fraud)',
            ];
            $statusReason = $reasonMap[$rawReason] ?? $rawReason;
        }

        $user->update([
            'status' => $request->status,
            'status_reason' => $statusReason
        ]);
        
        if ($request->status === 'suspended') {
            $notificationMessage = 'PENTING: Akun Anda ditangguhkan (SUSPENDED) sementara oleh Admin Pusat.';
            if ($statusReason) {
                $notificationMessage .= ' Alasan penangguhan: ' . $statusReason . '.';
            }
            $notificationMessage .= ' Silakan hubungi dukungan pelanggan KampusX jika Anda merasa ini adalah kesalahan.';

            $user->notify(new \App\Notifications\OperationalNotification(
                'Keamanan Akun',
                $notificationMessage,
                'account_suspended'
            ));

            // Membatalkan semua token jika akun di-suspend agar langsung ter-logout
            $user->tokens()->delete();

        } elseif ($request->status === 'banned') {
            $notificationMessage = 'PERINGATAN: Akun Anda telah diblokir secara permanen (BANNED) dari platform KampusX.';
            if ($statusReason) {
                $notificationMessage .= ' Alasan pemblokiran: ' . $statusReason . '.';
            }
            $notificationMessage .= ' Tindakan ini bersifat final.';

            $user->notify(new \App\Notifications\OperationalNotification(
                'Keamanan Akun',
                $notificationMessage,
                'account_banned'
            ));

            $user->update(['is_verified' => false]);
            // Membatalkan semua token jika akun di-banned
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Status user berhasil diubah menjadi ' . $request->status,
            'data' => $user
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
        $requests = OrganizerRequest::with(['user', 'institution'])->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $requests
        ], 200);
    }
}

