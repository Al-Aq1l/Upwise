<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();

// Support writable /tmp storage on Vercel Serverless
if (isset($_ENV['VERCEL']) || env('APP_ENV') === 'production') {
    $storagePath = '/tmp/storage';
    if (!is_dir($storagePath)) {
        @mkdir($storagePath . '/framework/views', 0777, true);
        @mkdir($storagePath . '/framework/cache/data', 0777, true);
        @mkdir($storagePath . '/framework/sessions', 0777, true);
        @mkdir($storagePath . '/logs', 0777, true);
    }
    $app->useStoragePath($storagePath);
}

return $app;
