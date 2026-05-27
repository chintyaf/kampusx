<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bookmark;
use App\Models\Event;
use Illuminate\Support\Facades\DB;

class BookmarkController extends Controller
{
    /**
     * GET /api/v1/bookmarks
     * Return all events bookmarked by the currently logged-in user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ambil semua event yang dibookmark oleh user tersebut
        // Sertakan relasi organizer, locationDetail, dan categories agar EventCard berfungsi sempurna
        $bookmarks = Bookmark::where('user_id', $user->id)
            ->with(['event.organizer', 'event.locationDetail', 'event.categories', 'event.eventTickets'])
            ->get()
            ->pluck('event')
            ->filter(); // Buang jika ada null (misal event dihapus)

        return response()->json([
            'success' => true,
            'data'    => array_values($bookmarks->toArray()),
        ]);
    }

    /**
     * POST /api/v1/events/{id}/bookmark
     * Toggle bookmark state for an event.
     */
    public function toggle(Request $request, $id)
    {
        $user = $request->user();
        $event = Event::findOrFail($id);

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('event_id', $id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
            $message = 'Event berhasil dihapus dari bookmark.';
        } else {
            Bookmark::create([
                'user_id'  => $user->id,
                'event_id' => $id,
            ]);
            $isBookmarked = true;
            $message = 'Event berhasil disimpan ke bookmark.';
        }

        return response()->json([
            'status'        => 'success',
            'message'       => $message,
            'is_bookmarked' => $isBookmarked,
        ]);
    }
}
