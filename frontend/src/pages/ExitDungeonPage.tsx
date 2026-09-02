import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sparkles, Swords, CheckCircle2, ArrowRight } from "lucide-react";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            "Gagal melakukan check-out dungeon. Silakan coba lagi.";
          setErrorMessage(msg);
          showToast({
            type: "info",
            title: "Gagal Check-Out",
            message: msg,
          });
        },
      }
    );
  };

  const status = dungeonState?.status || "not-started";

  // If dungeon is not started yet
  if (status === "not-started") {
    return (
      <section className="panel form-panel">
        <PanelTitle icon={LogOut} title="Exit Dungeon (Check Out)" />
        <div style={{ padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Swords size={32} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "#f8fafc" }}>
                Belum Ada Sesi Dungeon Aktif
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>
                Anda belum melakukan Enter Dungeon hari ini. Silakan mulai sesi dungeon terlebih dahulu untuk mencatat fokus dan quest.
              </p>
            </div>
          </div>

          <div className="action-row" style={{ marginTop: "0.5rem" }}>
            <button className="primary" onClick={() => navigate("/enter-dungeon")}>
              <Swords size={18} />
              <span>Enter Dungeon Sekarang</span>
            </button>
            <button className="secondary" onClick={() => navigate("/")}>
              <span>Kembali ke Dashboard</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // If dungeon is already completed today
  if (status === "completed") {
    return (
      <section className="panel form-panel">
        <PanelTitle icon={LogOut} title="Exit Dungeon (Check Out)" />
        <div style={{ padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <CheckCircle2 size={32} style={{ color: "#34d399", flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "#f8fafc" }}>
                Dungeon Hari Ini Sudah Selesai
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>
                Anda sudah menyelesaikan sesi dungeon dan mengklaim seluruh bonus EXP untuk hari ini.
              </p>
            </div>
          </div>

          <div className="action-row" style={{ marginTop: "0.5rem" }}>
            <button className="primary" onClick={() => navigate("/")}>
              <span>Kembali ke Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => navigate("/statistics")}>
              <span>Lihat Statistik & Progres</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Calculate estimated EXP reward based on dashboard data
  const completedQuests = dashboardData?.quests.completed ?? 0;
  const hasReflection = reflection.trim().length > 0;
  const hasLearning = learning.trim().length > 0;

  // Formula matching the backend (base: 50, +30 per quest, +40 reflection bonus, +streak config)
  const baseReward = 50 + completedQuests * 30 + (hasReflection && hasLearning ? 40 : 0);
  const streakBonus = (dashboardData?.profile.streak ?? 0) * 10;
  const estimatedReward = baseReward + streakBonus;

  return (
    <section className="panel form-panel">
      <PanelTitle icon={LogOut} title="Exit Dungeon (Check Out)" />
      
      {errorMessage && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fca5a5",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <label className="full">
            Refleksi harian
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Bagian mana yang berjalan dengan baik hari ini?"
              required
              rows={3}
            />
          </label>
          <label className="full">
            Pembelajaran hari ini
            <textarea
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              placeholder="Insight, evaluasi, atau strategi baru untuk esok hari."
              required
              rows={3}
            />
          </label>
          <label>
            Produktivitas: {productivity} / 5
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
          disabled={checkOutMutation.isPending}
        >
          <Sparkles size={18} />{" "}
          {checkOutMutation.isPending ? "Exiting Dungeon..." : "Klaim EXP & Tutup Hari"}
        </button>
      </form>
    </section>
  );
}
