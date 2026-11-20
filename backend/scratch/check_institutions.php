<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Institution;

$inst = Institution::take(10)->get(['id', 'name']);
echo "Institutions (" . $inst->count() . "):\n";
foreach ($inst as $i) {
    echo "- ID {$i->id}: {$i->name}\n";
}
