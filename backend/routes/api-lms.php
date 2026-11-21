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

// ====================================================
// LMS Microlearning Management
// ====================================================
Route::prefix('lms')->group(function () {
    // ------------------------------------------------
    // Organizer: Manajemen Konten & Generative AI
    // ------------------------------------------------
    Route::prefix('organizer')->group(function () {
        Route::apiResource('learning-paths', LearningPathController::class);
        Route::apiResource('modules', ModuleController::class);
        Route::apiResource('lessons', LessonController::class);
        Route::apiResource('quiz', QuizController::class);
        Route::apiResource('skills', SkillController::class);
        Route::apiResource('lesson-skills', LessonSkillController::class);

        // Generative AI
        // Route::post('/ai/generate-module', [AiContentController::class, 'storeModule']);
        // Route::post('/modules/{module}/ai/generate-lesson', [AiContentController::class, 'storeLesson']);
    });

    // ------------------------------------------------
    // Member: Enrollment, Aktivitas SRL & Personalisasi
    // ------------------------------------------------
    Route::prefix('member')->group(function () {
        Route::apiResource('enrollments', EnrollmentController::class);

        Route::apiResource('srl-forethoughts', SrlForethoughtController::class);
        Route::apiResource('srl-reflections', SrlReflectionController::class);
        Route::apiResource('learning-activities', LearningActivityController::class);
        Route::apiResource('readiness-predictions', ReadinessPredictionController::class);
        Route::apiResource('recommendations', RecommendationController::class);
    });

});
