import { useNavigate, useLocation } from "react-router-dom";
import { CircleGauge, ClipboardList, Swords, Timer, Settings } from "lucide-react";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: CircleGauge },
    { path: "/daily-quest", label: "Quests", icon: ClipboardList },
    { path: "/enter-dungeon", label: "Dungeon", icon: Swords, primary: true },
    { path: "/focus-session", label: "Focus", icon: Timer },
    { path: "/settings", label: "More", icon: Settings },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === "/settings" && ["/adventure-journal", "/statistics", "/achievements"].includes(location.pathname));
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
