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

        $stats = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $stat = $user->dailyStats()->whereDate('date', $date)->first();

            $stats[] = [
                'label' => $period === 'weekly' ? $dayNames[$date->dayOfWeek] : $date->format('d/m'),
                'date' => $date->toDateString(),
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

        // Summary metrics
        $totalExpPeriod = array_sum(array_column($stats, 'exp'));
        $totalQuestsCompleted = array_sum(array_column($stats, 'quests_completed'));
        $totalFocusMinutes = array_sum(array_column($stats, 'focus'));
        $avgProductivity = count(array_filter(array_column($stats, 'productivity'))) > 0
            ? round(array_sum(array_column($stats, 'productivity')) / count(array_filter(array_column($stats, 'productivity'))), 1)
            : 0;

        return response()->json([
            'period' => $period,
            'stats' => $stats,
            'summary' => [
                'total_exp' => $totalExpPeriod,
                'total_quests_completed' => $totalQuestsCompleted,
                'total_focus_minutes' => $totalFocusMinutes,
                'avg_productivity' => $avgProductivity,
                'current_streak' => $profile->streak,
                'longest_streak' => $profile->longest_streak,
                'level_progress' => $this->gamification->levelProgress($profile->exp),
            ],
        ]);
    }

    public function heatmap(Request $request): JsonResponse
    {
        $user = $request->user();
        $heatmapData = [];

        for ($i = 364; $i >= 0; $i--) {
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
                'exp' => $stat?->total_exp_earned ?? 0,
            ];
        }

        return response()->json(['heatmap' => $heatmapData]);
    }
}
