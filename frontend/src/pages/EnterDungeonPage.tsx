import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Play, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { useCheckIn, useDungeonToday } from "@/hooks/useDungeon";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const moods = ["Sangat baik", "Baik", "Biasa", "Buruk", "Sangat buruk"];

export default function EnterDungeonPage() {
  const navigate = useNavigate();
  const { data: dungeonState, isLoading: isDungeonLoading } = useDungeonToday();
  const checkInMutation = useCheckIn();
  const { showToast } = useNotificationStore();

  const [mood, setMood] = useState("Baik");
  const [energy, setEnergy] = useState(4);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Instant optimistic notification and navigation
    showToast({
      type: "dungeon",
      title: "Dungeon Gate Unlocked!",
      message: "Check-in berhasil! +25 EXP diperoleh.",
      exp: 25,
    });
    navigate("/");

    checkInMutation.mutate(
      { mood, energy, note: note.trim() || undefined },
      {
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            "Gagal masuk dungeon. Silakan periksa koneksi atau coba lagi.";
          setErrorMessage(msg);
          showToast({
            type: "info",
            title: "Gagal Check-In",
            message: msg,
          });
        },
      }
    );
  };

  const status = dungeonState?.status || "not-started";

  // If dungeon is already active
  if (status === "active") {
    return (
      <section className="panel form-panel">
        <PanelTitle icon={Swords} title="Dungeon Gate Aktif" />
        <div style={{ padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <ShieldCheck size={32} style={{ color: "#38bdf8", flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "#f8fafc" }}>
                Sesi Dungeon Sedang Berlangsung
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>
                Anda sudah check-in hari ini. Selesaikan daily quest dan sesi fokus Anda sebelum melakukan check-out (Exit Dungeon).
              </p>
            </div>
          </div>

          <div className="action-row" style={{ marginTop: "0.5rem" }}>
            <button className="primary" onClick={() => navigate("/")}>
              <span>Kembali ke Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => navigate("/exit-dungeon")}>
              <span>Exit Dungeon (Tutup Hari)</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // If dungeon is completed today
  if (status === "completed") {
    return (
      <section className="panel form-panel">
        <PanelTitle icon={Swords} title="Dungeon Hari Ini Selesai" />
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
                Daily Dungeon Telah Selesai (Cleared)
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>
                Kerja luar biasa! Anda telah menyelesaikan sesi dungeon dan mengklaim reward hari ini. Dungeon baru akan terbuka esok hari.
              </p>
            </div>
          </div>

          <div className="action-row" style={{ marginTop: "0.5rem" }}>
            <button className="primary" onClick={() => navigate("/")}>
              <span>Kembali ke Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => navigate("/statistics")}>
              <span>Lihat Statistik</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel form-panel">
      <PanelTitle icon={Swords} title="Enter Dungeon (Check In)" />
      
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
          <label>
            Mood awal
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              {moods.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Energy level: {energy} / 5
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
          </label>
          <label className="full">
            Catatan target harian (Opsional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Apa misi utama Anda hari ini?"
              rows={3}
            />
          </label>
        </div>
        <div className="action-row">
          <button
            className="primary"
            type="submit"
            disabled={checkInMutation.isPending}
          >
            <Play size={18} />{" "}
            {checkInMutation.isPending ? "Entering Dungeon..." : "Mulai Dungeon"}
          </button>
        </div>
      </form>
    </section>
  );
}
