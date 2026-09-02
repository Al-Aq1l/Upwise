import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Check, Volume2, CloudRain, Waves, Sparkles } from "lucide-react";
import { useQuests } from "@/hooks/useQuests";
import { useCreateFocusSession, useFocusSessions } from "@/hooks/useFocusSessions";
import { sound } from "@/lib/audio";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type AmbientType = "none" | "rain" | "brown-noise" | "dungeon";

export default function FocusSessionPage() {
  const { data: questData, isLoading: isQuestsLoading } = useQuests();
  const { data: sessionData, isLoading: isSessionsLoading } = useFocusSessions();
  const createSessionMutation = useCreateFocusSession();
  const { showToast, sendBrowserNotification } = useNotificationStore();

  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<AmbientType>("none");
  const [selectedQuest, setSelectedQuest] = useState<{ id: number | null; title: string }>({
    id: null,
    title: "General Focus",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  // Handle ambient sound playback based on timer state
  useEffect(() => {
    if (isRunning && ambientSound !== "none") {
      sound.startAmbient(ambientSound);
    } else {
      sound.stopAmbient();
    }
    return () => {
      sound.stopAmbient();
    };
  }, [isRunning, ambientSound]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    // Instantly notify and play sound
    showToast({
      type: "focus",
      title: "Sesi Fokus Selesai!",
      message: `Hebat! Kamu fokus selama ${duration} menit pada "${selectedQuest.title}".`,
      exp: duration,
    });
    sendBrowserNotification(
      "Sesi Fokus Selesai!",
      `Fokus ${duration} menit selesai! Waktunya istirahat sejenak.`
    );

    createSessionMutation.mutate(
      {
        quest_id: selectedQuest.id,
        quest_title: selectedQuest.title,
        duration_minutes: duration,
      },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Gagal mencatat sesi fokus.";
          showToast({
            type: "info",
            title: "Gagal Catat Sesi",
            message: msg,
          });
        },
      }
    );
    setTimeLeft(duration * 60);
  };

  const handleForceComplete = () => {
    if (window.confirm("Selesaikan sesi fokus sekarang secara manual?")) {
      handleSessionComplete();
    }
  };

  const handleQuestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "general") {
      setSelectedQuest({ id: null, title: "General Focus" });
    } else {
      const q = questData?.quests.find((quest) => quest.id === Number(val));
      if (q) {
        setSelectedQuest({ id: q.id, title: q.title });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="content-grid two-col">
      <section className="focus-stage">
        <span className="eyebrow">Pomodoro Chamber</span>
        <strong className="timer-countdown">{formatTime(timeLeft)}</strong>
        <p className="timer-quest-title">{selectedQuest.title}</p>
        <div className="timer-ring-wrapper">
          <div className="timer-ring">
            <Timer size={72} className={isRunning ? "pulse-animation" : ""} />
          </div>
        </div>
        <div className="timer-controls">
          <button className="primary-btn-glow" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            className="secondary-btn-glass"
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(duration * 60);
            }}
          >
            <RotateCcw size={18} /> Reset
          </button>
          {isRunning && (
            <button className="primary" onClick={handleForceComplete}>
              <Check size={18} /> Selesai
            </button>
          )}
        </div>
      </section>

      <section className="panel form-panel">
        <PanelTitle icon={Timer} title="Setup Sesi Fokus" />
        <div className="form-container">
          <label>
            Quest Terkait
            <select
              value={selectedQuest.id === null ? "general" : selectedQuest.id}
              onChange={handleQuestChange}
            >
              <option value="general">General Focus</option>
              {questData?.quests &&
                questData.quests
                  .filter((q) => !q.completed)
                  .map((quest) => (
                    <option key={quest.id} value={quest.id}>
                      {quest.title}
                    </option>
                  ))}
            </select>
          </label>
          <label>
            Durasi: {duration} menit
            <input
              type="range"
              min="1"
              max="90"
              step="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>

          {/* Ambient Sound Selector */}
          <div className="ambient-sound-selector">
            <div className="ambient-header">
              <Volume2 size={16} className="text-cyan" />
              <span>Suara Latar Fokus (Ambient White Noise):</span>
            </div>
            <div className="ambient-chips-grid">
              <button
                type="button"
                className={`ambient-chip ${ambientSound === "none" ? "active" : ""}`}
                onClick={() => setAmbientSound("none")}
              >
                <span>Mute / Hening</span>
              </button>
              <button
                type="button"
                className={`ambient-chip ${ambientSound === "rain" ? "active" : ""}`}
                onClick={() => setAmbientSound("rain")}
              >
                <CloudRain size={13} />
                <span>Rain Focus</span>
              </button>
              <button
                type="button"
                className={`ambient-chip ${ambientSound === "brown-noise" ? "active" : ""}`}
                onClick={() => setAmbientSound("brown-noise")}
              >
                <Waves size={13} />
                <span>Deep Noise</span>
              </button>
              <button
                type="button"
                className={`ambient-chip ${ambientSound === "dungeon" ? "active" : ""}`}
                onClick={() => setAmbientSound("dungeon")}
              >
                <Sparkles size={13} />
                <span>Dungeon Drone</span>
              </button>
            </div>
          </div>
        </div>

        <div className="session-history">
          <PanelTitle icon={Timer} title="Riwayat Fokus Hari Ini" />
          <div className="session-list">
            {sessionData?.sessions && sessionData.sessions.length > 0 ? (
              sessionData.sessions.map((session) => (
                <div key={session.id} className="session-item">
                  <div className="session-item-info">
                    <span>{session.quest_title || "General Focus"}</span>
                    <small>
                      {new Date(session.completed_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                  <strong>{session.duration_minutes}m</strong>
                </div>
              ))
            ) : (
              <p className="muted empty-text">Belum ada sesi fokus hari ini.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
