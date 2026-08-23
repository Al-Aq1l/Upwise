<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DungeonController;
use App\Http\Controllers\Api\QuestController;
use App\Http\Controllers\Api\FocusSessionController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\SettingsController;

/*
|--------------------------------------------------------------------------
| Upwise — API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Dungeon (Check-in / Check-out)
    Route::get('/dungeon/today', [DungeonController::class, 'today']);
    Route::post('/dungeon/check-in', [DungeonController::class, 'checkIn']);
    Route::post('/dungeon/check-out', [DungeonController::class, 'checkOut']);

    // Quests
    Route::get('/quests', [QuestController::class, 'index']);
    Route::post('/quests', [QuestController::class, 'store']);
    Route::put('/quests/{quest}', [QuestController::class, 'update']);
    Route::delete('/quests/{quest}', [QuestController::class, 'destroy']);
    Route::patch('/quests/{quest}/toggle', [QuestController::class, 'toggle']);

    // Focus Sessions
    Route::get('/focus-sessions', [FocusSessionController::class, 'index']);
    Route::post('/focus-sessions', [FocusSessionController::class, 'store']);

    // Journals
    Route::get('/journals', [JournalController::class, 'index']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::put('/journals/{journal}', [JournalController::class, 'update']);
    Route::delete('/journals/{journal}', [JournalController::class, 'destroy']);

    // Statistics
    Route::get('/statistics', [StatisticsController::class, 'index']);
    Route::get('/statistics/heatmap', [StatisticsController::class, 'heatmap']);

    // Achievements
    Route::get('/achievements', [AchievementController::class, 'index']);

    // Settings
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile']);
    Route::put('/settings/theme', [SettingsController::class, 'updateTheme']);
    Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications']);
    Route::post('/settings/export', [SettingsController::class, 'exportData']);
    Route::post('/settings/reset', [SettingsController::class, 'resetData']);
});
