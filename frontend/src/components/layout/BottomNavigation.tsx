import { useNavigate, useLocation } from "react-router-dom";
import { CircleGauge, ClipboardList, Swords, Timer, Settings, LogOut } from "lucide-react";
import { useDungeonToday } from "@/hooks/useDungeon";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: dungeonState } = useDungeonToday();

  const status = dungeonState?.status || "not-started";
  const dungeonPath = status === "active" ? "/exit-dungeon" : "/enter-dungeon";
  const dungeonLabel = status === "active" ? "Exit" : "Dungeon";
  const DungeonIcon = status === "active" ? LogOut : Swords;

  const navItems = [
    { path: "/", label: "Home", icon: CircleGauge },
    { path: "/daily-quest", label: "Quests", icon: ClipboardList },
    { path: dungeonPath, label: dungeonLabel, icon: DungeonIcon, primary: true, isDungeon: true },
    { path: "/focus-session", label: "Focus", icon: Timer },
    { path: "/settings", label: "More", icon: Settings },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.isDungeon
            ? ["/enter-dungeon", "/exit-dungeon"].includes(location.pathname)
            : location.pathname === item.path ||
              (item.path === "/settings" &&
                ["/adventure-journal", "/statistics", "/achievements"].includes(location.pathname));

        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive ? "active" : ""} ${item.primary ? "primary-action-btn" : ""}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <Icon size={item.primary ? 24 : 20} />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
