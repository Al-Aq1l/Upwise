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

    public function generateStarter(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $workoutType = $request->input('workout_type', 'home'); // 'home' | 'gym' | 'none'
            $growthFocus = $request->input('growth_focus', []); // array: ['study', 'reading', 'mindfulness']
            if (!is_array($growthFocus)) {
                $growthFocus = [$growthFocus];
            }

            $templateQuests = [];

            // 1. Workout Archetype Quests
            if ($workoutType === 'home') {
                $templateQuests[] = [
                    'title' => 'Home Workout: Push Up 100x & Sit Up 50x',
                    'description' => 'Latihan kekuatan kalistenik mandiri untuk menjaga kebugaran otot.',
                    'difficulty' => 'Normal',
                    'category' => 'Health',
                ];
                $templateQuests[] = [
                    'title' => 'Plank 3 Menit & Bodyweight Squats',
                    'description' => 'Kekuatan inti core tubuh dan stabilitas tubuh bagian bawah.',
                    'difficulty' => 'Easy',
                    'category' => 'Health',
                ];
                $templateQuests[] = [
                    'title' => 'Minum 2 Liter Air & Hidrasi Optimal',
                    'description' => 'Penuhi asupan cairan tubuh untuk pemulihan dan konsentrasi prima.',
                    'difficulty' => 'Easy',
                    'category' => 'Health',
                ];
            } elseif ($workoutType === 'gym') {
                $templateQuests[] = [
                    'title' => 'Sesi Gym: Angkat Beban & Strength Training',
                    'description' => 'Latihan beban terarah di gym (chest, back, atau legs) dengan progressive overload.',
                    'difficulty' => 'Hard',
                    'category' => 'Health',
                ];
                $templateQuests[] = [
                    'title' => 'Penuhi Kebutuhan Protein Harian',
                    'description' => 'Konsumsi sumber protein berkualitas untuk regenerasi dan pertumbuhan otot.',
                    'difficulty' => 'Normal',
                    'category' => 'Health',
                ];
                $templateQuests[] = [
                    'title' => 'Kardio / Jalan Kaki 8.000 Langkah',
                    'description' => 'Aktivitas kardiovaskular ringan untuk membakar kalori dan stamina.',
                    'difficulty' => 'Easy',
                    'category' => 'Health',
                ];
            }

            // 2. Personal Growth & Academic Focus Quests
            if (in_array('study', $growthFocus)) {
                $templateQuests[] = [
                    'title' => 'Sesi Deep Focus 45 Menit (Studi / Skripsi / Riset)',
                    'description' => 'Sesi belajar intensif tanpa distraksi smartphone atau media sosial.',
                    'difficulty' => 'Normal',
                    'category' => 'Work',
                ];
            }

            if (in_array('reading', $growthFocus)) {
                $templateQuests[] = [
                    'title' => 'Baca 15 Halaman Buku / Jurnal Ilmiah',
                    'description' => 'Perluas wawasan dan literasi melalui bacaan berkualitas setiap hari.',
                    'difficulty' => 'Easy',
                    'category' => 'Skill',
                ];
            }

            if (in_array('mindfulness', $growthFocus)) {
                $templateQuests[] = [
                    'title' => 'Refleksi Harian di Jurnal & Rencana Hari Esok',
                    'description' => 'Tutup hari dengan menulis pencapaian, rasa syukur, dan evaluasi diri.',
                    'difficulty' => 'Easy',
                    'category' => 'Planning',
                ];
            }

            // If empty (e.g. none selected), provide standard baseline starter
            if (empty($templateQuests)) {
                $templateQuests[] = [
                    'title' => 'Push Up 50x & Stretching Pagi',
                    'description' => 'Aktivasi tubuh di pagi hari agar berenergi.',
                    'difficulty' => 'Easy',
                    'category' => 'Health',
                ];
                $templateQuests[] = [
                    'title' => 'Sesi Fokus 25 Menit Pomodoro',
                    'description' => 'Fokus penuh pada tugas prioritas hari ini.',
                    'difficulty' => 'Easy',
                    'category' => 'Work',
                ];
                $templateQuests[] = [
                    'title' => 'Minum 2L Air & Evaluasi Harian',
                    'description' => 'Menjaga hidrasi dan kesadaran diri.',
                    'difficulty' => 'Easy',
                    'category' => 'Planning',
                ];
            }

            $todaySession = $user->dungeonSessions()
                ->whereDate('date', today())
                ->first();

            $createdQuests = [];
            foreach ($templateQuests as $t) {
                // Check if identical quest already exists today for this user
                $exists = $user->quests()
                    ->whereDate('date', today())
                    ->where('title', $t['title'])
                    ->exists();

                if (!$exists) {
                    $expReward = (int) $this->gamification->questExpReward($t['difficulty']);
                    $createdQuests[] = Quest::create([
                        'user_id' => $user->id,
                        'dungeon_session_id' => $todaySession?->id,
                        'title' => $t['title'],
                        'description' => $t['description'],
                        'difficulty' => $t['difficulty'],
                        'category' => $t['category'],
                        'exp_reward' => $expReward,
                        'date' => today(),
                    ]);
                }
            }

            $this->gamification->updateDailyStats($user);

            return response()->json([
                'message' => count($createdQuests) . ' quest berhasil digenerate otomatis!',
                'created_count' => count($createdQuests),
                'quests' => $user->quests()->whereDate('date', today())->orderByDesc('created_at')->get(),
            ], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('GenerateStarterQuests error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Gagal generate starter quests: ' . $e->getMessage()], 500);
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
        if ((int) $quest->user_id !== (int) $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}
