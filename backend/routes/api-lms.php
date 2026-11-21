<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Lms\LearningPathController;
use App\Http\Controllers\Api\Lms\ModuleController;
use App\Http\Controllers\Api\Lms\LessonController;
use App\Http\Controllers\Api\Lms\QuizController;
use App\Http\Controllers\Api\Lms\SkillController;
use App\Http\Controllers\Api\Lms\LessonSkillController;
// use App\Http\Controllers\Api\Lms\AiContentController;
use App\Http\Controllers\Api\Lms\EnrollmentController;
use App\Http\Controllers\Api\Lms\SrlForethoughtController;
use App\Http\Controllers\Api\Lms\SrlReflectionController;
use App\Http\Controllers\Api\Lms\LearningActivityController;
use App\Http\Controllers\Api\Lms\ReadinessPredictionController;
use App\Http\Controllers\Api\Lms\RecommendationController;
use App\Http\Controllers\Api\LMS\LearningDashboardController;
use App\Http\Controllers\Api\LMS\CredentialApiController;

// ====================================================
// LMS Microlearning Management
// ====================================================
Route::prefix('lms')->group(function () {
    // ------------------------------------------------
    // Organizer: Manajemen Konten & Generative AI
    // ------------------------------------------------
    Route::middleware('role:organizer,admin')->prefix('organizer')->group(function () {
        Route::apiResource('learning-paths', LearningPathController::class);
        Route::apiResource('modules', ModuleController::class);
        Route::apiResource('lessons', LessonController::class);
        Route::apiResource('quiz', QuizController::class);
        Route::apiResource('lesson-skills', LessonSkillController::class);

        // Generative AI
        // Route::post('/ai/generate-module', [AiContentController::class, 'storeModule']);
        // Route::post('/modules/{module}/ai/generate-lesson', [AiContentController::class, 'storeLesson']);
    });

    // ------------------------------------------------
    // Member: Enrollment, Aktivitas SRL & Personalisasi
    // ------------------------------------------------
    Route::middleware('auth:sanctum')->prefix('member')->group(function () {
        Route::get('dashboard', [LearningDashboardController::class, 'index']);
        Route::apiResource('enrollments', EnrollmentController::class);

        Route::apiResource('learning-activities', LearningActivityController::class);
        Route::apiResource('readiness-predictions', ReadinessPredictionController::class);
        Route::apiResource('recommendations', RecommendationController::class);
    });

    // Learner Dashboard (Pusat Microlearning /learning)
    Route::get('/learner/dashboard', [LearningDashboardController::class, 'index']);


    // API Kredensial
    Route::post(
        '/learning-paths/{learningPathId}/send-credential',
        [CredentialApiController::class, 'sendCredential']
    );

});
