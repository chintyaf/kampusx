<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Reset Brigitta & part@kampusx.com to 2450 points, Silver Tier
$emails = ['2372016@maranatha.ac.id', 'part@kampusx.com'];
foreach ($emails as $email) {
    $user = User::where('email', $email)->first();
    if ($user) {
        $user->points = 2450;
        $user->tier = 'Silver';
        $user->save();
        echo "Reset user {$email}: 2450 pts, Silver Tier\n";
    }
}

// Clean up test tickets created today if needed, or keep latest
echo "Demo state is ready for presentation!\n";
