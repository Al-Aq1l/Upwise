<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestRequest;
use App\Models\Quest;
use App\Services\GamificationService;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
        private AchievementService $achievements,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', today()->toDateString());
        $quests = $request->user()->quests()
            ->whereDate('date', $date)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['quests' => $quests]);
    }

    public function store(StoreQuestRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $expReward = (int) $this->gamification->questExpReward($request->difficulty);

            // Link to today's dungeon session if active
            $todaySession = $user->dungeonSessions()
                ->whereDate('date', today())
                ->first();

            $quest = Quest::create([
                'user_id' => $user->id,
                'dungeon_session_id' => $todaySession?->id,
                'title' => $request->title,
                'description' => $request->description ?? 'Quest personal hari ini.',
                'difficulty' => $request->difficulty,
                'category' => $request->category ?? 'Personal',
                'exp_reward' => $expReward,
                'date' => today(),
            ]);

            $this->gamification->updateDailyStats($user);

            return response()->json([
                'message' => 'Quest ditambahkan.',
                'quest' => $quest,
            ], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('StoreQuest error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal menambahkan quest: ' . $e->getMessage()], 500);
        }
    }

    public function update(StoreQuestRequest $request, Quest $quest): JsonResponse
    {
        try {
            $this->authorizeQuest($request, $quest);

            $expReward = (int) $this->gamification->questExpReward($request->difficulty);

            $quest->update([
                'title' => $request->title,
                'description' => $request->description ?? $quest->description,
                'difficulty' => $request->difficulty,
                'category' => $request->category ?? $quest->category,
                'exp_reward' => $expReward,
            ]);

            return response()->json([
                'message' => 'Quest diperbarui.',
                'quest' => $quest->fresh(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UpdateQuest error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal memperbarui quest: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Quest $quest): JsonResponse
    {
        try {
            $this->authorizeQuest($request, $quest);

            $quest->delete();
            $this->gamification->updateDailyStats($request->user());

            return response()->json(['message' => 'Quest dihapus.']);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('DestroyQuest error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal menghapus quest: ' . $e->getMessage()], 500);
        }
    }

    public function toggle(Request $request, Quest $quest): JsonResponse
    {
        try {
            $this->authorizeQuest($request, $quest);
            $user = $request->user();

            $wasCompleted = $quest->completed;
            $quest->completed = !$wasCompleted;
            $quest->completed_at = $quest->completed ? now() : null;
            $quest->save();

            if ($quest->completed && !$wasCompleted) {
                // Give EXP for completing
                $this->gamification->addExp($user, (int) $quest->exp_reward, 'quest_complete');
            }

            $this->gamification->updateDailyStats($user);
            $this->achievements->checkAndUnlock($user);

            return response()->json([
                'message' => $quest->completed ? 'Quest selesai! +' . $quest->exp_reward . ' EXP' : 'Quest dibatalkan.',
                'quest' => $quest->fresh(),
                'exp_earned' => $quest->completed ? (int) $quest->exp_reward : 0,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ToggleQuest error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal mengubah status quest: ' . $e->getMessage()], 500);
        }
    }

    private function authorizeQuest(Request $request, Quest $quest): void
    {
        if ($quest->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}
