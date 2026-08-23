<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Models\DungeonSession;
use App\Services\GamificationService;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DungeonController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
        private AchievementService $achievements,
    ) {}

    public function today(Request $request): JsonResponse
    {
        $session = $request->user()->dungeonSessions()
            ->whereDate('date', today())
            ->first();

        return response()->json([
            'status' => $session?->status ?? 'not-started',
            'session' => $session,
        ]);
    }

    public function checkIn(CheckInRequest $request): JsonResponse
    {
        $user = $request->user();
        $today = today();

        // Check if already checked in today
        $existing = $user->dungeonSessions()->whereDate('date', $today)->first();
        if ($existing) {
            return response()->json([
                'message' => 'Sudah check-in hari ini.',
                'session' => $existing,
            ], 422);
        }

        $session = DungeonSession::create([
            'user_id' => $user->id,
            'date' => $today,
            'status' => 'active',
            'check_in_at' => Carbon::now(),
            'mood' => $request->mood,
            'energy' => $request->energy,
            'note' => $request->note,
        ]);

        // Give check-in EXP
        $expEarned = $this->gamification->checkInExp();
        $session->exp_earned = $expEarned;
        $session->save();

        $this->gamification->addExp($user, $expEarned, 'check_in');
        $this->achievements->checkAndUnlock($user);

        return response()->json([
            'message' => 'Dungeon entered! +' . $expEarned . ' EXP',
            'session' => $session->fresh(),
            'exp_earned' => $expEarned,
        ]);
    }

    public function checkOut(CheckOutRequest $request): JsonResponse
    {
        $user = $request->user();
        $today = today();

        $session = $user->dungeonSessions()
            ->whereDate('date', $today)
            ->where('status', 'active')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Tidak ada dungeon aktif hari ini.',
            ], 422);
        }

        // Calculate today's completed quests
        $completedQuests = $user->quests()
            ->whereDate('date', $today)
            ->where('completed', true)
            ->count();

        $hasReflection = !empty($request->reflection);
        $hasLearning = !empty($request->learning);

        $checkOutExp = $this->gamification->checkOutExp($completedQuests, $hasReflection, $hasLearning);
        $streakBonus = $this->gamification->streakBonusExp($user->hunterProfile->streak);
        $totalExp = $checkOutExp + $streakBonus;

        $session->update([
            'status' => 'completed',
            'check_out_at' => Carbon::now(),
            'reflection' => $request->reflection,
            'learning' => $request->learning,
            'productivity' => $request->productivity,
            'end_mood' => $request->end_mood,
            'exp_earned' => $session->exp_earned + $totalExp,
        ]);

        // Update streak
        $this->gamification->updateStreak($user);

        // Add EXP
        $profile = $this->gamification->addExp($user, $totalExp, 'check_out');

        // Check achievements
        $newAchievements = $this->achievements->checkAndUnlock($user);

        return response()->json([
            'message' => 'Dungeon cleared! +' . $totalExp . ' EXP',
            'session' => $session->fresh(),
            'exp_earned' => $totalExp,
            'profile' => $profile,
            'new_achievements' => $newAchievements,
        ]);
    }
}
