import { useState, useMemo } from "react";
import {
  Trophy,
  Star,
  Shield,
  Flame,
  BookOpen,
  Timer,
  Crown,
  Zap,
  Swords,
  Compass,
  Lock,
  CheckCircle2,
  Activity,
  Award,
  Sparkles,
  Target,
} from "lucide-react";
import { useAchievements, Achievement } from "@/hooks/useAchievements";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Icon mapping matching the badge_icon values from database seeds
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  sword: Swords,
  flame: Flame,
  sparkles: Sparkles,
  "book-open": BookOpen,
  timer: Timer,
  target: Target,
  shield: Shield,
  crown: Crown,
  clock: Timer,
  zap: Zap,
  swords: Swords,
  castle: Compass,
  trophy: Trophy,
  award: Award,
};

type FilterOption = "all" | "unlocked" | "in_progress" | "locked";

export default function AchievementsPage() {
  const { data, isLoading } = useAchievements();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const achievements = data?.achievements ?? [];

  // Summary Metrics Calculation
  const stats = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievements.filter((a) => a.unlocked).length;
    const inProgress = achievements.filter((a) => !a.unlocked && a.current_value > 0).length;
    const locked = achievements.filter((a) => !a.unlocked && a.current_value === 0).length;
    const resonanceRate = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return { total, unlocked, inProgress, locked, resonanceRate };
  }, [achievements]);

  // Filtered List
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      if (activeFilter === "unlocked") return item.unlocked;
      if (activeFilter === "in_progress") return !item.unlocked && item.current_value > 0;
      if (activeFilter === "locked") return !item.unlocked && item.current_value === 0;
      return true;
    });
  }, [achievements, activeFilter]);

  if (isLoading) {
    return (
      <div className="achievements-container" style={{ minHeight: "300px", display: "grid", placeItems: "center" }}>
        <LoadingSpinner />
        <p className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
          Menghubungkan ke Arsip Hunter...
        </p>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      {/* Hunter HUD Banner */}
      <section className="achievements-hud">
        <div className="hud-header-content">
          <div className="hud-eyebrow">
            <Shield size={13} strokeWidth={2.2} />
            <span>Hunter System // Registry Archive</span>
          </div>
          <h1 className="hud-title">Pencapaian Hunter</h1>
          <p className="hud-description">
            Sistem pengarsipan pencapaian pribadi. Buka gelar kehormatan dan tingkatkan resonansi
            kekuatan melalui disiplin harian.
          </p>
        </div>

        <div className="hud-stats-island">
          <div className="hud-stat-cell">
            <span className="hud-stat-label">Total Gelar</span>
            <span className="hud-stat-value">{stats.total}</span>
          </div>
          <div className="hud-stat-cell">
            <span className="hud-stat-label">Terbuka</span>
            <span className="hud-stat-value highlight">{stats.unlocked}</span>
          </div>
          <div className="hud-stat-cell">
            <span className="hud-stat-label">Resonansi</span>
            <span className="hud-stat-value highlight">{stats.resonanceRate}%</span>
          </div>
        </div>
      </section>

      {/* Tactical Filter Chips */}
      <nav className="achievement-filter-bar" aria-label="Filter Pencapaian">
        <button
          type="button"
          className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          <span>Semua</span>
          <span className="filter-count-badge">{stats.total}</span>
        </button>
        <button
          type="button"
          className={`filter-chip ${activeFilter === "unlocked" ? "active" : ""}`}
          onClick={() => setActiveFilter("unlocked")}
        >
          <span>Terbuka</span>
          <span className="filter-count-badge">{stats.unlocked}</span>
        </button>
        <button
          type="button"
          className={`filter-chip ${activeFilter === "in_progress" ? "active" : ""}`}
          onClick={() => setActiveFilter("in_progress")}
        >
          <span>Dalam Progres</span>
          <span className="filter-count-badge">{stats.inProgress}</span>
        </button>
        <button
          type="button"
          className={`filter-chip ${activeFilter === "locked" ? "active" : ""}`}
          onClick={() => setActiveFilter("locked")}
        >
          <span>Terkunci</span>
          <span className="filter-count-badge">{stats.locked}</span>
        </button>
      </nav>

      {/* Grid of Achievements with Doppelrand Architecture */}
      <div className="achievement-grid">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => {
            const BadgeIcon = iconMap[achievement.badge_icon] || Trophy;
            const isInProgress = !achievement.unlocked && achievement.current_value > 0;
            const progressPercent = Math.min(
              100,
              Math.max(
                0,
                Math.round(
                  (achievement.current_value / Math.max(1, achievement.condition_value)) * 100
                )
              )
            );

            const cardVariant = achievement.unlocked
              ? "unlocked"
              : isInProgress
                ? "in-progress"
                : "locked";

            return (
              <article
                key={achievement.id}
                className={`achievement-card ${cardVariant}`}
              >
                <div className="achievement-card-inner">
                  <header className="achievement-card-header">
                    <div className="achievement-badge-wrapper">
                      <BadgeIcon size={24} strokeWidth={1.8} />
                    </div>
                    <span className="achievement-status-tag">
                      {achievement.unlocked ? (
                        <>
                          <CheckCircle2 size={12} strokeWidth={2.2} />
                          <span>Terbuka</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Activity size={12} strokeWidth={2.2} />
                          <span>Progres</span>
                        </>
                      ) : (
                        <>
                          <Lock size={12} strokeWidth={2} />
                          <span>Terkunci</span>
                        </>
                      )}
                    </span>
                  </header>

                  <div className="achievement-content">
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                  </div>

                  {/* Progress Bar for Non-Unlocked Cards */}
                  {!achievement.unlocked ? (
                    <div className="achievement-progress-tracker">
                      <div className="progress-header">
                        <span className="progress-label">Progres Resonansi</span>
                        <span className="progress-value">
                          {achievement.current_value} / {achievement.condition_value} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <footer className="achievement-unlocked-seal">
                      <Sparkles size={13} />
                      <span>Terbuka & Terintegrasi dengan Sistem</span>
                    </footer>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="panel" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px" }}>
            <p className="muted" style={{ margin: "0 0 12px 0" }}>
              Tidak ada pencapaian dalam kategori ini.
            </p>
            {activeFilter !== "all" && (
              <button
                type="button"
                className="filter-chip"
                onClick={() => setActiveFilter("all")}
                style={{ margin: "0 auto" }}
              >
                Lihat Semua Pencapaian
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
