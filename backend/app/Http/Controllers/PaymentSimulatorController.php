<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class PaymentSimulatorController extends Controller
{
    /**
     * GET /payment-sandbox/{order_id}
     * Render the Blade view for payment simulation.
     */
    public function showSandbox($order_id)
    {
        $order = Order::where('order_id', $order_id)
            ->with(['user', 'event'])
            ->firstOrFail();

        return view('payment-sandbox', compact('order'));
    }
}
