<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$cols = Schema::getColumnListing('users');
echo "Users columns: " . implode(', ', $cols) . "\n";

$hasTier = Schema::hasColumn('users', 'tier');
echo "Has tier column: " . ($hasTier ? 'YES' : 'NO') . "\n";
