<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Upwise API Gateway',
        'version' => '1.0.0',
    ]);
});

// Also register API routes at root without /api prefix for flexibility
Route::group([], __DIR__.'/api.php');
