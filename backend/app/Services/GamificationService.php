<?php

namespace App\Services;

use App\Models\User;
use App\Models\HunterProfile;
use App\Models\DailyStat;
use Carbon\Carbon;

class GamificationService
{
    /**
     * Calculate level from total EXP.
     */
    public function levelFromExp(int $exp): int
    {
        $multiplier = config('gamification.level.multiplier');
        return (int) floor(sqrt($exp / $multiplier)) + 1;
    }

    /**
     * Calculate EXP needed to reach a specific level.
     */
    public function expForLevel(int $level): int
    {
        $multiplier = config('gamification.level.multiplier');
        return $level * $level * $multiplier;
    }

    /**
     * Calculate progress percentage towards next level.
     */
    public function levelProgress(int $exp): array
    {
        $level = $this->levelFromExp($exp);
        $currentLevelExp = $this->expForLevel($level - 1);
        $nextLevelExp = $this->expForLevel($level);
        $progress = $nextLevelExp > $currentLevelExp
            ? round(($exp - $currentLevelExp) / ($nextLevelExp - $currentLevelExp) * 100)
            : 0;

        return [
            'level' => $level,
            'current_exp' => $exp,
            'current_level_exp' => $currentLevelExp,
            'next_level_exp' => $nextLevelExp,
            'progress' => min(100, max(0, $progress)),
        ];
    }

    /**
     * Calculate EXP reward for a quest based on difficulty.
     */
    public function questExpReward(string $difficulty): int
    {
        return match ($difficulty) {
            'Easy' => config('gamification.exp.quest_easy'),
            'Hard' => config('gamification.exp.quest_hard'),
            default => config('gamification.exp.quest_normal'),
        };
    }

    /**
     * Calculate EXP for a focus session.
     */
    public function focusSessionExp(int $minutes): int
    {
        return (int) round($minutes * config('gamification.exp.focus_per_minute'));
    }

    /**
     * Calculate check-in EXP.
     */
    public function checkInExp(): int
    {
        return config('gamification.exp.check_in');
    }

    /**
     * Calculate check-out EXP based on activity.
     */
    public function checkOutExp(int $questsCompleted, bool $hasReflection, bool $hasLearning): int
    {
        $base = config('gamification.exp.check_out_base');
        $perQuest = config('gamification.exp.check_out_per_quest');
        $reflectionBonus = ($hasReflection && $hasLearning)
            ? config('gamification.exp.check_out_reflection')
            : 0;

        return $base + ($questsCompleted * $perQuest) + $reflectionBonus;
    }

    /**
     * Calculate journal writing EXP.
     */
    public function journalExp(): int
    {
        return config('gamification.exp.journal');
    }

    /**
     * Calculate streak bonus EXP.
     */
    public function streakBonusExp(int $streak): int
    {
        return $streak * config('gamification.exp.streak_bonus_per_day');
    }

    /**
     * Calculate Battle Power.
     */
    public function calculateBattlePower(
        int $level,
        int $streak,
        int $questCompletionPercent,
        int $productivityScore,
        int $totalFocusMinutes
    ): int {
        $bp = config('gamification.battle_power');

        return (int) round(
            ($level * $bp['level_weight']) +
            ($streak * $bp['streak_weight']) +
            ($questCompletionPercent * $bp['quest_completion_weight']) +
            ($productivityScore * $bp['productivity_weight']) +
            ($totalFocusMinutes * $bp['focus_weight'])
        );
    }

    /**
     * Determine Hunter Rank from level and battle power.
     */
    public function determineRank(int $level, int $battlePower): string
    {
        $ranks = config('gamification.ranks');

        foreach ($ranks as $rank => $thresholds) {
            if ($level >= $thresholds['min_level'] || $battlePower >= $thresholds['min_bp']) {
                return $rank;
            }
        }

        return 'E';
    }

    /**
     * Add EXP to a user's profile and recalculate level, rank, battle power.
     */
    public function addExp(User $user, int $expAmount, ?string $reason = null): HunterProfile
    {
        $profile = $user->hunterProfile;
        $profile->exp += $expAmount;
        $profile->level = $this->levelFromExp($profile->exp);

        // Recalculate battle power
        $todayQuests = $user->quests()->whereDate('date', today())->get();
        $totalQuests = $todayQuests->count();
        $completedQuests = $todayQuests->where('completed', true)->count();
        $questCompletion = $totalQuests > 0 ? round(($completedQuests / $totalQuests) * 100) : 0;

        $todayFocus = $user->focusSessions()->whereDate('date', today())->sum('duration_minutes');

        $todaySession = $user->dungeonSessions()->whereDate('date', today())->first();
        $productivity = $todaySession?->productivity ?? 4;

        $profile->battle_power = $this->calculateBattlePower(
            $profile->level,
            $profile->streak,
            $questCompletion,
            $productivity,
            $todayFocus
        );

        $profile->rank = $this->determineRank($profile->level, $profile->battle_power);
        $profile->save();

        // Update daily stats
        $this->updateDailyStats($user);

        return $profile;
    }

    /**
     * Update streak for the user.
     */
    public function updateStreak(User $user): HunterProfile
    {
        $profile = $user->hunterProfile;

        // Check if yesterday had a completed session
        $yesterday = Carbon::yesterday();
        $yesterdaySession = $user->dungeonSessions()
            ->whereDate('date', $yesterday)
            ->where('status', 'completed')
            ->first();

        if ($yesterdaySession || $profile->streak === 0) {
            $profile->streak += 1;
            $profile->longest_streak = max($profile->longest_streak, $profile->streak);
        } else {
            // Check if today is a new streak start (no session yesterday)
            $todaySession = $user->dungeonSessions()
                ->whereDate('date', today())
                ->first();
            if (!$todaySession) {
                $profile->streak = 1;
            }
        }

        $profile->save();
        return $profile;
    }

    /**
     * Update daily aggregated stats.
     */
    public function updateDailyStats(User $user): DailyStat
    {
        $today = today();
        $todayQuests = $user->quests()->whereDate('date', $today)->get();
        $todayFocus = $user->focusSessions()->whereDate('date', $today)->sum('duration_minutes');
        $todaySession = $user->dungeonSessions()->whereDate('date', $today)->first();

        $stat = DailyStat::updateOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            [
                'total_exp_earned' => $todaySession?->exp_earned ?? 0,
                'quests_completed' => $todayQuests->where('completed', true)->count(),
                'quests_total' => $todayQuests->count(),
                'focus_minutes' => $todayFocus,
                'productivity_score' => $todaySession?->productivity,
            ]
        );

        return $stat;
    }
}
