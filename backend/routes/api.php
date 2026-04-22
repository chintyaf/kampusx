<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\EventMaterialController;

// Organizer Dashboard
// use App\Http\Controllers\Api\EventDashboardController;
use App\Http\Controllers\Api\OrganizerEventController;

// use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventDetailController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventSessionController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventSpeakerController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventGeneralInfoController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventLocationController;
use App\Http\Controllers\Api\EventDashboard\EventParticipantController;

use App\Http\Controllers\Api\EventTypeController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventDashboard\EventStatusController;

// ==========================================
// 1. PUBLIC ROUTES (Bisa diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendOtp']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/verify-otp', [PasswordResetController::class, 'verifyOtp']);
// Landing Page & Explore Event


Route::get('/events/nearest', [EventController::class, 'getNearest']);


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

    // Event


    // --- ROLE: PARTICIPANT / UMUM ---
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/tickets/{ticket_code}', [TicketController::class, 'show']);
    Route::get('/tickets/{ticket_code}/qr-string', [TicketController::class, 'generateQrHash']);
    Route::get('/my-tickets', [TicketController::class, 'index']);
    Route::get('/events/{id}/materials', [EventMaterialController::class, 'index']);

    // Mendaftar jadi Organizer
    Route::post('/organizer-requests/apply', [\App\Http\Controllers\Api\OrganizerRequestController::class, 'apply']);

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

            // Post-event Material Management
            Route::get('/events/{id}/materials', [EventMaterialController::class, 'organizerIndex']);
            Route::post('/events/{id}/materials', [EventMaterialController::class, 'store']);
            Route::delete('/events/{id}/materials/{materialId}', [EventMaterialController::class, 'destroy']);
        });

        // Endpoint: Organizer Kelola Tim Institusinya (Manage Institution Member)
        Route::get('/institutions/{id}/members', [\App\Http\Controllers\Api\InstitutionMemberController::class, 'index']);
        Route::post('/institutions/{id}/members', [\App\Http\Controllers\Api\InstitutionMemberController::class, 'store']);
        Route::delete('/institutions/{id}/members/{userId}', [\App\Http\Controllers\Api\InstitutionMemberController::class, 'destroy']);

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

            // Dashboard Overview
            Route::get('/overview', [\App\Http\Controllers\Api\EventDashboardController::class, 'getOverview']);

            // Participant / Ticket holders route
            Route::get('/daftar-peserta', [EventParticipantController::class, 'index']);
        });

    // Mengecek apa saja data yang masih kurang (GET)
    Route::get('/events/{event}/status', [EventStatusController::class, 'index']);
    Route::post('/events/{event}/status', [EventStatusController::class, 'update']);

    Route::get('/events/{event}/check-status', [EventStatusController::class, 'getMissingData']);

    Route::post('/events/{event}/publish', [EventStatusController::class, 'updatePublish']);
    Route::post('/events/{event}/draft', [EventStatusController::class, 'updateDraft']);
    Route::post('/events/{event}/artchived', [EventStatusController::class, 'updateArchive']);


    });

    // --- ROLE: PANITIA (COMMITTEE) ---
    Route::middleware('role:committee,organizer')->group(function () {
        // Cek apakah user yang login berhak melihat halaman Scanner
        Route::get('/scanner/check-access', function (Request $request) {
            return response()->json([
                'success' => true,
                'message' => 'Berhak mengakses scanner',
                'user_role' => $request->user()->role ?? null
            ], 200);
        });

        // 1. Validasi Scanner & 3. Manual Insert & 2. Search Manual
        Route::post('/attendance/scan', [AttendanceController::class, 'scanQr']);
        Route::post('/attendance/manual', [AttendanceController::class, 'manualOverride']);
        Route::get('/ticket/search', [AttendanceController::class, 'searchTicket']);
    });

    // --- ROLE: ADMIN PUSAT ---
    Route::middleware('role:admin')->group(function () {
        // 1. Organizer Management
        Route::post('/admin/organizer-requests/{id}/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveOrganizer']);
        
        // 2. User Status Management
        Route::post('/admin/users/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'changeUserStatus']);
        
        // 3. Event Monitoring
        Route::get('/admin/events', [\App\Http\Controllers\Api\AdminController::class, 'getEvents']);
        
        // 4. Featured/Boost Event
        // 4. Featured/Boost Event
        Route::post('/admin/events/{id}/feature', [\App\Http\Controllers\Api\AdminController::class, 'toggleFeatureEvent']);

        // 5. Create Institutions
        Route::get('/admin/institutions', [\App\Http\Controllers\Api\AdminInstitutionController::class, 'index']);
        Route::post('/admin/institutions', [\App\Http\Controllers\Api\AdminInstitutionController::class, 'store']);
        Route::put('/admin/institutions/{id}', [\App\Http\Controllers\Api\AdminInstitutionController::class, 'update']);
        Route::delete('/admin/institutions/{id}', [\App\Http\Controllers\Api\AdminInstitutionController::class, 'destroy']);

        // 6. Master Data Kategori
        Route::post('/admin/categories', [\App\Http\Controllers\Api\CategoryController::class, 'store']);
        Route::put('/admin/categories/{id}', [\App\Http\Controllers\Api\CategoryController::class, 'update']);
        Route::delete('/admin/categories/{id}', [\App\Http\Controllers\Api\CategoryController::class, 'destroy']);

        // 7. Master Data Tipe Event
        Route::post('/admin/event-types', [\App\Http\Controllers\Api\EventTypeController::class, 'store']);
        Route::put('/admin/event-types/{id}', [\App\Http\Controllers\Api\EventTypeController::class, 'update']);
        Route::delete('/admin/event-types/{id}', [\App\Http\Controllers\Api\EventTypeController::class, 'destroy']);
    });

    // 4. Klaim Poin Engagement (Peserta)
    Route::post('/engagement/claim', [EngagementController::class, 'claimPoints']);
});


// Category
Route::get('/categories', [CategoryController::class, 'index']);

// Event Type
Route::get('/event-types', [EventTypeController::class, 'index']);

// Institution
Route::get('/institutions', [InstitutionController::class, 'index']);
