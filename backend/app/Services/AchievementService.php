<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;

class AchievementService
{
    /**
     * Check all achievements and unlock any that have been met.
     * Returns newly unlocked achievements.
     */
    public function checkAndUnlock(User $user): array
    {
        $profile = $user->hunterProfile;
        $unlockedIds = $user->userAchievements()->pluck('achievement_id')->toArray();
        $locked = Achievement::whereNotIn('id', $unlockedIds)->get();

        $newlyUnlocked = [];

        foreach ($locked as $achievement) {
            $currentValue = $this->getCurrentValue($user, $profile, $achievement->condition_type);

            if ($currentValue >= $achievement->condition_value) {
                UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'unlocked_at' => Carbon::now(),
                ]);

                $newlyUnlocked[] = $achievement;
            }
        }

        return $newlyUnlocked;
    }

    /**
     * Get the current value for a given condition type.
     */
    private function getCurrentValue(User $user, $profile, string $conditionType): int
    {
        return (int) match ($conditionType) {
            'quest_completed_total' => (int) $user->quests()->where('completed', true)->count(),
            'streak' => (int) ($profile?->streak ?? 0),
            'level' => (int) ($profile?->level ?? 1),
            'journal_count' => (int) $user->journals()->count(),
            'focus_minutes_total' => (int) ($user->focusSessions()->sum('duration_minutes') ?? 0),
            'battle_power' => (int) ($profile?->battle_power ?? 0),
            'dungeon_sessions_total' => (int) $user->dungeonSessions()->where('status', 'completed')->count(),
            'focus_sessions_total' => (int) $user->focusSessions()->count(),
            'longest_streak' => (int) ($profile?->longest_streak ?? 0),
            default => 0,
        };
    }

    /**
     * Get all achievements with unlock status for a user.
     */
    public function getAllWithStatus(User $user): array
    {
        $achievements = Achievement::all();
        $unlocked = $user->userAchievements()
            ->with('achievement')
            ->get()
            ->keyBy('achievement_id');

        return $achievements->map(function ($achievement) use ($unlocked, $user) {
            $userAchievement = $unlocked->get($achievement->id);
            $profile = $user->hunterProfile;

            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'badge_icon' => $achievement->badge_icon,
                'condition_type' => $achievement->condition_type,
                'condition_value' => $achievement->condition_value,
                'current_value' => $this->getCurrentValue($user, $profile, $achievement->condition_type),
                'unlocked' => $userAchievement !== null,
                'unlocked_at' => $userAchievement?->unlocked_at,
            ];
        })->toArray();
    }
}
