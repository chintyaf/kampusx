<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select('SHOW TABLES');
$tableNames = array_map(function($t) {
    return array_values((array)$t)[0];
}, $tables);

echo "Tables:\n" . implode(', ', $tableNames) . "\n";
