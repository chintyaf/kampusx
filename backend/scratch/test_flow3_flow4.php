<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Controllers\Api\BanditRewardController;
use App\Http\Controllers\Api\Webhook\PaymentWebhookController;

echo "=== TEST FLOW 3: REWARD DECISION ENGINE (CONTEXTUAL BANDIT) ===\n";
$user = User::find(2);
$banditController = app(BanditRewardController::class);
$banditReq = Request::create('/api/checkout/bandit-reward/1', 'GET', ['ticketId' => 1]);
$banditReq->setUserResolver(fn() => $user);
$banditRes = $banditController->getPersonalizedReward($banditReq, 1);
echo "Bandit HTTP Status: " . $banditRes->getStatusCode() . "\n";
echo "Bandit Response Data:\n" . json_encode($banditRes->getData(), JSON_PRETTY_PRINT) . "\n";

echo "\n=== TEST FLOW 4: CHECKOUT & PAYMENT WEBHOOK SIMULATION ===\n";
$paymentController = app(PaymentWebhookController::class);
$orderReq = Request::create('/api/checkout/create-pending', 'POST', [
    'event_id' => 1,
    'name' => 'Participant KampusX',
    'email' => 'part@kampusx.com',
    'phone' => '081234567890',
    'amount' => 50000,
    'discount_amount' => 5000,
    'bonus_points' => 0,
]);
$orderReq->setUserResolver(fn() => $user);
$orderRes = $paymentController->createPendingOrder($orderReq);
$orderData = $orderRes->getData();
echo "Create Pending Order: " . $orderRes->getStatusCode() . " (Order ID: " . ($orderData->order_id ?? 'none') . ")\n";

$payReq = Request::create('/api/webhook/payment-success', 'POST', [
    'order_id' => $orderData->order_id,
    'payment_method' => 'qris'
]);
$payRes = $paymentController->paymentSuccess($payReq);
echo "Payment Webhook Status: " . $payRes->getStatusCode() . "\n";
echo "Payment Webhook Response Data:\n" . json_encode($payRes->getData(), JSON_PRETTY_PRINT) . "\n";

echo "\n=== FLOW 3 & 4 TEST COMPLETED ===\n";
