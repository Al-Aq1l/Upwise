import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Trophy,
  BarChart3,
  History,
  BookOpenText,
  Swords,
  Settings,
  Moon,
  Sun,
  LogOut,
  CircleGauge,
  ClipboardList,
  Timer,
  ChevronRight,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { useMobileMenuStore } from "@/lib/mobileMenu";
import { useAuthStore } from "@/lib/auth";
import { useLogout } from "@/hooks/useAuth";
import { useUpdateTheme } from "@/hooks/useSettings";

export default function MobileDrawer() {
  const { isOpen, closeMenu } = useMobileMenuStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const logoutMutation = useLogout();
  const { updateTheme } = useUpdateTheme();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    closeMenu();
    navigate(path);
  };

  const handleThemeToggle = () => {
    const nextTheme = profile?.theme === "dark" ? "light" : "dark";
    updateTheme(nextTheme);
  };

  const menuItems = [
    {
      path: "/schedule",
      title: "Jadwal Latihan Gym",
      desc: "Pola split mingguan & menu latihan",
      icon: CalendarDays,
      badge: "Split",
      colorClass: "tile-cyan",
    },
    {
      path: "/statistics",
      title: "Statistik & Progres",
      desc: "Analisis progres otot, EXP & konsistensi gym",
      icon: BarChart3,
      badge: "Analytics",
      colorClass: "tile-cyan",
    },
    {
      path: "/achievements",
      title: "Achievements & Gelar",
      desc: "Lencana kekuatan & rekor angkat beban",
      icon: Trophy,
      badge: "Badges",
      colorClass: "tile-amber",
    },
    {
      path: "/history",
      title: "Riwayat Latihan",
      desc: "Log lengkap sesi latihan & quest gym",
      icon: History,
      badge: "Log",
      colorClass: "tile-emerald",
    },
    {
      path: "/enter-dungeon",
      title: "Gym Workout Gate",
      desc: "Check-in sesi gym & tutup hari",
      icon: Swords,
      badge: "Gate",
      colorClass: "tile-red",
    },
    {
      path: "/settings",
      title: "Pengaturan Sistem",
      desc: "Profil hunter, tema & data akun",
      icon: Settings,
      badge: "System",
      colorClass: "tile-slate",
    },
  ];

  return (
    <div className="mobile-drawer-overlay" onClick={closeMenu}>
      <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="drawer-user-info">
            <div className="drawer-avatar">
              <span>{user?.name?.charAt(0) || "H"}</span>
            </div>
            <div className="drawer-user-text">
              <strong>{user?.name || "Hunter"}</strong>
              <div className="drawer-sub-badges">
                <span className="drawer-rank-tag">Rank {profile?.rank || "E"}</span>
                <span className="drawer-level-tag">Lv. {profile?.level || 1}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn close-drawer-btn"
            aria-label="Tutup Menu"
            onClick={closeMenu}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Grid */}
        <div className="mobile-nav-grid">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={`mobile-nav-tile ${item.colorClass} ${isActive ? "active" : ""}`}
                onClick={() => handleNav(item.path)}
              >
                <div className="tile-icon-wrap">
                  <Icon size={22} />
                </div>
                <div className="tile-content">
                  <div className="tile-title-row">
                    <strong>{item.title}</strong>
                    <span className="tile-badge">{item.badge}</span>
                  </div>
                  <p>{item.desc}</p>
                </div>
                <ChevronRight size={16} className="tile-arrow" />
              </button>
            );
          })}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="mobile-drawer-footer">
          <button
            type="button"
            className="drawer-footer-btn"
            onClick={handleThemeToggle}
          >
            {profile?.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            <span>Tema: {profile?.theme === "light" ? "Light" : "Dark"}</span>
          </button>

          <button
            type="button"
            className="drawer-footer-btn logout-btn"
            onClick={() => {
              closeMenu();
              logoutMutation.mutate();
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
