<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/payment-sandbox/{order_id}', [\App\Http\Controllers\PaymentSimulatorController::class, 'showSandbox']);
