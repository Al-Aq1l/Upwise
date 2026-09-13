import { useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Check, Volume2, CloudRain, Waves, Sparkles } from "lucide-react";
import { useQuests } from "@/hooks/useQuests";
import { useCreateFocusSession, useFocusSessions } from "@/hooks/useFocusSessions";
import { useNotificationStore } from "@/lib/notifications";
import { usePomodoroStore, setOnPomodoroComplete } from "@/lib/pomodoro";
import { sound } from "@/lib/audio";
import PanelTitle from "@/components/ui/PanelTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function FocusSessionPage() {
  const { data: questData, isLoading: isQuestsLoading } = useQuests();
  const { data: sessionData, isLoading: isSessionsLoading } = useFocusSessions();
  const createSessionMutation = useCreateFocusSession();
  const { showToast, sendBrowserNotification } = useNotificationStore();

  const {
    duration,
    timeLeft,
    isRunning,
    ambientSound,
    selectedQuest,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    setAmbientSound,
    setSelectedQuest,
  } = usePomodoroStore();

  const questRef = useRef(selectedQuest);
  const durationRef = useRef(duration);
  questRef.current = selectedQuest;
  durationRef.current = duration;

  // Register completion handler to global store once
  useEffect(() => {
    setOnPomodoroComplete(() => {
      const q = questRef.current;
      const d = durationRef.current;

      showToast({
        type: "focus",
        title: "Sesi Fokus Selesai!",
        message: `Hebat! Kamu fokus selama ${d} menit pada "${q.title}".`,
        exp: d,
      });
      sendBrowserNotification(
        "Sesi Fokus Selesai!",
        `Fokus ${d} menit selesai! Waktunya istirahat sejenak.`
      );

      createSessionMutation.mutate(
        {
          quest_id: q.id,
          quest_title: q.title,
          duration_minutes: d,
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
    });
  }, []);

  const elapsedSeconds = Math.max(0, duration * 60 - timeLeft);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const hasStarted = isRunning || timeLeft < duration * 60;

  const handleForceComplete = () => {
    if (elapsedSeconds < 60) {
      if (
        window.confirm(
          `Kamu baru fokus selama ${elapsedSeconds} detik (kurang dari 1 menit). Hentikan sesi tanpa mencatat riwayat?`
        )
      ) {
        resetTimer();
        showToast({
          type: "info",
          title: "Sesi Dibatalkan",
          message: "Sesi fokus kurang dari 1 menit tidak dicatat ke riwayat.",
        });
      }
      return;
    }

    if (
      window.confirm(
        `Selesaikan sesi fokus sekarang? Durasi tercatat: ${elapsedMinutes} menit (dari target ${duration} menit).`
      )
    ) {
      resetTimer();
      sound.playTimerFinish();

      showToast({
        type: "focus",
        title: "Sesi Fokus Selesai!",
        message: `Hebat! Kamu fokus selama ${elapsedMinutes} menit pada "${selectedQuest.title}".`,
        exp: elapsedMinutes,
      });
      sendBrowserNotification(
        "Sesi Fokus Selesai!",
        `Fokus ${elapsedMinutes} menit selesai! Waktunya istirahat sejenak.`
      );

      createSessionMutation.mutate(
        {
          quest_id: selectedQuest.id,
          quest_title: selectedQuest.title,
          duration_minutes: elapsedMinutes,
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
          <button
            type="button"
            className="primary-btn-glow"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            className="secondary-btn-glass"
            onClick={resetTimer}
          >
            <RotateCcw size={18} /> Reset
          </button>
          {hasStarted && (
            <button type="button" className="primary" onClick={handleForceComplete}>
              <Check size={18} /> Selesai ({elapsedMinutes > 0 ? `${elapsedMinutes}m` : `${elapsedSeconds}s`})
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
