import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Play } from "lucide-react";
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

  useEffect(() => {
    if (dungeonState?.status === "active") {
      navigate("/");
    }
  }, [dungeonState, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkInMutation.mutate(
      { mood, energy, note },
      {
        onSuccess: () => {
          showToast({
            type: "dungeon",
            title: "Dungeon Gate Unlocked!",
            message: "Check-in berhasil! +20 EXP diperoleh.",
            exp: 20,
          });
          navigate("/");
        },
      }
    );
  };

  if (isDungeonLoading) return <LoadingSpinner />;

  return (
    <section className="panel form-panel">
      <PanelTitle icon={Swords} title="Enter Dungeon (Check In)" />
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
            Energy level: {energy}
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
          </label>
          <label className="full">
            Catatan target harian
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Apa misi utama hari ini?"
              required
            />
          </label>
        </div>
        <div className="action-row">
          <button
            className="primary"
            type="submit"
            disabled={checkInMutation.isPending || dungeonState?.status === "active"}
          >
            <Play size={18} />{" "}
            {checkInMutation.isPending ? "Entering Dungeon..." : "Mulai Dungeon"}
          </button>
          {dungeonState?.status === "active" && (
            <span className="muted">Check-in hari ini sudah aktif.</span>
          )}
        </div>
      </form>
    </section>
  );
}
