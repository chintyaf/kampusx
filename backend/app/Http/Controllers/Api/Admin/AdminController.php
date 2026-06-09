<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganizerRequest;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\Institution;
use App\Notifications\OperationalNotification;

class AdminController extends Controller
{
    /**
     * 1. Admin Dashboard Overview / Stats
     */
    public function getDashboardOverview()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => $this->getDashboardMetrics(),
                'pending_organizers' => $this->getPendingOrganizers(),
                'events' => $this->getRecentEvents(),
                'users' => $this->getRecentUsers(),
                'activities' => $this->generateActivityFeed(),
            ]
        ], 200);
    }


    /**
     * 3. Suspend/Ban User
     */
    public function changeUserStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,suspended,banned',
            'status_reason' => 'required_if:status,suspended,banned|nullable|string|max:255',
        ]);
        
        $user = User::findOrFail($id);
        $statusReason = $this->mapStatusReason($request->input('status_reason') ?? $request->input('reason'));

        $user->update([
            'status' => $request->status,
            'status_reason' => $request->status !== 'active' ? $statusReason : null
        ]);
        
        if (in_array($request->status, ['suspended', 'banned'])) {
            $this->applySecuritySanction($user, $request->status, $statusReason);
        }

        return response()->json([
            'success' => true,
            'message' => "Status user berhasil diubah menjadi {$request->status}",
            'data' => $user
        ], 200);
    }

    /**
     * 4. View All Events
     */
    public function getEvents()
    {
        return response()->json([
            'data' => Event::with('organizer')->latest()->get()
        ], 200);
    }

    /**
     * 5. Toggle Featured/Boost Event
     */
    public function toggleFeatureEvent($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['is_featured' => !$event->is_featured]);

        return response()->json([
            'success' => true,
            'message' => 'Status featured berhasil dikontrol.',
            'is_featured' => $event->is_featured
        ], 200);
    }


    /* =========================================================================
       PRIVATE HELPER METHODS (Untuk menjaga controller tetap bersih dan rapi)
       ========================================================================= */

    private function getDashboardMetrics()
    {
        return [
            'organizer_pending' => OrganizerRequest::where('status', 'pending')->count(),
            'event_active' => Event::where('status', 'published')->count(),
            'user_suspended' => User::where('status', 'suspended')->count(),
            'total_transactions' => Order::count(),
        ];
    }

    private function getPendingOrganizers()
    {
        return OrganizerRequest::with(['user', 'institution'])
            ->where('status', 'pending')->latest()->take(5)->get();
    }

    private function getRecentEvents()
    {
        return Event::with('organizer')->latest()->take(5)->get()->map(fn($event) => [
            'id' => $event->id,
            'title' => $event->title,
            'organizer_name' => $event->organizer->name ?? 'Unknown',
            'start_date' => $event->start_date ? $event->start_date->format('Y-m-d') : null,
            'is_featured' => $event->is_featured,
            'status' => $event->status,
        ]);
    }

    private function getRecentUsers()
    {
        return User::latest('updated_at')->take(5)->get()->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'status_reason' => $user->status_reason,
        ]);
    }

    private function generateActivityFeed()
    {
        $activities = [];

        // 1. User Security Feed
        $recentUsers = User::whereIn('status', ['suspended', 'banned'])->latest('updated_at')->take(3)->get();
        foreach ($recentUsers as $user) {
            $reason = $user->status_reason ? " · alasan: {$user->status_reason}" : "";
            $activities[] = $this->formatActivity('user_security', 'dot-red', "Akun <strong>{$user->name}</strong> di-{$user->status}{$reason}", $user->updated_at);
        }

        // 2. Organizer Request Feed
        $recentOrgs = OrganizerRequest::with('user')->latest('updated_at')->take(3)->get();
        foreach ($recentOrgs as $org) {
            if (!$org->user) continue;
            
            $statusData = match($org->status) {
                'approved' => ['text' => 'disetujui', 'dot' => 'dot-green'],
                'rejected' => ['text' => 'ditolak', 'dot' => 'dot-red'],
                default => ['text' => 'mengajukan sebagai organizer', 'dot' => 'dot-blue'],
            };
            
            $activities[] = $this->formatActivity('organizer', $statusData['dot'], "Pengajuan Organizer <strong>{$org->user->name}</strong> {$statusData['text']}", $org->updated_at);
        }

        // 3. Featured Event Feed
        $recentEvents = Event::where('is_featured', true)->latest('updated_at')->take(3)->get();
        foreach ($recentEvents as $event) {
            $activities[] = $this->formatActivity('event', 'dot-blue', "Event <strong>{$event->title}</strong> mendapat status Featured", $event->updated_at);
        }

        // 4. Transaction Feed
        $recentOrders = Order::latest()->take(3)->get();
        foreach ($recentOrders as $order) {
            $price = number_format($order->total_price, 0, ',', '.');
            $activities[] = $this->formatActivity('transaction', 'dot-amber', "Transaksi tiket baru sebesar <strong>Rp {$price}</strong> (Order #{$order->id})", $order->created_at);
        }

        // Sort by timestamp desc and limit to 5
        usort($activities, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);
        return array_slice($activities, 0, 5);
    }

    private function formatActivity($type, $dot, $text, $date)
    {
        return [
            'type' => $type,
            'dot' => $dot,
            'text' => $text,
            'time' => $date->diffForHumans(),
            'timestamp' => $date->timestamp,
        ];
    }


    private function mapStatusReason($rawReason)
    {
        $reasonMap = [
            'spam' => 'User melakukan spam',
            'ticket_fraud' => 'Penipuan tiket',
            'platform_violation' => 'Melanggar aturan platform',
            'multi_account' => 'Membuat banyak akun (multi-account fraud)',
        ];
        
        return $reasonMap[$rawReason] ?? $rawReason;
    }

    private function applySecuritySanction(User $user, $status, $reason)
    {
        $isBanned = $status === 'banned';
        $title = $isBanned ? 'PERINGATAN: Akun Anda telah diblokir secara permanen (BANNED)' : 'PENTING: Akun Anda ditangguhkan (SUSPENDED) sementara';
        $reasonText = $reason ? " Alasan: {$reason}." : "";
        $footer = $isBanned ? ' Tindakan ini bersifat final.' : ' Silakan hubungi dukungan pelanggan jika Anda merasa ini adalah kesalahan.';
        
        $user->notify(new OperationalNotification(
            'Keamanan Akun',
            "{$title} dari platform KampusX.{$reasonText}{$footer}",
            $isBanned ? 'account_banned' : 'account_suspended'
        ));

        if ($isBanned) {
            $user->update(['is_verified' => false]);
        }
        
        $user->tokens()->delete();
    }
}