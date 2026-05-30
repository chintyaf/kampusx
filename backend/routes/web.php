<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/payment-sandbox/{order_id}', [\App\Http\Controllers\PaymentSimulatorController::class, 'showSandbox']);

// Admin payment logs dashboard (Dual-aliases supported - placed first to avoid wildcard collision)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/payment/dashboard', [PaymentController::class, 'dashboard']);
    Route::get('/admin/payment', [PaymentController::class, 'dashboard']);
});

// Simulator Payment Gateway Routes
Route::prefix('payment')->group(function () {
    Route::post('/create', [PaymentController::class, 'create']);
    Route::get('/{token}', [PaymentController::class, 'show']);
    Route::post('/{token}/confirm', [PaymentController::class, 'confirm']);
    Route::post('/{token}/cancel', [PaymentController::class, 'cancel']);
    Route::get('/{token}/status', [PaymentController::class, 'status']);
});

// Named login route to redirect guest browser requests to React frontend login page
Route::get('/login', function () {
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect()->away($frontendUrl . '/login');
})->name('login');

