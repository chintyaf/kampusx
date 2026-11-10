<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing DB Connection...\n";
try {
    Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "DB Connection: OK\n";
    $userCount = App\Models\User::count();
    echo "User count: " . $userCount . "\n";
    $eventCount = App\Models\Event::count();
    echo "Event count: " . $eventCount . "\n";
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}

echo "Testing Redis Connection...\n";
try {
    $redis = Illuminate\Support\Facades\Redis::connection();
    $redis->set('test_key', 'kampusx_ok');
    $val = $redis->get('test_key');
    echo "Redis Connection: OK (Value: $val)\n";
} catch (Exception $e) {
    echo "Redis Error: " . $e->getMessage() . "\n";
}
