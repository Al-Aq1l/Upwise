import { useNavigate, useLocation } from "react-router-dom";
import { CircleGauge, ClipboardList, Timer, BarChart3, LayoutGrid } from "lucide-react";
import { useMobileMenuStore } from "@/lib/mobileMenu";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, toggleMenu, closeMenu } = useMobileMenuStore();

  const navItems = [
    { path: "/", label: "Home", icon: CircleGauge },
    { path: "/daily-quest", label: "Quests", icon: ClipboardList },
    { path: "/focus-session", label: "Focus", icon: Timer },
    { path: "/statistics", label: "Stats", icon: BarChart3 },
  ];

  const isMenuSection =
    isOpen ||
    [
      "/achievements",
      "/history",
      "/adventure-journal",
      "/settings",
      "/enter-dungeon",
      "/exit-dungeon",
    ].includes(location.pathname);

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path && !isOpen;

        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => {
              closeMenu();
              navigate(item.path);
            }}
            aria-label={item.label}
          >
            <Icon size={20} />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        className={`bottom-nav-item ${isMenuSection ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Menu Lengkap"
      >
        <LayoutGrid size={20} />
        <span className="bottom-nav-label">Menu</span>
      </button>
    </nav>
  );
}
