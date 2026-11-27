<?php

use App\Http\Controllers\Api\JobMatching\PublicJobMatchingController;
use App\Http\Controllers\Api\LMS\SkillController;
use App\Http\Controllers\Api\PublicSkillController;

Route::get('/public/skills', [PublicSkillController::class, 'index']);
Route::apiResource('skills', SkillController::class);
Route::post('/job-matching/search', [PublicJobMatchingController::class, 'search']);

// // 6. RECRUITER VIEW (Vector Skill-Matrix & Zero-Trust Verification)
// Route::prefix('recruiter')->group(function () {
//     Route::get('/dashboard', [\App\Http\Controllers\Api\RecruiterController::class, 'dashboard']);
//     Route::get('/candidates', [\App\Http\Controllers\Api\RecruiterController::class, 'candidates']);
//     Route::get('/candidates/{id}', [\App\Http\Controllers\Api\RecruiterController::class, 'show']);
//     Route::post('/skill-match', [\App\Http\Controllers\Api\RecruiterController::class, 'skillMatch']);
// });

// // ------------------------------------------------
// // Recruiter (Guest): Job Matching - Recruiter mencari Member
// // Tanpa akun; akses ke pencarian memakai header X-Search-Token.
// // ------------------------------------------------
// Route::prefix('recruiter/job-searches')->group(function () {
//     // Buat pencarian + skill yang dibutuhkan (mengembalikan access_token)
//     Route::post('/', [JobMatchingController::class, 'store'])->middleware('throttle:10,1');

//     // Hitung cosine similarity on-the-fly (top 10, tidak disimpan)
//     Route::get('{id}/match', [JobMatchingController::class, 'match'])->middleware('throttle:30,1');

//     // Simpan kandidat pilihan + snapshot skor
//     Route::post('{id}/shortlist', [JobMatchingController::class, 'shortlist'])->middleware('throttle:30,1');

//     // Daftar kandidat yang sudah di-shortlist
//     Route::get('{id}/shortlists', [JobMatchingController::class, 'shortlists'])->middleware('throttle:30,1');
// });


// // ==========================================
// // JOB MATCHING & RECRUITER VIEW - RUMUSAN MASALAH 4
// // ==========================================
// Route::post('/v1/talents/matching', [\App\Http\Controllers\Api\JobMatching\JobMatchingController::class, 'matchCandidates']);
// Route::post('/talents/matching', [\App\Http\Controllers\Api\JobMatching\JobMatchingController::class, 'matchCandidates']);
// Route::post('/v1/talents/send-offer', [\App\Http\Controllers\Api\JobMatching\JobMatchingController::class, 'sendRecruiterOffer']);
