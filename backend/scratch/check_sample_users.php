<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::select('id', 'name', 'email', 'role', 'points')->take(5)->get();
echo json_encode($users, JSON_PRETTY_PRINT) . "\n";
