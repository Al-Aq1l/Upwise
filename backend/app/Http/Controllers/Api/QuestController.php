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
        $user = $request->user();
        $expReward = $this->gamification->questExpReward($request->difficulty);

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
    }

    public function update(StoreQuestRequest $request, Quest $quest): JsonResponse
    {
        $this->authorizeQuest($request, $quest);

        $expReward = $this->gamification->questExpReward($request->difficulty);

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
    }

    public function destroy(Request $request, Quest $quest): JsonResponse
    {
        $this->authorizeQuest($request, $quest);

        $quest->delete();
        $this->gamification->updateDailyStats($request->user());

        return response()->json(['message' => 'Quest dihapus.']);
    }

    public function toggle(Request $request, Quest $quest): JsonResponse
    {
        $this->authorizeQuest($request, $quest);
        $user = $request->user();

        $wasCompleted = $quest->completed;
        $quest->completed = !$wasCompleted;
        $quest->completed_at = $quest->completed ? now() : null;
        $quest->save();

        if ($quest->completed && !$wasCompleted) {
            // Give EXP for completing
            $this->gamification->addExp($user, $quest->exp_reward, 'quest_complete');
        }
        // Note: we don't subtract EXP for un-completing to keep it simple

        $this->gamification->updateDailyStats($user);
        $this->achievements->checkAndUnlock($user);

        return response()->json([
            'message' => $quest->completed ? 'Quest selesai! +' . $quest->exp_reward . ' EXP' : 'Quest dibatalkan.',
            'quest' => $quest->fresh(),
            'exp_earned' => $quest->completed ? $quest->exp_reward : 0,
        ]);
    }

    private function authorizeQuest(Request $request, Quest $quest): void
    {
        if ($quest->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}
