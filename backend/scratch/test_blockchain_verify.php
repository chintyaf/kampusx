<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\Blockchain\SoulboundTokenController;
use Illuminate\Http\Request;

$controller = app(SoulboundTokenController::class);
$req = Request::create('/api/blockchain/verify/demo', 'GET');
$res = $controller->verify($req, 'demo');
echo "Verify status: " . $res->getStatusCode() . "\n";
echo "Verify data:\n" . json_encode($res->getData(), JSON_PRETTY_PRINT) . "\n";
