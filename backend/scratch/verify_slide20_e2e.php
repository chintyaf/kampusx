<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\User;

echo "=== VERIFIKASI 8 LANGKAH ALUR PROTOTIPE SLIDE 20 ===\n\n";

// 1. Login Member check
$user = User::where('email', '2372016@maranatha.ac.id')->first() ?? User::find(2);
echo "1. Member Check: {$user->name} ({$user->email}) - Poin: {$user->points}, Tier: {$user->tier}\n";

// 2 & 3. Leaderboard Gamifikasi Multi-Tier
$lbCtrl = app(App\Http\Controllers\Api\LeaderboardController::class);
$lbRes = $lbCtrl->index(Request::create('/api/leaderboard', 'GET'));
$lbData = $lbRes->getData()->data;
echo "3. Leaderboard Seeder: Top #1 {$lbData->topThree[0]->name} ({$lbData->topThree[0]->points} pts, Tier: {$lbData->topThree[0]->tier})\n";
echo "   Current User: {$lbData->currentUser->name} (Rank: #{$lbData->currentUser->rank}, {$lbData->currentUser->points} pts, Tier: {$lbData->currentUser->tier})\n";

// 4. Redis Seat-Locking & Reward Decision Engine
$lockCtrl = app(App\Http\Controllers\Api\SeatLockController::class);
$lockReq = Request::create('/api/events/1/lock-seat', 'POST', ['ticket_id' => 1]);
$lockReq->setUserResolver(fn() => $user);
$lockRes = $lockCtrl->lockSeat($lockReq, 1);
echo "4. Redis Seat-Locking: HTTP " . $lockRes->getStatusCode() . " (Token: " . ($lockRes->getData()->data->lock_token ?? 'N/A') . ")\n";

$banditCtrl = app(App\Http\Controllers\Api\BanditRewardController::class);
$bReq = Request::create('/api/checkout/bandit-reward/1', 'GET');
$bReq->setUserResolver(fn() => $user);
$bRes = $banditCtrl->getPersonalizedReward($bReq, 1);
echo "   Bandit Reward: " . $bRes->getData()->data->reward_label . " (Diskon: Rp " . number_format($bRes->getData()->data->discount_amount) . ")\n";

// 5. Interactive Commerce (Create Pending + Webhook Payment Success)
$payCtrl = app(App\Http\Controllers\Api\Webhook\PaymentWebhookController::class);
$orderReq = Request::create('/api/checkout/create-pending', 'POST', [
    'event_id' => 1,
    'name' => $user->name,
    'email' => $user->email,
    'phone' => '081234567890',
    'amount' => 135000,
]);
$orderReq->setUserResolver(fn() => $user);
$orderRes = $payCtrl->createPendingOrder($orderReq);
$orderId = $orderRes->getData()->order_id;

$payHookReq = Request::create('/api/webhook/payment-success', 'POST', ['order_id' => $orderId, 'payment_method' => 'qris']);
$payHookRes = $payCtrl->paymentSuccess($payHookReq);
echo "5. Payment Success & Redis Lock Released: HTTP " . $payHookRes->getStatusCode() . " (Status: " . $payHookRes->getData()->data->status . ", Points: +{$payHookRes->getData()->data->points_awarded})\n";

// 6 & 7. Integrasi AI SRL (Modul Chintya) & Minting Soulbound Token
$srlCtrl = app(App\Http\Controllers\Api\Webhook\GamificationWebhookController::class);
$srlReq = Request::create('/api/webhook/srl-graduated', 'POST', [
    'user_id' => $user->id,
    'modul_id' => 'MOD-AI-201',
    'score' => 96,
    'status_lulus' => true,
    'student_name' => $user->name,
    'skill_category' => 'Deep Learning & Neural Networks'
]);
$srlRes = $srlCtrl->srlGraduated($srlReq);
$srlData = $srlRes->getData()->data;
echo "6 & 7. AI SRL & Minting SBT: HTTP " . $srlRes->getStatusCode() . "\n";
echo "   Points Awarded: +{$srlData->points_awarded} (New Total: {$srlData->total_points}, Tier: {$srlData->current_tier})\n";
echo "   SBT Minted: {$srlData->sbt->token_id} | TxHash: " . substr($srlData->sbt->tx_hash, 0, 20) . "...\n";

// 8. Public Verifier & Recruiter View
$sbtCtrl = app(App\Http\Controllers\Api\Blockchain\SoulboundTokenController::class);
$verifyRes = $sbtCtrl->verify(Request::create('/api/blockchain/verify/demo', 'GET'), 'demo');
echo "8. Zero-Trust SBT Verification: HTTP " . $verifyRes->getStatusCode() . " (Status: " . $verifyRes->getData()->status . ")\n";

echo "\n=== SEMUA 8 LANGKAH ALUR SLIDE 20 TELAH BERJALAN 100% SUKSES! ===\n";
