import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Flame,
  Swords,
  Timer,
  ClipboardList,
  BarChart3,
  CalendarDays,
  Trophy,
  Target,
  Shield,
  Zap,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDungeonToday } from "@/hooks/useDungeon";
import { useToggleQuest } from "@/hooks/useQuests";
import { useAuthStore } from "@/lib/auth";
import Metric from "@/components/ui/Metric";
import PanelTitle from "@/components/ui/PanelTitle";
import Progress from "@/components/ui/Progress";
import MiniChart from "@/components/ui/MiniChart";
import QuestRow from "@/components/ui/QuestRow";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, isError } = useDashboard();
  const { data: dungeonToday } = useDungeonToday();
  const toggleQuestMutation = useToggleQuest();

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) {
    return <div className="error-panel">Gagal memuat dashboard. Silakan refresh halaman.</div>;
  }

  const {
    dungeon_status,
    profile,
    level_progress,
    quests,
    focus,
    weekly_stats,
    heatmap,
    recent_achievement,
  } = data;

  // Unify dungeon status: if either hook reports completed, today is completed!
  const effectiveStatus =
    dungeonToday?.status === "completed" || dungeon_status === "completed"
      ? "completed"
      : dungeonToday?.status || dungeon_status || "not-started";

  const statusConfig = {
    "not-started": {
      label: "Belum Check-in",
      subtext: "Gate belum dimasuki hari ini. Mulai sesi dungeon untuk mencatat fokus dan quest!",
      badge: "STANDBY",
      statusClass: "status-standby",
    },
    active: {
      label: "Sedang di Dungeon",
      subtext: "Dungeon aktif! Selesaikan daily quest dan sesi fokus untuk mengumpulkan EXP.",
      badge: "IN DUNGEON",
      statusClass: "status-active",
    },
    completed: {
      label: "Dungeon Selesai",
      subtext: "Daily dungeon telah selesai. Kerja bagus untuk aktivitas hari ini!",
      badge: "CLEARED",
      statusClass: "status-completed",
    },
  };

  const currentStatus = statusConfig[effectiveStatus] || statusConfig["not-started"];

  const handleQuestToggle = (id: number) => {
    toggleQuestMutation.mutate(id);
  };

  // Generate 7-day calendar strip centered on today
  const calendarStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return {
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === new Date().toDateString(),
      fullDate: d,
    };
  });

  return (
    <div className="content-grid dashboard-grid">
      {/* Dynamic calendar strip */}
      <section className="calendar-strip-panel span-4">
        <div className="calendar-strip-header">
          <div className="calendar-title-group">
            <CalendarDays size={18} className="calendar-icon-accent" />
            <span className="calendar-strip-title">Timeline Aktivitas</span>
          </div>
          <span className="calendar-today-badge">Hari Ini</span>
        </div>
        <div className="calendar-strip-container">
          {calendarStrip.map((day, idx) => (
            <div
              key={idx}
              className={`calendar-day-card ${day.isToday ? "active" : ""}`}
            >
              <span className="calendar-day-name">{day.dayName}</span>
              <span className="calendar-day-num">{day.dayNum}</span>
              {day.isToday && <span className="today-dot" />}
            </div>
          ))}
        </div>
      </section>

      {/* Hunter Status HUD Hero Card */}
      <section className="hunter-status-card span-4">
        <div className="status-card-glow-layer" />
        <div className="status-card-inner">
          <div className="status-card-top">
            <div className="status-meta">
              <div className="status-badge-group">
                <span className={`hunter-live-dot ${currentStatus.statusClass}`} />
                <span className="hunter-system-tag">{currentStatus.badge}</span>
                <span className="hunter-title-tag">{user?.title || "Shadow Monarch"}</span>
              </div>
              <h2 className="status-headline">{currentStatus.label}</h2>
              <p className="status-subtext">{currentStatus.subtext}</p>
            </div>

            {/* Hunter Rank Crest Badge */}
            <div className={`rank-crest-badge rank-crest-${profile.rank.toLowerCase()}`}>
              <div className="rank-crest-glow" />
              <div className="rank-crest-content">
                <span className="rank-crest-label">RANK</span>
                <strong className="rank-crest-letter">{profile.rank}</strong>
              </div>
            </div>
          </div>

          {/* Quick Stat Chips */}
          <div className="hunter-stat-chips">
            <div className="stat-chip">
              <Zap size={14} className="stat-chip-icon text-cyan" />
              <span className="stat-chip-val">{profile.exp.toLocaleString("id-ID")}</span>
              <span className="stat-chip-lbl">EXP</span>
            </div>
            <div className="stat-chip">
              <Flame size={14} className="stat-chip-icon text-amber" />
              <span className="stat-chip-val">{profile.streak} Hari</span>
              <span className="stat-chip-lbl">Streak</span>
            </div>
            <div className="stat-chip">
              <Swords size={14} className="stat-chip-icon text-rose" />
              <span className="stat-chip-val">{profile.battle_power.toLocaleString("id-ID")}</span>
              <span className="stat-chip-lbl">BP</span>
            </div>
          </div>

          {/* Mini Level EXP Progress inside HUD */}
          <div className="hunter-hud-progress">
            <div className="hud-progress-info">
              <span className="hud-progress-label">
                <Sparkles size={13} className="text-cyan" /> Level {profile.level} Hunter
              </span>
              <span className="hud-progress-val">{level_progress.progress}%</span>
            </div>
            <div className="hud-progress-bar-bg">
              <div
                className="hud-progress-bar-fill"
                style={{ width: `${Math.min(100, Math.max(5, level_progress.progress))}%` }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="status-action-row">
            {effectiveStatus !== "completed" ? (
              <button
                className="hunter-action-btn primary-btn-glow"
                onClick={() =>
                  navigate(effectiveStatus === "active" ? "/exit-dungeon" : "/enter-dungeon")
                }
              >
                <Swords size={18} />
                <span>{effectiveStatus === "active" ? "Exit Dungeon" : "Enter Dungeon"}</span>
              </button>
            ) : (
              <button
                className="hunter-action-btn secondary-btn-glass"
                onClick={() => navigate("/statistics")}
              >
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Dungeon Cleared</span>
              </button>
            )}
            <button
              className="hunter-action-btn secondary-btn-glass"
              onClick={() => navigate("/daily-quest")}
            >
              <Target size={18} />
              <span>Kelola Quest</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Metrics arranged in a responsive 2x2 on mobile, 4-col on desktop */}
      <div className="dashboard-metrics-grid span-4">
        <Metric
          icon={Sparkles}
          label="Hunter Level"
          value={`Lv. ${profile.level}`}
          detail={`${level_progress.progress}% menuju level berikutnya`}
          variant="cyan"
        />
        <Metric
          icon={Flame}
          label="Current Streak"
          value={`${profile.streak} hari`}
          detail={`Terpanjang ${profile.longest_streak} hari`}
          variant="amber"
        />
        <Metric
          icon={Swords}
          label="Battle Power"
          value={profile.battle_power.toLocaleString("id-ID")}
          detail="Level + streak + fokus + quest"
          variant="rose"
        />
        <Metric
          icon={Timer}
          label="Focus"
          value={`${focus.total_minutes} menit`}
          detail={`${focus.session_count} sesi tercatat`}
          variant="purple"
        />
      </div>

      {/* Daily Quest Section */}
      <section className="panel span-2">
        <PanelTitle icon={ClipboardList} title="Daily Quest" />
        <div className="quest-list compact">
          {quests.items.length > 0 ? (
            quests.items.map((quest) => (
              <QuestRow
                key={quest.id}
                quest={quest}
                onToggle={handleQuestToggle}
              />
            ))
          ) : (
            <p className="muted empty-text">Tidak ada quest hari ini. Silakan buat quest baru!</p>
          )}
        </div>
      </section>

      {/* EXP Progress Section - span-2 to fill row alongside Daily Quest */}
      <section className="panel span-2">
        <PanelTitle icon={Sparkles} title="EXP Progress" />
        <Progress value={level_progress.progress} />
        <p className="muted progress-desc">{quests.completion_percent}% quest selesai hari ini.</p>
      </section>

      {/* Weekly Stats */}
      <section className="panel span-2">
        <PanelTitle icon={BarChart3} title="Statistik Mingguan" />
        <MiniChart data={weekly_stats} metric="exp" />
      </section>

      {/* Activity Heatmap */}
      <section className="panel span-1 heatmap-panel">
        <PanelTitle icon={CalendarDays} title="Activity Heatmap" />
        <div className="heatmap">
          {heatmap.slice(-35).map((day, index) => (
            <span
              key={index}
              className={`h${day.intensity}`}
              title={`${day.date}: intensity ${day.intensity}`}
            />
          ))}
        </div>
      </section>

      {/* Recent Achievement */}
      <section className="panel span-1 achievement-panel">
        <PanelTitle icon={Trophy} title="Achievement Terbaru" />
        <div className={`achievement-mini ${recent_achievement.unlocked ? "unlocked" : ""}`}>
          <Trophy size={34} />
          <strong>{recent_achievement.name}</strong>
          <span>{recent_achievement.unlocked ? "Terbuka" : "Terkunci"}</span>
        </div>
      </section>
    </div>
  );
}

