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
        try {
            $user = $request->user();

            $journalData = [
                'user_id' => $user->id,
                'title' => $request->title,
                'body' => $request->body,
            ];

            if (\Illuminate\Support\Facades\Schema::hasColumn('journals', 'date')) {
                $journalData['date'] = today();
            }
            if (\Illuminate\Support\Facades\Schema::hasColumn('journals', 'mood')) {
                $journalData['mood'] = $request->mood ?? 'Baik';
            }

            $journal = Journal::create($journalData);

            $expEarned = (int) $this->gamification->journalExp();
            $this->gamification->addExp($user, $expEarned, 'journal');
            $this->achievements->checkAndUnlock($user);

            return response()->json([
                'message' => 'Journal disimpan! +' . $expEarned . ' EXP',
                'journal' => $journal,
                'exp_earned' => $expEarned,
            ], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('StoreJournal error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal menyimpan journal: ' . $e->getMessage()], 500);
        }
    }

    public function update(StoreJournalRequest $request, Journal $journal): JsonResponse
    {
        try {
            if ($journal->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $journal->update([
                'title' => $request->title,
                'body' => $request->body,
            ]);

            return response()->json([
                'message' => 'Journal diperbarui.',
                'journal' => $journal->fresh(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UpdateJournal error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal memperbarui journal: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Journal $journal): JsonResponse
    {
        try {
            if ($journal->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $journal->delete();

            return response()->json(['message' => 'Journal dihapus.']);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('DestroyJournal error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal menghapus journal: ' . $e->getMessage()], 500);
        }
    }
}
