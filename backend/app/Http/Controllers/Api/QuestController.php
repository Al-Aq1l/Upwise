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

            $splitType = $request->input('split_type', $workoutType); // 'ppl' | 'upper_lower' | 'solo_awakening' | 'home' | 'gym'
            $fitnessFocus = $request->input('fitness_focus', []); // ['chest', 'back', 'legs', 'nutrition', 'cardio']
            if (!is_array($fitnessFocus)) {
                $fitnessFocus = [$fitnessFocus];
            }

            $templateQuests = [];

            if ($splitType === 'ppl' || $splitType === 'gym') {
                $templateQuests[] = [
                    'title' => 'Barbell Bench Press (4 Set x 8-10 Reps)',
                    'description' => 'Latihan compound dada utama dengan beban progresif & kontrol gerakan.',
                    'difficulty' => 'Hard',
                    'category' => 'Push',
                ];
                $templateQuests[] = [
                    'title' => 'Incline Dumbbell Press (3 Set x 10-12 Reps)',
                    'description' => 'Target serat otot dada bagian atas (upper chest) untuk visual lebih tebal.',
                    'difficulty' => 'Normal',
                    'category' => 'Push',
                ];
                $templateQuests[] = [
                    'title' => 'Overhead Shoulder Press & Triceps Pushdown',
                    'description' => 'Kombinasi pembentukan bahu depan/samping dan trisep optimal.',
                    'difficulty' => 'Normal',
                    'category' => 'Push',
                ];
                $templateQuests[] = [
                    'title' => 'Target Protein Harian (Minimal 120-150g)',
                    'description' => 'Penuhi asupan protein untuk sintesis dan regenerasi jaringan otot.',
                    'difficulty' => 'Normal',
                    'category' => 'Nutrition',
                ];
            } elseif ($splitType === 'upper_lower') {
                $templateQuests[] = [
                    'title' => 'Upper Body Power: Bench & Bent-Over Row',
                    'description' => 'Superset compound dada dan punggung untuk keseimbangan postur.',
                    'difficulty' => 'Hard',
                    'category' => 'Push',
                ];
                $templateQuests[] = [
                    'title' => 'Lat Pulldown / Pull-Up (4 Set x 8-12 Reps)',
                    'description' => 'Pelebaran sayap punggung (lats) dan kekuatan cengkeraman (grip).',
                    'difficulty' => 'Normal',
                    'category' => 'Pull',
                ];
                $templateQuests[] = [
                    'title' => 'Arm Hypertrophy: Biceps Curl & Skullcrusher',
                    'description' => 'Isolasi lengan untuk volume bisep dan trisep.',
                    'difficulty' => 'Normal',
                    'category' => 'Arms',
                ];
            } elseif ($splitType === 'solo_awakening') {
                $templateQuests[] = [
                    'title' => 'Solo Leveling Quest: 100 Push-ups',
                    'description' => 'Latihan harian sistem hunter: 100 kali push-up penuh.',
                    'difficulty' => 'Hard',
                    'category' => 'Push',
                ];
                $templateQuests[] = [
                    'title' => 'Solo Leveling Quest: 100 Sit-ups & 100 Squats',
                    'description' => 'Latihan harian sistem hunter untuk daya tahan core & kaki.',
                    'difficulty' => 'Hard',
                    'category' => 'Legs',
                ];
                $templateQuests[] = [
                    'title' => 'Solo Leveling Quest: 5km-10km Run / Cardio',
                    'description' => 'Latihan kardio stamina sistem hunter untuk memperkuat jantung.',
                    'difficulty' => 'Hard',
                    'category' => 'Cardio',
                ];
            } else {
                // Home / Calisthenics
                $templateQuests[] = [
                    'title' => 'Push-up Variation (Diamond & Standard 4x15)',
                    'description' => 'Latihan kekuatan dada dan trisep tanpa alat.',
                    'difficulty' => 'Normal',
                    'category' => 'Push',
                ];
                $templateQuests[] = [
                    'title' => 'Bodyweight Squats & Lunges (4x20)',
                    'description' => 'Aktivasi paha depan, paha belakang, dan otot gluteus.',
                    'difficulty' => 'Normal',
                    'category' => 'Legs',
                ];
                $templateQuests[] = [
                    'title' => 'Plank 3 Menit & Leg Raises',
                    'description' => 'Stabilitas dinding perut dan core strength.',
                    'difficulty' => 'Easy',
                    'category' => 'Core',
                ];
            }

            // Additional custom focus quests
            if (in_array('nutrition', $fitnessFocus)) {
                $templateQuests[] = [
                    'title' => 'Minum 3 Liter Air & Hindari Gula Berlebih',
                    'description' => 'Hidrasi maksimal untuk performa angkat beban dan metabolisme.',
                    'difficulty' => 'Easy',
                    'category' => 'Nutrition',
                ];
            }

            if (in_array('cardio', $fitnessFocus)) {
                $templateQuests[] = [
                    'title' => 'Kardio / Treadmill Incline 20 Menit',
                    'description' => 'Pembakaran kalori dan stamina pasca latihan beban.',
                    'difficulty' => 'Normal',
                    'category' => 'Cardio',
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
