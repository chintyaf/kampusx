<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * POST /payment/create
     * Create a new simulated transaction session.
     */
    public function create(Request $request)
    {
        $request->validate([
            'order_id'       => 'required|string',
            'amount'         => 'required|numeric|min:0',
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'item_name'      => 'required|string|max:255',
            'callback_url'   => 'nullable|url',
            'redirect_url'   => 'nullable|url',
        ]);

        $token = 'TKN-' . strtoupper(Str::random(16));
        $expiredAt = now()->addMinutes(15);

        // Build payment URL using environment or request host
        $baseUrl = config('app.payment_base_url') ?: url('/');
        $baseUrl = rtrim($baseUrl, '/');
        $paymentUrl = $baseUrl . '/payment/' . $token;

        $transaction = PaymentTransaction::create([
            'token'          => $token,
            'order_id'       => $request->order_id,
            'amount'         => $request->amount,
            'customer_name'  => $request->customer_name,
            'customer_email' => $request->customer_email,
            'item_name'      => $request->item_name,
            'status'         => 'pending',
            'callback_url'   => $request->callback_url,
            'redirect_url'   => $request->redirect_url,
            'expired_at'     => $expiredAt,
        ]);

        return response()->json([
            'payment_url' => $paymentUrl,
            'token'       => $token,
            'expired_at'  => $expiredAt->toIso8601String(),
        ], 201);
    }

    /**
     * GET /payment/{token}
     * Render standalone payment gateway simulator checkout portal.
     */
    public function show($token)
    {
        $transaction = PaymentTransaction::where('token', $token)->firstOrFail();

        // Check if transaction has expired by time
        if ($transaction->hasExpiredByTime()) {
            $transaction->update(['status' => 'expired']);
            $this->dispatchWebhook($transaction);
        }

        // Generate dynamic QR code matching the hosted payment URL (with QR source parameter to disable polling on scan)
        $qrSvg = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(180)
            ->margin(1)
            ->generate(url("/payment/{$transaction->token}?source=qr"));

        return view('payment.show', compact('transaction', 'qrSvg'));
    }

    public function confirm($token)
    {
        $transaction = PaymentTransaction::where('token', $token)->firstOrFail();

        if ($transaction->isPending()) {
            $transaction->update([
                'status'  => 'success',
                'paid_at' => now(),
            ]);

            $this->dispatchWebhook($transaction);
        }

        // Redirect the paying device back to the hosted payment portal to display the Success screen!
        return redirect()->to(url("/payment/{$token}"));
    }

    /**
     * POST /payment/{token}/cancel
     * Cancel simulation checkout, notify merchant, and redirect.
     */
    public function cancel($token)
    {
        $transaction = PaymentTransaction::where('token', $token)->firstOrFail();

        if ($transaction->isPending()) {
            $transaction->update([
                'status' => 'failed',
            ]);

            $this->dispatchWebhook($transaction);
        }

        // Redirect the device to the hosted payment portal to display the Cancelled screen!
        return redirect()->to(url("/payment/{$token}"));
    }

    /**
     * GET /payment/{token}/status
     * Return transaction status JSON for React client polling.
     */
    public function status($token)
    {
        $transaction = PaymentTransaction::where('token', $token)->firstOrFail();

        // Check if expired dynamically on poll
        if ($transaction->hasExpiredByTime()) {
            $transaction->update(['status' => 'expired']);
            $this->dispatchWebhook($transaction);
        }

        return response()->json([
            'order_id'       => $transaction->order_id,
            'status'         => $transaction->status,
            'token'          => $transaction->token,
            'amount'         => (float) $transaction->amount,
            'customer_name'  => $transaction->customer_name,
            'customer_email' => $transaction->customer_email,
            'item_name'      => $transaction->item_name,
            'expired_at'     => $transaction->expired_at ? $transaction->expired_at->toIso8601String() : null,
            'paid_at'        => $transaction->paid_at ? $transaction->paid_at->toIso8601String() : null,
        ]);
    }

    /**
     * GET /admin/payment
     * Admin payment transactions monitor dashboard.
     */
    public function dashboard()
    {
        $transactions = PaymentTransaction::orderBy('created_at', 'desc')->paginate(15);

        // Core metric stats
        $totalVolume = PaymentTransaction::where('status', 'success')->sum('amount');
        $successCount = PaymentTransaction::where('status', 'success')->count();
        $totalCount = PaymentTransaction::count();
        $successRate = $totalCount > 0 ? ($successCount / $totalCount) * 100 : 0;
        $pendingCount = PaymentTransaction::pending()->count();

        return view('payment.dashboard', compact(
            'transactions', 
            'totalVolume', 
            'successRate', 
            'pendingCount', 
            'totalCount'
        ));
    }

    /**
     * GET /api/admin/payment
     * API format of admin payment logs for React frontend.
     */
    public function apiDashboard()
    {
        $transactions = PaymentTransaction::orderBy('created_at', 'desc')->get();

        // Core metric stats
        $totalVolume = PaymentTransaction::where('status', 'success')->sum('amount');
        $successCount = PaymentTransaction::where('status', 'success')->count();
        $totalCount = PaymentTransaction::count();
        $successRate = $totalCount > 0 ? ($successCount / $totalCount) * 100 : 0;
        $pendingCount = PaymentTransaction::pending()->count();

        return response()->json([
            'transactions' => $transactions,
            'metrics' => [
                'total_volume' => (float) $totalVolume,
                'success_rate' => (float) $successRate,
                'pending_count' => $pendingCount,
                'total_count' => $totalCount,
            ]
        ]);
    }

    /**
     * Force expiration check of all pending transactions past their expired_at date.
     */
    public function expire()
    {
        $now = now();
        $expiredCount = 0;

        $pending = PaymentTransaction::pending()
            ->where('expired_at', '<', $now)
            ->get();

        foreach ($pending as $transaction) {
            $transaction->update(['status' => 'expired']);
            $this->dispatchWebhook($transaction);
            $expiredCount++;
        }

        return $expiredCount;
    }

    /**
     * Internal helper to dispatch signed Webhooks to the merchant callback_url.
     */
    protected function dispatchWebhook(PaymentTransaction $transaction)
    {
        if (!$transaction->callback_url) {
            return;
        }

        $payload = [
            'order_id' => $transaction->order_id,
            'status'   => $transaction->status,
            'token'    => $transaction->token,
            'amount'   => (float) $transaction->amount,
            'paid_at'  => $transaction->paid_at ? $transaction->paid_at->toIso8601String() : null,
        ];

        $jsonPayload = json_encode($payload);
        $secretKey = config('app.payment_secret_key');
        $signature = hash_hmac('sha256', $jsonPayload, $secretKey);

        try {
            Http::withHeaders([
                'X-Simulator-Signature' => $signature,
                'Content-Type'          => 'application/json',
                'Accept'                => 'application/json',
            ])->timeout(5)->post($transaction->callback_url, $payload);
            
            Log::info("Webhook sent successfully for token {$transaction->token} with signature {$signature}");
        } catch (\Exception $e) {
            Log::error("Webhook delivery failed for token {$transaction->token}: " . $e->getMessage());
        }
    }
}
