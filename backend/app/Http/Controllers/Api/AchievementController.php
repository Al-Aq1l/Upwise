<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function __construct(
        private AchievementService $achievements,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check for any new unlocks first
        $this->achievements->checkAndUnlock($user);

        $achievements = $this->achievements->getAllWithStatus($user);

        return response()->json(['achievements' => $achievements]);
    }
}
