<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJournalRequest;
use App\Models\Journal;
use App\Services\GamificationService;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
        private AchievementService $achievements,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $journals = $request->user()->journals()
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($journals);
    }

    public function store(StoreJournalRequest $request): JsonResponse
    {
        $user = $request->user();

        $journal = Journal::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'body' => $request->body,
        ]);

        $expEarned = $this->gamification->journalExp();
        $this->gamification->addExp($user, $expEarned, 'journal');
        $this->achievements->checkAndUnlock($user);

        return response()->json([
            'message' => 'Journal disimpan! +' . $expEarned . ' EXP',
            'journal' => $journal,
            'exp_earned' => $expEarned,
        ], 201);
    }

    public function update(StoreJournalRequest $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $journal->update([
            'title' => $request->title,
            'body' => $request->body,
        ]);

        return response()->json([
            'message' => 'Journal diperbarui.',
            'journal' => $journal->fresh(),
        ]);
    }

    public function destroy(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $journal->delete();

        return response()->json(['message' => 'Journal dihapus.']);
    }
}
