import { useLocation, useNavigate } from "react-router-dom";
import {
  CircleGauge,
  ClipboardList,
  Timer,
  BookOpenText,
  BarChart3,
  Trophy,
  Settings,
  Swords,
  LogOut,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useDungeonToday } from "@/hooks/useDungeon";
import Logo from "@/components/ui/Logo";

type NavGroup = {
  label: string;
  items: {
    path: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[];
};

const navGroups: NavGroup[] = [
  {
    label: "Aktivitas",
    items: [
      { path: "/", label: "Dashboard", icon: CircleGauge },
      { path: "/daily-quest", label: "Daily Quest", icon: ClipboardList },
      { path: "/focus-session", label: "Focus Session", icon: Timer },
      { path: "/adventure-journal", label: "Adventure Journal", icon: BookOpenText },
    ],
  },
  {
    label: "Progres",
    items: [
      { path: "/statistics", label: "Statistics", icon: BarChart3 },
      { path: "/achievements", label: "Achievement", icon: Trophy },
    ],
  },
  {
    label: "Sistem",
    items: [
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { data: dungeonState } = useDungeonToday();

  const status = dungeonState?.status || "not-started";

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <div className="brand-mark-logo">
          <Logo size={34} />
        </div>
        <div className="brand-text">
          <strong>Upwise</strong>
          <span>Personal Growth OS</span>
        </div>
      </div>

      {/* Dynamic Dungeon Gate Quick Card */}
      <div className={`sidebar-dungeon-card status-${status}`}>
        <div className="dungeon-card-header">
          <div className="dungeon-card-badge">
            <span className={`pulse-dot dot-${status}`} />
            <span className="dungeon-card-tag">
              {status === "active" ? "IN DUNGEON" : status === "completed" ? "CLEARED" : "STANDBY"}
            </span>
          </div>
          <Sparkles size={14} className="dungeon-card-sparkle" />
        </div>

        <div className="dungeon-card-body">
          <p className="dungeon-card-title">
            {status === "active"
              ? "Dungeon Aktif"
              : status === "completed"
              ? "Dungeon Selesai"
              : "Dungeon Gate"}
          </p>
          <span className="dungeon-card-subtitle">
            {status === "active"
              ? "Catat fokus & selesaikan quest"
              : status === "completed"
              ? "Reward harian sudah diklaim"
              : "Mulai sesi hari ini untuk EXP"}
          </span>
        </div>

        {status === "not-started" && (
          <button
            className="sidebar-dungeon-btn enter-btn"
            onClick={() => navigate("/enter-dungeon")}
          >
            <Swords size={15} />
            <span>Enter Dungeon</span>
          </button>
        )}

        {status === "active" && (
          <button
            className="sidebar-dungeon-btn exit-btn"
            onClick={() => navigate("/exit-dungeon")}
          >
            <LogOut size={15} />
            <span>Exit & Tutup Hari</span>
          </button>
        )}

        {status === "completed" && (
          <div className="sidebar-dungeon-completed">
            <CheckCircle2 size={16} className="text-emerald" />
            <span>Hari ini selesai</span>
          </div>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav className="nav-grouped">
        {navGroups.map((group) => (
          <div key={group.label} className="nav-group">
            <span className="nav-group-title">{group.label}</span>
            <div className="nav-group-items">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Hunter Profile Card at bottom */}
      {user && profile && (
        <div className="hunter-card">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div className="hunter-info">
            <strong>{user.name}</strong>
            <span>{user.title}</span>
          </div>
          <b>Rank {profile.rank}</b>
        </div>
      )}
    </aside>
  );
}
