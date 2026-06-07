<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\PointTransactionResource;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PointTransactionController extends Controller
{
    /**
     * Get the point transaction history of the authenticated user.
     */
    public function history(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan login terlebih dahulu.'
                ], 401);
            }

            $query = PointTransaction::with(['event', 'reward'])
                ->where('user_id', $user->id);

            // Filter by optional type parameter
            if ($request->has('type') && in_array($request->query('type'), ['local', 'global'])) {
                $query->where('type', $request->query('type'));
            }

            $transactions = $query->orderBy('created_at', 'desc')
                ->paginate(15);

            return PointTransactionResource::collection($transactions);

        } catch (\Exception $e) {
            Log::error('Error fetching point transaction history: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server.'
            ], 500);
        }
    }
}
