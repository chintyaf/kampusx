<?php

require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = app(\App\Http\Controllers\Api\Blockchain\SoulboundTokenController::class);
$request = \Illuminate\Http\Request::create('/api/certificates/CERT-2026-0041', 'GET');
$response = $controller->getCertificateVerification($request, 'CERT-2026-0041');

echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
