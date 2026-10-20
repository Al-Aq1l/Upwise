import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ClipboardList, Sparkles, Zap, Dumbbell, CalendarDays, Flame, CheckCircle2, ArrowRight } from "lucide-react";
import { useQuests, useCreateQuest, useDeleteQuest, useToggleQuest, useGenerateStarterQuests, Quest } from "@/hooks/useQuests";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import QuestRow from "@/components/ui/QuestRow";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ROUTINE_PRESETS = [
  { title: "Barbell Bench Press (4 Set x 8-10)", difficulty: "Hard" as const, category: "Push" },
  { title: "Incline Dumbbell Press (3 Set x 12)", difficulty: "Normal" as const, category: "Push" },
  { title: "Lat Pulldown / Pull-ups (4 Set x 10)", difficulty: "Normal" as const, category: "Pull" },
  { title: "Barbell Back Squat (4 Set x 8)", difficulty: "Hard" as const, category: "Legs" },
  { title: "Romanian Deadlift (3 Set x 10)", difficulty: "Hard" as const, category: "Legs" },
  { title: "Solo Leveling Quest: 100 Push-ups", difficulty: "Hard" as const, category: "Push" },
  { title: "Solo Leveling Quest: 100 Squats", difficulty: "Hard" as const, category: "Legs" },
  { title: "Plank 3 Menit & Leg Raises", difficulty: "Normal" as const, category: "Core" },
  { title: "Target Protein 140g & Air 3L", difficulty: "Easy" as const, category: "Nutrition" },
  { title: "Kardio Incline Treadmill 20 Menit", difficulty: "Normal" as const, category: "Cardio" },
];

export default function DailyQuestPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Normal" | "Hard">("Normal");
  const [category, setCategory] = useState("Push");

  const { data, isLoading } = useQuests();
  const createQuestMutation = useCreateQuest();
  const deleteQuestMutation = useDeleteQuest();
  const toggleQuestMutation = useToggleQuest();
  const { showToast } = useNotificationStore();

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentTitle = title;
    const currentDifficulty = difficulty;
    const currentCategory = category;

    // 1. Immediately reset form
    setTitle("");

    // 2. Immediately show toast notification
    showToast({
      type: "info",
      title: "Quest Ditambahkan",
      message: `"${currentTitle}" siap diselesaikan!`,
    });

    // 3. Mutate in background
    createQuestMutation.mutate(
      { title: currentTitle, difficulty: currentDifficulty, category: currentCategory },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Gagal menambahkan quest. Silakan coba lagi.";
          showToast({
            type: "info",
            title: "Gagal Tambah Quest",
            message: msg,
          });
        },
      }
    );
  };

  const handleApplyPreset = (preset: typeof ROUTINE_PRESETS[0]) => {
    // Instantly notify
    showToast({
      type: "info",
      title: "Routine Quest Ditambahkan",
      message: `"${preset.title}" berhasil ditambahkan!`,
    });

    createQuestMutation.mutate(
      { title: preset.title, difficulty: preset.difficulty, category: preset.category },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Gagal menerapkan preset quest.";
          showToast({
            type: "info",
            title: "Gagal Tambah Preset",
            message: msg,
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    // Instantly notify
    showToast({
      type: "info",
      title: "Quest Dihapus",
      message: "Quest berhasil dihapus.",
    });

    deleteQuestMutation.mutate(id, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Gagal menghapus quest.";
        showToast({
          type: "info",
          title: "Gagal Hapus",
          message: msg,
        });
      },
    });
  };

  const handleToggle = (id: number) => {
    const target = data?.quests.find((q) => q.id === id);
    const willBeCompleted = target ? !target.completed : false;

    // Instantly notify and play sound if completed
    if (willBeCompleted && target) {
      showToast({
        type: "quest",
        title: "Quest Cleared!",
        message: `Selamat, "${target.title}" selesai!`,
        exp: target.exp_reward,
      });
    }

    toggleQuestMutation.mutate(id, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Gagal mengubah status quest.";
        showToast({
          type: "info",
          title: "Gagal Update Quest",
          message: msg,
        });
      },
    });
  };

  const generateStarterMutation = useGenerateStarterQuests();

  const handleQuickGenerate = (split_type: "ppl" | "upper_lower" | "solo_awakening" | "home") => {
    generateStarterMutation.mutate(
      { workout_type: split_type, split_type, fitness_focus: ["nutrition", "cardio"] },
      {
        onSuccess: (res: any) => {
          showToast({
            type: "info",
            title: "Paket Latihan Dimuat!",
            message: `${res.created_count || "Paket"} quest latihan gym berhasil ditambahkan ke dashboard.`,
          });
        },
        onError: (err: any) => {
          showToast({
            type: "info",
            title: "Gagal Memuat Paket",
            message: err?.response?.data?.message || "Terjadi kesalahan.",
          });
        },
      }
    );
  };

  return (
    <div className="daily-quest-page-wrapper">
      {/* Schedule Banner CTA */}
      <div className="quest-schedule-banner">
        <div className="banner-left">
          <CalendarDays size={20} className="text-cyan" />
          <div className="banner-text">
            <strong>Ingin rutinitas latihan gym terstruktur per hari?</strong>
            <span>Gunakan Jadwal Latihan Mingguan untuk menyusun split Push, Pull, Legs & Upper/Lower.</span>
          </div>
        </div>
        <button
          type="button"
          className="secondary-btn-glass banner-btn"
          onClick={() => navigate("/schedule")}
        >
          <span>Buka Jadwal Latihan</span>
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="content-grid two-col">
        <section className="panel form-panel">
          <PanelTitle icon={Plus} title="Tambah Quest Latihan" />
          
          {/* Routine Habit Presets */}
          <div className="routine-presets-container">
            <div className="routine-presets-header">
              <Sparkles size={14} className="text-cyan" />
              <span>Latihan Rekomendasi 1-Klik:</span>
            </div>
            <div className="routine-chips-grid">
              {ROUTINE_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  className="routine-chip"
                  onClick={() => handleApplyPreset(preset)}
                  disabled={createQuestMutation.isPending}
                >
                  <Plus size={12} />
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateQuest} className="form-container">
            <label>
              Nama Latihan / Quest Gym
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Barbell Bench Press 4x10"
                required
              />
            </label>
            <label>
              Tingkat Kesulitan / Beban
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Easy" | "Normal" | "Hard")}
              >
                <option value="Easy">Easy (45 EXP) - Pemanasan / Stretching / Minum Air</option>
                <option value="Normal">Normal (80 EXP) - Latihan Aksesori / Isolasi</option>
                <option value="Hard">Hard (130 EXP) - Compound Movement / Beban Berat</option>
              </select>
            </label>
            <label>
              Kategori Otot
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Push">Push (Dada, Bahu, Triceps)</option>
                <option value="Pull">Pull (Punggung, Biceps, Sayap)</option>
                <option value="Legs">Legs (Paha, Betis, Glutes)</option>
                <option value="Core">Core & Abs (Perut & Pinggang)</option>
                <option value="Cardio">Cardio & Stamina (Treadmill, Lari)</option>
                <option value="Nutrition">Nutrition & Recovery (Protein, Tidur, Air)</option>
              </select>
            </label>
            <button className="primary" type="submit" disabled={createQuestMutation.isPending}>
              <Plus size={18} />{" "}
              {createQuestMutation.isPending ? "Menambahkan..." : "Tambah Quest Latihan"}
            </button>
          </form>
        </section>

        <section className="panel">
          <PanelTitle icon={ClipboardList} title="Daftar Quest Hari Ini" />

          {/* Quick Auto-Generate Pack Toolbar */}
          <div className="quest-quick-pack-bar">
            <div className="pack-bar-header">
              <Zap size={14} className="text-cyan" />
              <span>Generate Paket Workout Cepat:</span>
            </div>
            <div className="pack-buttons-row">
              <button
                type="button"
                className="quick-pack-btn"
                onClick={() => handleQuickGenerate("ppl")}
                disabled={generateStarterMutation.isPending}
              >
                <Dumbbell size={13} />
                <span>Paket Push Day</span>
              </button>
              <button
                type="button"
                className="quick-pack-btn"
                onClick={() => handleQuickGenerate("upper_lower")}
                disabled={generateStarterMutation.isPending}
              >
                <Flame size={13} />
                <span>Paket Upper Body</span>
              </button>
              <button
                type="button"
                className="quick-pack-btn"
                onClick={() => handleQuickGenerate("solo_awakening")}
                disabled={generateStarterMutation.isPending}
              >
                <Sparkles size={13} />
                <span>Solo Leveling 100x</span>
              </button>
              <button
                type="button"
                className="quick-pack-btn"
                onClick={() => handleQuickGenerate("home")}
                disabled={generateStarterMutation.isPending}
              >
                <CheckCircle2 size={13} />
                <span>Calisthenics</span>
              </button>
            </div>
          </div>

          <div className="quest-list">
            {data?.quests && data.quests.length > 0 ? (
              data.quests.map((quest: Quest) => (
                <QuestRow
                  key={quest.id}
                  quest={quest}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  removable
                />
              ))
            ) : (
              <div className="empty-quests-box">
                <Dumbbell size={36} className="text-cyan" style={{ opacity: 0.6 }} />
                <p className="muted empty-text">Belum ada latihan untuk hari ini.</p>
                <span className="empty-subtext">Mulai hari ini dengan paket instan atau buka jadwal:</span>
                <div className="empty-quick-buttons">
                  <button
                    type="button"
                    className="quick-pack-btn active-accent"
                    onClick={() => handleQuickGenerate("ppl")}
                    disabled={generateStarterMutation.isPending}
                  >
                    <Dumbbell size={14} />
                    <span>Muat Paket Push Day</span>
                  </button>
                  <button
                    type="button"
                    className="quick-pack-btn active-amber"
                    onClick={() => navigate("/schedule")}
                  >
                    <CalendarDays size={14} />
                    <span>Buka Jadwal Mingguan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
