<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PushSubscriptionController extends Controller
{
    /**
     * Store or update a push subscription for the authenticated user.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys.auth' => 'required|string',
            'keys.p256dh' => 'required|string',
        ]);

        $user = $request->user();

        // Save/update push subscription using package trait method
        $user->updatePushSubscription(
            $request->endpoint,
            $request->keys['p256dh'],
            $request->keys['auth'],
            $request->content_encoding ?? 'aesgcm'
        );

        return response()->json([
            'success' => true,
            'message' => 'Subscription perangkat berhasil disimpan.'
        ], 200);
    }

    /**
     * Get the VAPID public key.
     */
    public function vapidKey(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('webpush.vapid.public_key')
        ], 200);
    }
}
