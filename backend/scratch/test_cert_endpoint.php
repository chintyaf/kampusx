<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $request = Illuminate\Http\Request::create('/api/certificates/CERT-2026-0041', 'GET');
    $response = $app->handle($request);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo $response->getContent() . "\n";
} catch (\Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
