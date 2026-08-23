import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { useCheckOut, useDungeonToday } from "@/hooks/useDungeon";
import { useDashboard } from "@/hooks/useDashboard";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const moods = ["Sangat baik", "Baik", "Biasa", "Buruk", "Sangat buruk"];

export default function ExitDungeonPage() {
  const navigate = useNavigate();
  const { data: dungeonState, isLoading: isDungeonLoading } = useDungeonToday();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const checkOutMutation = useCheckOut();
  const { showToast } = useNotificationStore();

  const [reflection, setReflection] = useState("");
  const [learning, setLearning] = useState("");
  const [productivity, setProductivity] = useState(4);
  const [endMood, setEndMood] = useState("Baik");

  useEffect(() => {
    if (dungeonState && dungeonState.status !== "active") {
      navigate("/");
    }
  }, [dungeonState, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkOutMutation.mutate(
      { reflection, learning, productivity, end_mood: endMood },
      {
        onSuccess: (data: any) => {
          const expEarned = data?.exp_earned || estimatedReward;
          showToast({
            type: "level",
            title: "Dungeon Cleared!",
            message: `Hari ini berhasil ditutup! +${expEarned} EXP diperoleh.`,
            exp: expEarned,
          });
          navigate("/");
        },
      }
    );
  };

  if (isDungeonLoading || isDashboardLoading) return <LoadingSpinner />;

  // Calculate estimated EXP reward based on dashboard data
  const completedQuests = dashboardData?.quests.completed ?? 0;
  const totalFocus = dashboardData?.focus.total_minutes ?? 0;
  const hasReflection = reflection.trim().length > 0;
  const hasLearning = learning.trim().length > 0;

  // Formula matching the backend (base: 50, +30 per quest, +40 reflection bonus, +streak config)
  const baseReward = 50 + completedQuests * 30 + (hasReflection && hasLearning ? 40 : 0);
  const streakBonus = (dashboardData?.profile.streak ?? 0) * 10;
  const estimatedReward = baseReward + streakBonus;

  return (
    <section className="panel form-panel">
      <PanelTitle icon={LogOut} title="Exit Dungeon (Check Out)" />
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <label className="full">
            Refleksi harian
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Bagian mana yang berjalan dengan baik?"
              required
            />
          </label>
          <label className="full">
            Pembelajaran hari ini
            <textarea
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              placeholder="Insight, kesalahan, atau strategi baru untuk esok hari."
              required
            />
          </label>
          <label>
            Produktivitas: {productivity}
            <input
              type="range"
              min="1"
              max="5"
              value={productivity}
              onChange={(e) => setProductivity(Number(e.target.value))}
            />
          </label>
          <label>
            Mood akhir
            <select value={endMood} onChange={(e) => setEndMood(e.target.value)}>
              {moods.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="reward">Estimasi reward: +{estimatedReward} EXP</p>
        <button
          className="primary"
          type="submit"
          disabled={checkOutMutation.isPending || dungeonState?.status !== "active"}
        >
          <Sparkles size={18} />{" "}
          {checkOutMutation.isPending ? "Exiting Dungeon..." : "Klaim EXP & Tutup Hari"}
        </button>
        {dungeonState?.status !== "active" && (
          <span className="muted">Exit hanya aktif setelah Enter Dungeon.</span>
        )}
      </form>
    </section>
  );
}
