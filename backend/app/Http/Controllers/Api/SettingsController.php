<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\HunterProfile;
use App\Models\Quest;
use App\Models\FocusSession;
use App\Models\Journal;
use App\Models\DungeonSession;
use App\Models\DailyStat;
use App\Models\UserAchievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            'name' => $request->name,
            'title' => $request->title,
        ]);

        return response()->json([
            'message' => 'Profil diperbarui.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'title' => $user->title,
            ],
        ]);
    }

    public function updateTheme(Request $request): JsonResponse
    {
        $request->validate([
            'theme' => 'required|string|in:dark,light',
        ]);

        $profile = $request->user()->hunterProfile;
        $profile->update(['theme' => $request->theme]);

        return response()->json([
            'message' => 'Tema diperbarui.',
            'theme' => $profile->theme,
        ]);
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $request->validate([
            'notifications' => 'required|array',
            'notifications.checkIn' => 'required|boolean',
            'notifications.checkOut' => 'required|boolean',
            'notifications.quest' => 'required|boolean',
        ]);

        $profile = $request->user()->hunterProfile;
        $profile->update(['notifications' => $request->notifications]);

        return response()->json([
            'message' => 'Notifikasi diperbarui.',
            'notifications' => $profile->notifications,
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'title' => $user->title,
            ],
            'profile' => $user->hunterProfile,
            'dungeon_sessions' => $user->dungeonSessions()->orderByDesc('date')->get(),
            'quests' => $user->quests()->orderByDesc('date')->get(),
            'focus_sessions' => $user->focusSessions()->orderByDesc('date')->get(),
            'journals' => $user->journals()->orderByDesc('created_at')->get(),
            'achievements' => $user->userAchievements()->with('achievement')->get(),
            'daily_stats' => $user->dailyStats()->orderByDesc('date')->get(),
            'exported_at' => now()->toISOString(),
        ];

        return response()->json($data);
    }

    public function resetData(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete all user data
        UserAchievement::where('user_id', $user->id)->delete();
        DailyStat::where('user_id', $user->id)->delete();
        FocusSession::where('user_id', $user->id)->delete();
        Quest::where('user_id', $user->id)->delete();
        DungeonSession::where('user_id', $user->id)->delete();
        Journal::where('user_id', $user->id)->delete();

        // Reset profile
        $profile = $user->hunterProfile;
        $profile->update([
            'exp' => 0,
            'streak' => 0,
            'longest_streak' => 0,
            'battle_power' => 0,
            'level' => 1,
            'rank' => 'E',
        ]);

        return response()->json([
            'message' => 'Semua data telah direset.',
            'profile' => $profile->fresh(),
        ]);
    }
}
