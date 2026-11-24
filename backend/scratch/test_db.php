<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$hasTable = Illuminate\Support\Facades\Schema::hasTable('soulbound_tokens');
echo "Has soulbound_tokens: " . ($hasTable ? "YES\n" : "NO\n");

$users = Illuminate\Support\Facades\DB::table('users')->limit(3)->get(['id', 'name', 'email']);
echo "Users: " . json_encode($users, JSON_PRETTY_PRINT) . "\n";
