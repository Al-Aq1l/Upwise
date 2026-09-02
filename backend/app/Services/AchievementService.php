<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;

class AchievementService
{
    /**
     * Precompute all metric values once in batch.
     */
    private function computeUserMetrics(User $user, $profile): array
    {
        return [
            'quest_completed_total'  => (int) $user->quests()->where('completed', true)->count(),
            'streak'                 => (int) ($profile?->streak ?? 0),
            'level'                  => (int) ($profile?->level ?? 1),
            'journal_count'          => (int) $user->journals()->count(),
            'focus_minutes_total'    => (int) ($user->focusSessions()->sum('duration_minutes') ?? 0),
            'battle_power'           => (int) ($profile?->battle_power ?? 0),
            'dungeon_sessions_total' => (int) $user->dungeonSessions()->where('status', 'completed')->count(),
            'focus_sessions_total'   => (int) $user->focusSessions()->count(),
            'longest_streak'         => (int) ($profile?->longest_streak ?? 0),
        ];
    }

    /**
     * Check all achievements and unlock any that have been met.
     * Returns newly unlocked achievements.
     */
    public function checkAndUnlock(User $user): array
    {
        $profile = $user->hunterProfile;
        $unlockedIds = $user->userAchievements()->pluck('achievement_id')->toArray();
        $locked = Achievement::whereNotIn('id', $unlockedIds)->get();

        if ($locked->isEmpty()) {
            return [];
        }

        // Compute metrics once in batch
        $metrics = $this->computeUserMetrics($user, $profile);
        $newlyUnlocked = [];

        foreach ($locked as $achievement) {
            $currentValue = $metrics[$achievement->condition_type] ?? 0;

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
     * Get all achievements with unlock status for a user.
     */
    public function getAllWithStatus(User $user): array
    {
        $achievements = Achievement::all();
        $unlocked = $user->userAchievements()
            ->with('achievement')
            ->get()
            ->keyBy('achievement_id');

        $profile = $user->hunterProfile;
        $metrics = $this->computeUserMetrics($user, $profile);

        return $achievements->map(function ($achievement) use ($unlocked, $metrics) {
            $userAchievement = $unlocked->get($achievement->id);

            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'badge_icon' => $achievement->badge_icon,
                'condition_type' => $achievement->condition_type,
                'condition_value' => $achievement->condition_value,
                'current_value' => $metrics[$achievement->condition_type] ?? 0,
                'unlocked' => $userAchievement !== null,
                'unlocked_at' => $userAchievement?->unlocked_at,
            ];
        })->toArray();
    }
}
