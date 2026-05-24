<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SecureMediaController;

Route::get('/', function () {
    return view('welcome');
});

// Fallback secure media routes in case the frontend prepends '/storage/'
Route::get('/storage/secure-media/{id}', [SecureMediaController::class, 'serve']);
Route::get('/storage/secure-media/{id}/thumbnail', [SecureMediaController::class, 'serveThumbnail']);
