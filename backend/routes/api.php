<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\TicketController;

// Organizer Dashboard
// use App\Http\Controllers\Api\EventDashboardController;
use App\Http\Controllers\Api\OrganizerEventController;

// use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventDetailController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventSessionController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventSpeakerController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventGeneralInfoController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventLocationController;

use App\Http\Controllers\Api\EventTypeController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventDashboard\EventPublishController;
use App\Http\Controllers\Api\EventDashboard\EventStatusController;

// ==========================================
// 1. PUBLIC ROUTES (Bisa diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Landing Page & Explore Event
Route::get('/events', [EventController::class, 'index']); // Akan mengeksekusi index() di EventController
Route::get('/events/explore', [EventController::class, 'explore']);
Route::get('/events/{id}', [EventController::class, 'show']); // Akan mengeksekusi show() di EventController

Route::get('/test', function () {
    return response()->json("hallo", 200);
});


// ==========================================
// 2. PROTECTED ROUTES (Harus Login Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Ambil data user yang sedang login
    Route::get('/user/profile', function (Request $request) {
        return $request->user();
    });
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- ROLE: PARTICIPANT / UMUM ---
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/tickets/{ticket_code}', [TicketController::class, 'show']);
    Route::get('/my-tickets', [TicketController::class, 'index']);

    // --- ROLE: ORGANIZER & ADMIN ---
    Route::middleware('role:organizer,admin')->group(function () {

        // General Events (Create, Update, Delete)
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);

        // Group: Organizer Dashboard List
        Route::prefix('organizer')->group(function () {
            Route::get('/events-list', [OrganizerEventController::class, 'getOrgEvents']);
            // Untuk melihat detail spesifik milik organizer
            Route::get('/events/{id}', [OrganizerEventController::class, 'show']);
        });

        // Group: Event Dashboard (Manage Detail Event)
        Route::prefix('event-dashboard/{eventId}')->group(function () {
            // Detail Event
            Route::prefix('info-utama')->group(function () {
                // General Info
                Route::get('/', [EventGeneralInfoController::class, 'index']);
                Route::post('/update', [EventGeneralInfoController::class, 'update']);

                // Location
                Route::get('/location', [EventLocationController::class, 'index']);
                Route::post('/location', [EventLocationController::class, 'update']);

                // Session
                Route::get('/session', [EventSessionController::class, 'getSession']);
                Route::post('/session', [EventSessionController::class, 'setSession']);

                // Speaker
                Route::get('/speaker', [EventSpeakerController::class, 'index']);
                Route::post('/speaker', [EventSpeakerController::class, 'update']);
            });
        });

    // Mengecek apa saja data yang masih kurang (GET)
    Route::get('/events/{event}/check-status', [EventStatusController::class, 'checkStatus']);
    Route::post('/events/{event}/publish', [EventStatusController::class, 'publish']);

    });

    // --- ROLE: PANITIA (COMMITTEE) ---
    Route::middleware('role:committee,organizer')->group(function () {
        // Route::post('/attendance/scan', [AttendanceController::class, 'scanQr']);
    });

    // --- ROLE: ADMIN PUSAT ---
    Route::middleware('role:admin')->group(function () {
        // Route::post('/admin/approve-organizer/{id}', [AdminController::class, 'approveOrganizer']);
        // Route::post('/admin/suspend-user/{id}', [AdminController::class, 'suspendUser']);
    });
});


// Category
Route::get('/categories', [CategoryController::class, 'index']);

// Event Type
Route::get('/event-types', [EventTypeController::class, 'index']);

// Institution
Route::get('/institutions', [InstitutionController::class, 'index']);
