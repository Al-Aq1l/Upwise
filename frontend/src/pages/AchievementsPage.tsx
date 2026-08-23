import { Trophy, Star, Shield, Flame, BookOpen, Timer, Crown, Zap, Swords, Compass } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Icon mapping dictionary matching the badge_icon values from database seeds
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  sword: Swords,
  flame: Flame,
  sparkles: Star,
  "book-open": BookOpen,
  timer: Timer,
  target: TargetIcon,
  shield: Shield,
  crown: Crown,
  clock: Timer,
  zap: Zap,
  swords: Swords,
  castle: Compass,
};

function TargetIcon({ size, className }: { size?: number; className?: string }) {
  return <Star size={size} className={className} />;
}

export default function AchievementsPage() {
  const { data, isLoading } = useAchievements();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="achievement-grid">
      {data?.achievements && data.achievements.length > 0 ? (
        data.achievements.map((achievement) => {
          const BadgeIcon = iconMap[achievement.badge_icon] || Trophy;
          return (
            <article
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"}`}
            >
              <div className="achievement-badge-wrapper">
                <BadgeIcon size={34} className="achievement-badge-icon" />
              </div>
              <div className="achievement-content">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                {!achievement.unlocked && (
                  <div className="achievement-progress-tracker">
                    <small>
                      Progress: {achievement.current_value} / {achievement.condition_value}
                    </small>
                  </div>
                )}
              </div>
              <span className="achievement-status-tag">
                {achievement.unlocked ? "Terbuka" : "Terkunci"}
              </span>
            </article>
          );
        })
      ) : (
        <p className="muted empty-text">Gagal memuat daftar pencapaian.</p>
      )}
    </div>
  );
}
