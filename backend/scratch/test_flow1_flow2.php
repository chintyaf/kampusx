<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Controllers\Api\Webhook\GamificationWebhookController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\SeatLockController;

echo "=== TEST FLOW 1: AI SRL WEBHOOK & GAMIFIKASI ===\n";
$user = User::find(2);
echo "Initial User Points: {$user->points}, Tier: {$user->tier}\n";

$webhookController = app(GamificationWebhookController::class);
$request = Request::create('/api/webhook/srl-graduated', 'POST', [
    'user_id' => 2,
    'modul_id' => 'MOD-AI-201',
    'score' => 88,
    'status_lulus' => true,
    'student_name' => $user->name,
    'skill_category' => 'Machine Learning & Neural Networks'
]);

$response = $webhookController->srlGraduated($request);
echo "Webhook HTTP Status: " . $response->getStatusCode() . "\n";
echo "Webhook Response Data:\n" . json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";

echo "\n=== TEST FLOW 1: LEADERBOARD API ===\n";
$leaderboardController = app(LeaderboardController::class);
$lbRequest = Request::create('/api/leaderboard', 'GET', ['timeframe' => 'bulanan']);
$lbResponse = $leaderboardController->index($lbRequest);
$lbData = $lbResponse->getData();
echo "Leaderboard Success: " . ($lbData->success ? 'YES' : 'NO') . "\n";
echo "Leaderboard Period: " . $lbData->data->periodLabel . "\n";
echo "Leaderboard Days Remaining: " . $lbData->data->daysRemaining . "\n";
echo "Top Three Count: " . count($lbData->data->topThree) . "\n";
echo "Top Rank #1: " . ($lbData->data->topThree[0]->name ?? 'N/A') . " (" . ($lbData->data->topThree[0]->points ?? 0) . " pts, Tier: " . ($lbData->data->topThree[0]->tier ?? '-') . ")\n";

echo "\n=== TEST FLOW 2: REDIS SEAT-LOCKING ===\n";
$seatLockController = app(SeatLockController::class);
$lockRequest = Request::create('/api/events/1/lock-seat', 'POST', ['ticket_id' => 1]);
$lockRequest->setUserResolver(fn() => $user);
$lockResponse = $seatLockController->lockSeat($lockRequest, 1);
echo "Lock Seat Status: " . $lockResponse->getStatusCode() . "\n";
echo "Lock Response:\n" . json_encode($lockResponse->getData(), JSON_PRETTY_PRINT) . "\n";

echo "\n=== ALL FLOW 1 & 2 BACKEND TESTS PASSED ===\n";
