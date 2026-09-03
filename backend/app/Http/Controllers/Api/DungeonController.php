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
        $todaySessions = $request->user()->dungeonSessions()
            ->whereDate('date', today())
            ->get();

        $completed = $todaySessions->firstWhere('status', 'completed');
        $active = $todaySessions->firstWhere('status', 'active');

        if ($completed) {
            return response()->json([
                'status' => 'completed',
                'session' => $completed,
            ]);
        }

        if ($active) {
            return response()->json([
                'status' => 'active',
                'session' => $active,
            ]);
        }

        return response()->json([
            'status' => 'not-started',
            'session' => null,
        ]);
    }

    public function checkIn(CheckInRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Ensure hunterProfile exists
            if (!$user->hunterProfile) {
                $user->hunterProfile()->create([
                    'exp' => 0,
                    'streak' => 0,
                    'longest_streak' => 0,
                    'battle_power' => 0,
                    'level' => 1,
                    'rank' => 'E',
                    'theme' => 'dark',
                ]);
                $user->load('hunterProfile');
            }

            $today = today();

            // Check if already checked in today
            $existing = $user->dungeonSessions()->whereDate('date', $today)->first();
            if ($existing) {
                return response()->json([
                    'message' => 'Sudah check-in hari ini.',
                    'session' => $existing,
                ], 422);
            }

            $expEarned = (int) $this->gamification->checkInExp();

            $session = DungeonSession::create([
                'user_id' => $user->id,
                'date' => $today,
                'status' => 'active',
                'check_in_at' => Carbon::now(),
                'mood' => $request->mood,
                'energy' => (int) $request->energy,
                'note' => $request->note,
                'exp_earned' => $expEarned,
            ]);

            $this->gamification->addExp($user, $expEarned, 'check_in', $session);
            $this->achievements->checkAndUnlock($user);

            return response()->json([
                'message' => 'Dungeon entered! +' . $expEarned . ' EXP',
                'session' => $session,
                'exp_earned' => $expEarned,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckIn error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Gagal masuk dungeon: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function checkOut(CheckOutRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            if (!$user->hunterProfile) {
                $user->hunterProfile()->create([
                    'exp' => 0,
                    'streak' => 0,
                    'longest_streak' => 0,
                    'battle_power' => 0,
                    'level' => 1,
                    'rank' => 'E',
                    'theme' => 'dark',
                ]);
                $user->load('hunterProfile');
            }

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
            $completedQuests = (int) $user->quests()
                ->whereDate('date', $today)
                ->where('completed', true)
                ->count();

            $hasReflection = !empty($request->reflection);
            $hasLearning = !empty($request->learning);

            $checkOutExp = (int) $this->gamification->checkOutExp($completedQuests, $hasReflection, $hasLearning);
            $streakBonus = (int) $this->gamification->streakBonusExp((int) ($user->hunterProfile?->streak ?? 0));
            $totalExp = $checkOutExp + $streakBonus;

            $session->update([
                'status' => 'completed',
                'check_out_at' => Carbon::now(),
                'reflection' => $request->reflection,
                'learning' => $request->learning,
                'productivity' => (int) $request->productivity,
                'end_mood' => $request->end_mood,
                'exp_earned' => (int) $session->exp_earned + $totalExp,
            ]);

            // Update streak
            $this->gamification->updateStreak($user);

            // Add EXP with pre-loaded session
            $profile = $this->gamification->addExp($user, $totalExp, 'check_out', $session);

            // Check achievements
            $newAchievements = $this->achievements->checkAndUnlock($user);

            return response()->json([
                'message' => 'Dungeon cleared! +' . $totalExp . ' EXP',
                'session' => $session,
                'exp_earned' => $totalExp,
                'profile' => $profile,
                'new_achievements' => $newAchievements,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckOut error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Gagal check-out dungeon: ' . $e->getMessage(),
            ], 500);
        }
    }
}
