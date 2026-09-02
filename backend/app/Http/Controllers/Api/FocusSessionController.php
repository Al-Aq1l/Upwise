<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFocusSessionRequest;
use App\Models\FocusSession;
use App\Services\GamificationService;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FocusSessionController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
        private AchievementService $achievements,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', today()->toDateString());
        $sessions = $request->user()->focusSessions()
            ->whereDate('date', $date)
            ->orderByDesc('completed_at')
            ->get();

        $totalMinutes = $sessions->sum('duration_minutes');

        return response()->json([
            'sessions' => $sessions,
            'total_minutes' => $totalMinutes,
        ]);
    }

    public function store(StoreFocusSessionRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $now = Carbon::now();
            $duration = (int) $request->duration_minutes;

            $session = FocusSession::create([
                'user_id' => $user->id,
                'quest_id' => $request->quest_id,
                'quest_title' => $request->quest_title ?? 'General Focus',
                'duration_minutes' => $duration,
                'started_at' => $now->copy()->subMinutes($duration),
                'completed_at' => $now,
                'date' => today(),
            ]);

            $expEarned = (int) $this->gamification->focusSessionExp($duration);
            $this->gamification->addExp($user, $expEarned, 'focus_session');
            $this->gamification->updateDailyStats($user);
            $this->achievements->checkAndUnlock($user);

            return response()->json([
                'message' => 'Sesi fokus tercatat! +' . $expEarned . ' EXP',
                'session' => $session,
                'exp_earned' => $expEarned,
            ], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('StoreFocusSession error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal menyimpan sesi fokus: ' . $e->getMessage()], 500);
        }
    }
}
