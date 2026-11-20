<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::select('id', 'name', 'email', 'role', 'points', 'tier')->get();
echo "Total users in DB: " . $users->count() . "\n";
foreach ($users as $u) {
    echo "- #{$u->id}: {$u->name} ({$u->email}) | Role: {$u->role} | Points: {$u->points} | Tier: {$u->tier}\n";
}
