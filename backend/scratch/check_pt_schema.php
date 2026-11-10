<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "point_transactions: " . implode(', ', Schema::getColumnListing('point_transactions')) . "\n";
echo "soulbound_tokens: " . implode(', ', Schema::getColumnListing('soulbound_tokens')) . "\n";
