<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 150);

        // 1. Focus sessions (all time)
        $focusSessions = $user->focusSessions()
            ->orderByDesc('completed_at')
            ->limit($limit)
            ->get();

        // 2. Completed quests (all time)
        $quests = $user->quests()
            ->where('completed', true)
            ->orderByDesc('completed_at')
            ->limit($limit)
            ->get();

        // 3. Dungeon sessions (all time)
        $dungeonSessions = $user->dungeonSessions()
            ->orderByDesc('date')
            ->limit($limit)
            ->get();

        // 4. Journals (all time)
        $journals = $user->journals()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        // Overall aggregate summary
        $totalFocusMinutes = (int) $user->focusSessions()->sum('duration_minutes');
        $totalCompletedQuests = (int) $user->quests()->where('completed', true)->count();
        $totalDungeonClears = (int) $user->dungeonSessions()->where('status', 'completed')->count();
        $totalJournals = (int) $user->journals()->count();

        return response()->json([
            'summary' => [
                'total_focus_minutes' => $totalFocusMinutes,
                'total_completed_quests' => $totalCompletedQuests,
                'total_dungeon_clears' => $totalDungeonClears,
                'total_journals' => $totalJournals,
            ],
            'focus_sessions' => $focusSessions,
            'quests' => $quests,
            'dungeon_sessions' => $dungeonSessions,
            'journals' => $journals,
        ]);
    }
}
