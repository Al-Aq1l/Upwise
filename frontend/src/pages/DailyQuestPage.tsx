import { useState } from "react";
import { Plus, ClipboardList, Sparkles, Zap } from "lucide-react";
import { useQuests, useCreateQuest, useDeleteQuest, useToggleQuest, Quest } from "@/hooks/useQuests";
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

    createQuestMutation.mutate(
      { title, difficulty, category },
      {
        onSuccess: () => {
          setTitle("");
          showToast({
            type: "info",
            title: "Quest Ditambahkan",
            message: `"${title}" siap diselesaikan!`,
          });
        },
      }
    );
  };

  const handleApplyPreset = (preset: typeof ROUTINE_PRESETS[0]) => {
    createQuestMutation.mutate(
      { title: preset.title, difficulty: preset.difficulty, category: preset.category },
      {
        onSuccess: () => {
          showToast({
            type: "info",
            title: "Routine Quest Ditambahkan",
            message: `"${preset.title}" berhasil ditambahkan!`,
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteQuestMutation.mutate(id);
  };

  const handleToggle = (id: number) => {
    const target = data?.quests.find((q) => q.id === id);
    const willBeCompleted = target ? !target.completed : false;

    toggleQuestMutation.mutate(id, {
      onSuccess: () => {
        if (willBeCompleted && target) {
          showToast({
            type: "quest",
            title: "Quest Cleared!",
            message: `Selamat, "${target.title}" selesai!`,
            exp: target.exp_reward,
          });
        }
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;

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
            <p className="muted empty-text">Tidak ada quest untuk hari ini. Silakan buat satu!</p>
          )}
        </div>
      </section>
    </div>
  );
}
