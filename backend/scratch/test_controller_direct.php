<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = $app->make(\App\Http\Controllers\Api\Blockchain\SoulboundTokenController::class);
    $req = \Illuminate\Http\Request::create('/api/certificates/CERT-2026-0041', 'GET');
    $res = $controller->getCertificateVerification($req, 'CERT-2026-0041');
    echo "Controller Success: " . json_encode($res->getData(), JSON_PRETTY_PRINT) . "\n";
} catch (\Throwable $e) {
    echo "Controller Exception: " . $e->getMessage() . "\n" . $e->getFile() . ":" . $e->getLine() . "\n";
}
