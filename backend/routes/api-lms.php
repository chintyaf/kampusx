<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Lms\LearningPathController;
use App\Http\Controllers\Api\Lms\ModuleController;
use App\Http\Controllers\Api\Lms\LessonController;
use App\Http\Controllers\Api\Lms\QuizController;
use App\Http\Controllers\Api\Lms\LessonSkillController;
use App\Http\Controllers\Api\Lms\EnrollmentController;
use App\Http\Controllers\Api\Lms\LearningActivityController;
use App\Http\Controllers\Api\Lms\ReadinessPredictionController;
use App\Http\Controllers\Api\Lms\RecommendationController;
use App\Http\Controllers\Api\Lms\ExploreLmsController;
use App\Http\Controllers\Api\Lms\PublicLearningPathController;
use App\Http\Controllers\Api\Lms\LearnerLearningPathController;
use App\Http\Controllers\Api\Lms\LearningDashboardController;
use App\Http\Controllers\Api\Lms\CredentialApiController;
use App\Http\Controllers\Api\Lms\LearnerLessonViewController;
use App\Http\Controllers\Api\Lms\LearnerQuizController;
use App\Http\Controllers\Api\Lms\LearnerQuizResultController;
use App\Http\Controllers\Api\Lms\LearnerBadgeController;
use App\Http\Controllers\Api\Lms\SrlLearningSessionController;

// ====================================================
// LMS Microlearning
// ====================================================
Route::prefix('lms')->group(function () {

    // ------------------------------------------------
    // Public: Guest & Member
    // ------------------------------------------------
    Route::get('explore', [ExploreLmsController::class, 'index']);

    Route::prefix('public')->group(function () {
        Route::get('learning-paths/{id}', [PublicLearningPathController::class, 'show']);
        Route::get('learning-paths/{id}/content', [PublicLearningPathController::class, 'content']);
        Route::get('learning-paths/{id}/lessons/{lessonId}', [PublicLearningPathController::class, 'lesson']);
    });

    // ------------------------------------------------
    // Organizer
    // ------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:organizer,admin'])
        ->prefix('organizer')->group(function () {

            Route::apiResource('learning-paths', LearningPathController::class)
                ->except(['index', 'update']);

            Route::get('learning-paths', [
                LearningPathController::class,
                'organizerIndex'
            ]);

            // Update menggunakan POST (mendukung FormData)
            Route::post('learning-paths/{id}/update', [
                LearningPathController::class,
                'update'
            ]);
            Route::apiResource('modules', ModuleController::class);
            Route::apiResource('lessons', LessonController::class);
            Route::apiResource('quiz', QuizController::class);
            Route::apiResource('lesson-skills', LessonSkillController::class);
        });

    // ------------------------------------------------
    // Member: Requires Authentication
    // ------------------------------------------------
    Route::middleware('auth:sanctum')->prefix('member')->group(function () {

        Route::get('dashboard', [LearningDashboardController::class, 'index']);

        Route::get('learning-paths/{id}', [LearnerLearningPathController::class, 'show']);
        Route::get('learning-paths/{id}/progress', [LearnerLearningPathController::class, 'progress']);
        Route::get('learning-paths/{id}/achievements', [LearnerLearningPathController::class, 'achievements']);

        Route::post('lessons/{lessonId}/complete', [LearnerLearningPathController::class, 'completeLesson']);

        Route::apiResource('enrollments', EnrollmentController::class);
        Route::apiResource('learning-activities', LearningActivityController::class);
        Route::apiResource('readiness-predictions', ReadinessPredictionController::class);
        Route::apiResource('recommendations', RecommendationController::class);

        // Self-Regulated Learning (SRL) Sessions
        Route::prefix('srl-sessions')->group(function () {
            Route::get('active', [SrlLearningSessionController::class, 'active']);
            Route::post('/', [SrlLearningSessionController::class, 'store']);
            Route::patch('{srlLearningSession}/start', [SrlLearningSessionController::class, 'start']);
            Route::patch('{srlLearningSession}/progress', [SrlLearningSessionController::class, 'syncProgress']);
            Route::post('{srlLearningSession}/materials', [SrlLearningSessionController::class, 'trackMaterial']);
            Route::patch('{srlLearningSession}/reflect', [SrlLearningSessionController::class, 'reflect']);
            Route::patch('{srlLearningSession}/abandon', [SrlLearningSessionController::class, 'abandon']);
        });

        Route::post(
            'learning-paths/{learningPathId}/send-credential',
            [CredentialApiController::class, 'sendCredential']
        );

        Route::prefix('modules/{moduleId}')->group(function () {
            // Sidebar: info modul, daftar lesson, progress, info kuis
            Route::get('lessons', [LearnerLessonViewController::class, 'index']);

            // Konten lesson aktif + prev/next
            Route::get('lessons/{lessonId}', [LearnerLessonViewController::class, 'show']);

            // Tandai selesai (return progress untuk toast)
            Route::post('lessons/{lessonId}/complete', [LearnerLessonViewController::class, 'complete']);

            // di dalam Route::prefix('modules/{moduleId}')->group(...) milik 'member'
            Route::prefix('quiz')->group(function () {
                Route::get('/', [LearnerQuizController::class, 'show']);
                Route::post('start', [LearnerQuizController::class, 'start']);
                Route::get('attempts/{attemptId}', [LearnerQuizController::class, 'result']);
                Route::put('attempts/{attemptId}/answers', [LearnerQuizController::class, 'saveAnswer']);
                Route::post('attempts/{attemptId}/submit', [LearnerQuizController::class, 'submit']);
            });

            // Hasil Refleksi & Evaluasi setelah mengerjakan kuis
            Route::get('reflection', [LearnerQuizResultController::class, 'show']);

            // Quiz Result
            Route::get(
                '/quiz/result',
                [LearnerQuizResultController::class, 'show']
            );

            // Award Badge
            Route::post(
                '/badges/award',
                [LearnerBadgeController::class, 'award']
            );
        });
        // END Modules/modulesId
    });
});
