<?php

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\TicketController;

// PUBLIC ROUTES (GUEST)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/events/explore', [EventController::class, 'explore']); // Contoh melihat event tanpa login
Route::apiResource('events', EventController::class);
// PROTECTED ROUTES (Harus Login)
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', function (Request $request) {
        return $request->user(); // Untuk mengambil data user login di SPA
    });

    // 1. ROLE: MEMBER / PARTICIPANT
    Route::middleware('role:participant,organizer,admin')->group(function () {
        // Participant bisa akses ini, organizer & admin juga boleh (opsional)
        // Route::post('/events/{id}/checkout', [OrderController::class, 'checkout']);
        // Route::get('/my-tickets', [TicketController::class, 'inventory']);
    });

    // 2. ROLE: ORGANIZER
    Route::middleware('role:organizer,admin')->group(function () {
        Route::post('/events', [EventController::class, 'store']);

        // Route::post('/events/create', [EventController::class, 'store']);
        // Route::get('/organizer/dashboard', [OrganizerController::class, 'dashboard']);
    });

    // 3. ROLE: PANITIA (COMMITTEE)
    Route::middleware('role:committee,organizer')->group(function () {
        // Route::post('/attendance/scan', [AttendanceController::class, 'scanQr']);
    });

    // 4. ROLE: ADMIN PUSAT
    Route::middleware('role:admin')->group(function () {
        // Route::post('/admin/approve-organizer/{id}', [AdminController::class, 'approveOrganizer']);
        // Route::post('/admin/suspend-user/{id}', [AdminController::class, 'suspendUser']);
    });

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/tickets/{ticket_code}', [TicketController::class, 'show']);
    Route::get('/my-tickets', [TicketController::class, 'index']);
});

// Route::apiResource('events', EventController::class);

// 1. Initialize event Draft

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Endpoint sederhana untuk mengambil semua event (beserta nama organizernya)
Route::get('/events', function () {
    // Mengambil event beserta relasi organizer (user)
    return Event::with('organizer')->get(); 
});