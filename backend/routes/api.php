<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventDashboardController;
use App\Http\Controllers\Api\OrganizerEventController;

// PUBLIC ROUTES (GUEST)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/events/explore', [EventController::class, 'explore']); // Contoh melihat event tanpa login

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
        Route::get('/organizer/events/{id}', [EventController::class, 'show']);
        Route::get('/organizer/events-list', [OrganizerEventController::class, 'getOrgEvents']);

        Route::get('event-dashboard/{slug}/info-utama', [EventDashboardController::class, 'getGeneralInfo']);
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
});

// Route::apiResource('events', EventController::class);

// 1. Initialize event Draft

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
