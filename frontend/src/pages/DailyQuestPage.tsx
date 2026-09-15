import { useState } from "react";
import { Plus, ClipboardList, Sparkles, Zap, Home, Dumbbell, GraduationCap, CheckCircle2 } from "lucide-react";
import { useQuests, useCreateQuest, useDeleteQuest, useToggleQuest, useGenerateStarterQuests, Quest } from "@/hooks/useQuests";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import QuestRow from "@/components/ui/QuestRow";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ROUTINE_PRESETS = [
  { title: "Push Up 100x", difficulty: "Normal" as const, category: "Health" },
  { title: "Minum 2L Air", difficulty: "Easy" as const, category: "Health" },
  { title: "Deep Focus 45 Menit", difficulty: "Normal" as const, category: "Work" },
  { title: "Baca 15 Halaman Buku", difficulty: "Easy" as const, category: "Skill" },
  { title: "Meditasi & Stretching 10m", difficulty: "Easy" as const, category: "Health" },
  { title: "Review & Planning Target", difficulty: "Easy" as const, category: "Planning" },
];

export default function DailyQuestPage() {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Normal" | "Hard">("Normal");
  const [category, setCategory] = useState("Health");

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

  const handleQuickGenerate = (type: "home" | "gym" | "study" | "balanced") => {
    let workout_type: "home" | "gym" | "none" = "home";
    let growth_focus: string[] = [];

    if (type === "home") {
      workout_type = "home";
      growth_focus = ["mindfulness"];
    } else if (type === "gym") {
      workout_type = "gym";
      growth_focus = ["reading"];
    } else if (type === "study") {
      workout_type = "none";
      growth_focus = ["study", "reading", "mindfulness"];
    } else {
      workout_type = "home";
      growth_focus = ["study", "reading"];
    }

    generateStarterMutation.mutate(
      { workout_type, growth_focus },
      {
        onSuccess: (res: any) => {
          showToast({
            type: "info",
            title: "Paket Quest Berhasil Dimuat!",
            message: `${res.created_count || "Paket"} quest harian berhasil ditambahkan.`,
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
    <div className="content-grid two-col">
      <section className="panel form-panel">
        <PanelTitle icon={Plus} title="Quest Baru" />
        
        {/* Routine Habit Presets */}
        <div className="routine-presets-container">
          <div className="routine-presets-header">
            <Sparkles size={14} className="text-cyan" />
            <span>Template Rutinitas Cepat:</span>
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
            Judul quest
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Lari pagi 3km"
              required
            />
          </label>
          <label>
            Tingkat kesulitan
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "Easy" | "Normal" | "Hard")}
            >
              <option value="Easy">Easy (45 EXP)</option>
              <option value="Normal">Normal (80 EXP)</option>
              <option value="Hard">Hard (130 EXP)</option>
            </select>
          </label>
          <label>
            Kategori
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Health">Health</option>
              <option value="Skill">Skill</option>
              <option value="Planning">Planning</option>
              <option value="Study">Study</option>
              <option value="Work">Work</option>
              <option value="Routine">Routine</option>
            </select>
          </label>
          <button className="primary" type="submit" disabled={createQuestMutation.isPending}>
            <Plus size={18} />{" "}
            {createQuestMutation.isPending ? "Menambahkan..." : "Tambah Quest"}
          </button>
        </form>
      </section>

      <section className="panel">
        <PanelTitle icon={ClipboardList} title="Daftar Quest Hari Ini" />

        {/* Quick Auto-Generate Pack Toolbar */}
        <div className="quest-quick-pack-bar">
          <div className="pack-bar-header">
            <Zap size={14} className="text-cyan" />
            <span>Auto-Generate Paket Harian:</span>
          </div>
          <div className="pack-buttons-row">
            <button
              type="button"
              className="quick-pack-btn"
              onClick={() => handleQuickGenerate("home")}
              disabled={generateStarterMutation.isPending}
            >
              <Home size={13} />
              <span>Paket Home Workout</span>
            </button>
            <button
              type="button"
              className="quick-pack-btn"
              onClick={() => handleQuickGenerate("gym")}
              disabled={generateStarterMutation.isPending}
            >
              <Dumbbell size={13} />
              <span>Paket Gym & Strength</span>
            </button>
            <button
              type="button"
              className="quick-pack-btn"
              onClick={() => handleQuickGenerate("study")}
              disabled={generateStarterMutation.isPending}
            >
              <GraduationCap size={13} />
              <span>Paket Studi & Skripsi</span>
            </button>
            <button
              type="button"
              className="quick-pack-btn"
              onClick={() => handleQuickGenerate("balanced")}
              disabled={generateStarterMutation.isPending}
            >
              <Sparkles size={13} />
              <span>Paket Seimbang</span>
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
              <p className="muted empty-text">Belum ada quest untuk hari ini.</p>
              <span className="empty-subtext">Mulai hari ini dengan paket instan 1-klik:</span>
              <div className="empty-quick-buttons">
                <button
                  type="button"
                  className="quick-pack-btn active-accent"
                  onClick={() => handleQuickGenerate("home")}
                  disabled={generateStarterMutation.isPending}
                >
                  <Home size={14} />
                  <span>Mulai Home Workout</span>
                </button>
                <button
                  type="button"
                  className="quick-pack-btn active-amber"
                  onClick={() => handleQuickGenerate("gym")}
                  disabled={generateStarterMutation.isPending}
                >
                  <Dumbbell size={14} />
                  <span>Mulai Gym & Strength</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
