import { useLocation } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useLogout } from "@/hooks/useAuth";
import { useUpdateTheme } from "@/hooks/useSettings";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/enter-dungeon": "Enter Dungeon",
  "/daily-quest": "Daily Quest",
  "/focus-session": "Focus Session",
  "/adventure-journal": "Adventure Journal",
  "/exit-dungeon": "Exit Dungeon",
  "/statistics": "Statistics",
  "/achievements": "Achievement",
  "/settings": "Settings",
};

export default function Topbar() {
  const location = useLocation();
  const logoutMutation = useLogout();
  const themeMutation = useUpdateTheme();
  const { profile } = useAuthStore();

  const title = pageTitles[location.pathname] || "Upwise";
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleThemeToggle = () => {
    const nextTheme = profile?.theme === "dark" ? "light" : "dark";
    themeMutation.mutate(nextTheme);
  };

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">{today}</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button
          className="icon-btn"
          aria-label="Toggle tema"
          onClick={handleThemeToggle}
        >
          {profile?.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          className="ghost"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </header>
  );
}
