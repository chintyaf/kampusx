<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Middleware
use App\Http\Middleware\CheckEventOrganizer;

// Api Controllers
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\EventMaterialController;
use App\Http\Controllers\Api\OrganizerEventController;
use App\Http\Controllers\Api\EventTypeController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminInstitutionController;
use App\Http\Controllers\Api\OrganizerRequestController;
use App\Http\Controllers\Api\InstitutionMemberController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\NotificationController;

// Event Dashboard Controllers
use App\Http\Controllers\Api\EventDashboardController;
use App\Http\Controllers\Api\EventDashboard\EventParticipantController;
use App\Http\Controllers\Api\EventDashboard\EventStationController;
use App\Http\Controllers\Api\EventDashboard\EventStatusController;
use App\Http\Controllers\Api\EventDashboard\CertificateController;

// Event Dashboard Detail Controllers
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventSessionController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventSpeakerController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventGeneralInfoController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventLocationController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\EventTicketController;
use App\Http\Controllers\Api\EventDashboard\DetailEvent\SessionMaterialController;


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

// Certificate Public Verification & Rendering
Route::get('/certificate/verify/{ticket_code}', [App\Http\Controllers\Api\EventDashboard\CertificateController::class, 'verifyCertificate']);
Route::get('/certificate/render/{ticket_code}', [App\Http\Controllers\Api\EventDashboard\CertificateController::class, 'getCertificateRenderData']);

Route::get('/test', function () {
    return response()->json('hallo', 200);
});


// ==========================================
// 2. PROTECTED ROUTES (Harus Login Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Ambil data user yang sedang login
    Route::get('/user/profile', function (Request $request) {
        $user = $request->user();
        if ($user) {
            $user->checkAndDemoteIfExpired();
        }
        return $user;
    });
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        if ($user) {
            $user->checkAndDemoteIfExpired();
        }
        return $user;
    });

    // --- NOTIFICATIONS ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // ==========================================
    // --- ROLE: PARTICIPANT / UMUM ---
    // ==========================================
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/tickets/{ticket_code}', [TicketController::class, 'show']);
    Route::get('/tickets/{ticket_code}/qr-string', [TicketController::class, 'generateQrHash']);
    Route::get('/my-tickets', [TicketController::class, 'index']);
    Route::get('/events/{id}/materials', [EventMaterialController::class, 'index']);
    Route::get('/events/{id}/survey', [\App\Http\Controllers\Api\SurveyController::class, 'getSurveyDetails']);
    Route::post('/events/{id}/survey', [\App\Http\Controllers\Api\SurveyController::class, 'submitSurvey']);

    // Mendaftar jadi Organizer
    Route::get('/organizer-requests/status', [OrganizerRequestController::class, 'checkStatus']);
    Route::post('/organizer-requests/apply', [OrganizerRequestController::class, 'apply']);


    // ==========================================
    // --- ROLE: ORGANIZER & ADMIN ---
    // ==========================================
    Route::middleware('role:organizer,admin')->group(function () {

        // General Events (Create, Update, Delete)
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update'])->middleware(CheckEventOrganizer::class);
        Route::delete('/events/{id}', [EventController::class, 'destroy'])->middleware(CheckEventOrganizer::class);
        Route::get('/events/{id}/check-organizer', [EventController::class, 'checkOrganizer']);

        // Group: Organizer Dashboard List
        Route::prefix('organizer')->group(function () {
            Route::get('/events-list', [OrganizerEventController::class, 'getOrgEvents']);
            // Untuk melihat detail spesifik milik organizer
            Route::get('/events/{id}', [OrganizerEventController::class, 'show']);

            // Post-event Material Management
            Route::get('/events/{id}/materials', [EventMaterialController::class, 'organizerIndex'])->middleware(CheckEventOrganizer::class);
            Route::post('/events/{id}/materials', [EventMaterialController::class, 'store'])->middleware(CheckEventOrganizer::class);
            Route::delete('/events/{id}/materials/{materialId}', [EventMaterialController::class, 'destroy'])->middleware(CheckEventOrganizer::class);
        });

        // Endpoint: Organizer Kelola Tim Institusinya (Manage Institution Member)
        Route::get('/institutions/{id}/members', [InstitutionMemberController::class, 'index']);
        Route::post('/institutions/{id}/members', [InstitutionMemberController::class, 'store']);
        Route::delete('/institutions/{id}/members/{userId}', [InstitutionMemberController::class, 'destroy']);

        // Group: Event Dashboard (Manage Detail Event)
        Route::delete('/events/{id}/materials/{materialId}', [EventMaterialController::class, 'destroy'])->middleware(CheckEventOrganizer::class);

        // Status Event (Mengecek kekurangan, Publish, Draft, Archive)
        Route::get('/events/{event}/status', [EventStatusController::class, 'index'])->middleware(CheckEventOrganizer::class);
        Route::post('/events/{event}/status', [EventStatusController::class, 'update'])->middleware(CheckEventOrganizer::class);
        Route::get('/events/{event}/check-status', [EventStatusController::class, 'getMissingData'])->middleware(CheckEventOrganizer::class);
        Route::post('/events/{event}/publish', [EventStatusController::class, 'updatePublish'])->middleware(CheckEventOrganizer::class);
        Route::post('/events/{event}/draft', [EventStatusController::class, 'updateDraft'])->middleware(CheckEventOrganizer::class);
        Route::post('/events/{event}/artchived', [EventStatusController::class, 'updateArchive'])->middleware(CheckEventOrganizer::class);


            // Group: Event Dashboard
        Route::prefix('event-dashboard/{eventId}')
        ->middleware([CheckEventOrganizer::class]) // Pindahkan middleware ke sini agar melindungi semua route di dalamnya
        ->group(function () {

            // 1. Detail Event (Info Utama)
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

                // Tickets
                Route::get('/tickets', [EventTicketController::class, 'index']);
                Route::post('/tickets', [EventTicketController::class, 'update']);
            });

            // 2. Dashboard Overview
            Route::get('/overview', [EventDashboardController::class, 'getOverview']);

            // 3. Participant / Ticket holders route
            Route::get('/daftar-peserta', [EventParticipantController::class, 'index']);

            // 4. Event Stations
            Route::get('/stations', [EventStationController::class, 'index']);
            Route::post('/stations', [EventStationController::class, 'store']);
            // Saran: Ubah {id} menjadi {stationId} agar tidak bingung dengan {eventId} milik parent route
            Route::put('/stations/{id}', [EventStationController::class, 'update']);
            Route::delete('/stations/{id}', [EventStationController::class, 'destroy']);

            // 5. Certificate Design Template
            Route::get('/certificate', [CertificateController::class, 'show']);
            Route::get('/certificate/background-file', [CertificateController::class, 'getBackground']);
            Route::post('/certificate', [CertificateController::class, 'storeTemplate']);
            Route::post('/certificate/upload-background', [CertificateController::class, 'uploadBackground']);
            Route::delete('/certificate', [CertificateController::class, 'destroy']);

            // 6. Post-Event Session Materials
            Route::prefix('post-event')->group(function () {
                Route::get('/sessions', [SessionMaterialController::class, 'getSessionsWithMaterials']);
                Route::put('/sessions/{sessionId}/status', [SessionMaterialController::class, 'updateSessionStatus']);
                Route::post('/sessions/{sessionId}/materials', [SessionMaterialController::class, 'storeMaterial']);
                Route::delete('/sessions/{sessionId}/materials/{materialId}', [SessionMaterialController::class, 'destroyMaterial']);
                Route::post('/sessions/{sessionId}/materials/reorder', [SessionMaterialController::class, 'reorderMaterials']);
            });

            // 7. Survey Analytics (Organizer view of participant responses)
            Route::get('/survey-analytics', [\App\Http\Controllers\Api\SurveyController::class, 'getOrganizerAnalytics']);

            // 8. Survey Form Builder (Organizer CRUD — create/manage custom survey)
            Route::prefix('survey-form')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\EventDashboard\SurveyFormController::class, 'show']);
                Route::post('/', [\App\Http\Controllers\Api\EventDashboard\SurveyFormController::class, 'store']);
                Route::put('/{surveyId}', [\App\Http\Controllers\Api\EventDashboard\SurveyFormController::class, 'update']);
                Route::put('/{surveyId}/questions', [\App\Http\Controllers\Api\EventDashboard\SurveyFormController::class, 'syncQuestions']);
                Route::delete('/{surveyId}', [\App\Http\Controllers\Api\EventDashboard\SurveyFormController::class, 'destroy']);
            });
        });
    });

    // [Route EventStatusController telah dipindahkan ke dalam group role:organizer,admin agar aman dari akses partisipan]
});

// ==========================================
// --- ROLE: PANITIA (COMMITTEE) ---
// ==========================================
Route::middleware(['auth:sanctum', 'role:committee,organizer'])->group(function () {
    // Cek apakah user yang login berhak melihat halaman Scanner
    Route::get('/scanner/check-access', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Berhak mengakses scanner',
            'user_role' => $request->user()->role ?? null,
        ], 200);
    });

    // 1. Validasi Scanner & 3. Manual Insert & 2. Search Manual
    Route::post('/attendance/scan', [AttendanceController::class, 'scanQr']);
    Route::post('/attendance/manual', [AttendanceController::class, 'manualOverride']);
    Route::get('/ticket/search', [AttendanceController::class, 'searchTicket']);
});

// ==========================================
// --- ROLE: ADMIN PUSAT ---
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // 0. Dashboard Overview
    Route::get('/admin/dashboard-overview', [AdminController::class, 'getDashboardOverview']);

    // 1. Organizer Management
    Route::get('/admin/organizer-requests', [AdminController::class, 'getOrganizerRequests']);
    Route::post('/admin/organizer-requests/{id}/approve', [AdminController::class, 'approveOrganizer']);


    // 2. User Status Management
    Route::post('/admin/users/{id}/status', [AdminController::class, 'changeUserStatus']);

    // 3. Event Monitoring
    Route::get('/admin/events', [AdminController::class, 'getEvents']);

    // 4. Featured/Boost Event
    Route::post('/admin/events/{id}/feature', [AdminController::class, 'toggleFeatureEvent']);

    // 5. Create Institutions
    Route::get('/admin/institutions', [AdminInstitutionController::class, 'index']);
    Route::post('/admin/institutions', [AdminInstitutionController::class, 'store']);
    Route::put('/admin/institutions/{id}', [AdminInstitutionController::class, 'update']);
    Route::delete('/admin/institutions/{id}', [AdminInstitutionController::class, 'destroy']);

    // 6. Master Data Kategori
    Route::post('/admin/categories', [CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

    // 7. Master Data Tipe Event
    Route::post('/admin/event-types', [EventTypeController::class, 'store']);
    Route::put('/admin/event-types/{id}', [EventTypeController::class, 'update']);
    Route::delete('/admin/event-types/{id}', [EventTypeController::class, 'destroy']);

    // 8. User Management CRUD
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    Route::resource('categories', CategoryController::class);
    Route::resource('event-types', EventTypeController::class);
    Route::resource('institutions', InstitutionController::class);


});


// ==========================================
// 3. MISC / GLOBAL ENDPOINTS
// ==========================================

// Klaim Poin Engagement (Peserta)
Route::post('/engagement/claim', [EngagementController::class, 'claimPoints']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('event-types', [EventTypeController::class, 'index']);
Route::get('institutions', [InstitutionController::class, 'index']);
