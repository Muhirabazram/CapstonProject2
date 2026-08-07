<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\RequestController as AdminRequestController;
use App\Http\Controllers\Student\RequestController as StudentRequestController;

/*
|--------------------------------------------------------------------------
| API Routes - Sistem Administrasi Surat
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes (Requires Bearer Token via Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // User Profile & Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin Routes
    Route::prefix('admin')->group(function () {
        // Students Management
        Route::get('/students', [AdminStudentController::class, 'index']);
        Route::post('/students/import', [AdminStudentController::class, 'import']);

        // Categories & Templates Management
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
        Route::post('/categories/{id}', [AdminCategoryController::class, 'update']); // Using POST for multipart update support
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        // Letter Requests Management
        Route::get('/requests', [AdminRequestController::class, 'index']);
        Route::patch('/requests/{id}/status', [AdminRequestController::class, 'updateStatus']);
    });

    // Student Routes
    Route::prefix('student')->group(function () {
        Route::post('/requests', [StudentRequestController::class, 'store']);
        Route::get('/requests/history', [StudentRequestController::class, 'history']);
    });

    // Document Download Routes
    Route::get('/documents/template/{id}', [DocumentController::class, 'downloadTemplate']);
    Route::get('/documents/download/{id}', [DocumentController::class, 'downloadResult']);
    Route::get('/documents/requirement/{id}', [DocumentController::class, 'downloadRequirement']);
});
