<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
        private AchievementService $achievements,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->hunterProfile;
        $today = today();

        // Today's dungeon session
        $todaySession = $user->dungeonSessions()->whereDate('date', $today)->first();

        $dungeonStatus = 'not-started';
        if ($todaySession) {
            $dungeonStatus = $todaySession->status;
        }

        // Today's quests
        $todayQuests = $user->quests()->whereDate('date', $today)->get();
        $completedQuests = $todayQuests->where('completed', true)->count();
        $totalQuests = $todayQuests->count();
        $questCompletion = $totalQuests > 0 ? round(($completedQuests / $totalQuests) * 100) : 0;

        // Today's focus
        $todayFocus = $user->focusSessions()->whereDate('date', $today)->sum('duration_minutes');
        $todayFocusCount = $user->focusSessions()->whereDate('date', $today)->count();

        // Level progress
        $levelProgress = $this->gamification->levelProgress($profile->exp);

        // Weekly stats (last 7 days)
        $weeklyStats = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $stat = $user->dailyStats()->whereDate('date', $date)->first();
            $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

            $weeklyStats[] = [
                'label' => $dayNames[$date->dayOfWeek],
                'date' => $date->toDateString(),
                'exp' => $stat?->total_exp_earned ?? 0,
                'quests' => $stat ? ($stat->quests_total > 0 ? round(($stat->quests_completed / $stat->quests_total) * 100) : 0) : 0,
                'focus' => $stat?->focus_minutes ?? 0,
            ];
        }

        // Activity heatmap (last 35 days)
        $heatmapData = [];
        for ($i = 34; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $stat = $user->dailyStats()->whereDate('date', $date)->first();
            $intensity = 0;
            if ($stat) {
                $score = $stat->total_exp_earned;
                if ($score > 300) $intensity = 4;
                elseif ($score > 200) $intensity = 3;
                elseif ($score > 100) $intensity = 2;
                elseif ($score > 0) $intensity = 1;
            }
            $heatmapData[] = [
                'date' => $date->toDateString(),
                'intensity' => $intensity,
            ];
        }

        // Recent achievements
        $recentAchievement = $user->userAchievements()
            ->with('achievement')
            ->orderByDesc('unlocked_at')
            ->first();

        return response()->json([
            'dungeon_status' => $dungeonStatus,
            'dungeon_session' => $todaySession,
            'profile' => [
                'exp' => $profile->exp,
                'level' => $profile->level,
                'rank' => $profile->rank,
                'streak' => $profile->streak,
                'longest_streak' => $profile->longest_streak,
                'battle_power' => $profile->battle_power,
                'theme' => $profile->theme,
            ],
            'level_progress' => $levelProgress,
            'quests' => [
                'completed' => $completedQuests,
                'total' => $totalQuests,
                'completion_percent' => $questCompletion,
                'items' => $todayQuests->take(4)->values(),
            ],
            'focus' => [
                'total_minutes' => $todayFocus,
                'session_count' => $todayFocusCount,
            ],
            'weekly_stats' => $weeklyStats,
            'heatmap' => $heatmapData,
            'recent_achievement' => $recentAchievement ? [
                'name' => $recentAchievement->achievement->name,
                'unlocked' => true,
            ] : [
                'name' => 'First Gate Cleared',
                'unlocked' => false,
            ],
        ]);
    }
}
