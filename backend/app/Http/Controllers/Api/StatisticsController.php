<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
    ) {}
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $period = $request->query('period', 'weekly');

        $days = match ($period) {
            'monthly' => 30,
            'weekly' => 7,
            default => 7,
        };

        $startDate = Carbon::today()->subDays($days - 1)->toDateString();
        $statsMap = $user->dailyStats()
            ->where('date', '>=', $startDate)
            ->get()
            ->keyBy(fn ($s) => Carbon::parse($s->date)->toDateString());

        $stats = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateKey = $date->toDateString();
            $stat = $statsMap->get($dateKey);

            $stats[] = [
                'label' => $period === 'weekly' ? $dayNames[$date->dayOfWeek] : $date->format('d/m'),
                'date' => $dateKey,
                'exp' => $stat?->total_exp_earned ?? 0,
                'quests_completed' => $stat?->quests_completed ?? 0,
                'quests_total' => $stat?->quests_total ?? 0,
                'quests' => $stat && $stat->quests_total > 0
                    ? round(($stat->quests_completed / $stat->quests_total) * 100)
                    : 0,
                'focus' => $stat?->focus_minutes ?? 0,
                'productivity' => $stat?->productivity_score ?? 0,
            ];
        }

        $profile = $user->hunterProfile;

        $totalWorkouts = $user->dungeonSessions()
            ->where('status', 'completed')
            ->where('date', '>=', $startDate)
            ->count();

        $categoryBreakdown = $user->quests()
            ->where('completed', true)
            ->where('date', '>=', $startDate)
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        return response()->json([
            'period' => $period,
            'stats' => $stats,
            'summary' => [
                'total_exp' => $totalExpPeriod,
                'total_quests_completed' => $totalQuestsCompleted,
                'total_focus_minutes' => $totalFocusMinutes,
                'total_workouts' => $totalWorkouts,
                'avg_productivity' => $avgProductivity,
                'current_streak' => $profile->streak,
                'longest_streak' => $profile->longest_streak,
                'level_progress' => $this->gamification->levelProgress($profile->exp),
                'muscle_groups' => $categoryBreakdown,
            ],
        ]);
    }

    public function heatmap(Request $request): JsonResponse
    {
        $user = $request->user();
        $startDate = Carbon::today()->subDays(364)->toDateString();
        $statsMap = $user->dailyStats()
            ->where('date', '>=', $startDate)
            ->get()
            ->keyBy(fn ($s) => Carbon::parse($s->date)->toDateString());

        $heatmapData = [];

        for ($i = 364; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateKey = $date->toDateString();
            $stat = $statsMap->get($dateKey);

            $intensity = 0;
            if ($stat) {
                $score = $stat->total_exp_earned;
                if ($score > 300) $intensity = 4;
                elseif ($score > 200) $intensity = 3;
                elseif ($score > 100) $intensity = 2;
                elseif ($score > 0) $intensity = 1;
            }

            $heatmapData[] = [
                'date' => $dateKey,
                'intensity' => $intensity,
                'exp' => $stat?->total_exp_earned ?? 0,
            ];
        }

        return response()->json(['heatmap' => $heatmapData]);
    }
}
