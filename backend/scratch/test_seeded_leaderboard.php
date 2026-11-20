<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\LeaderboardController;

$controller = app(LeaderboardController::class);
$req = Request::create('/api/leaderboard', 'GET');
$res = $controller->index($req);
$data = $res->getData()->data;

echo "Period: " . $data->periodLabel . "\n";
echo "Top Three:\n";
foreach ($data->topThree as $t) {
    echo "  #{$t->rank} {$t->name} ({$t->campus}) - {$t->points} pts [{$t->tier}] (Events: {$t->eventsAttended}, SBT: " . ($t->sbtVerified ? 'YES' : 'NO') . ")\n";
}

echo "Table Ranks (first 5):\n";
foreach (array_slice($data->tableRanks, 0, 5) as $t) {
    echo "  #{$t->rank} {$t->name} ({$t->campus}) - {$t->points} pts [{$t->tier}]\n";
}

echo "Current User Preview:\n";
echo "  {$data->currentUser->name} | Rank: {$data->currentUser->rank} | Points: {$data->currentUser->points} | Tier: {$data->currentUser->tier} | Next: {$data->currentUser->nextRankPoints} pts\n";
