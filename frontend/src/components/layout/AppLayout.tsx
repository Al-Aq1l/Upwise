import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNavigation from "./BottomNavigation";
import SystemNotification from "@/components/ui/SystemNotification";
import { useAuthStore } from "@/lib/auth";

export default function AppLayout() {
  const { profile } = useAuthStore();
  const themeClass = profile?.theme === "light" ? "light" : "dark";
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Always reset scroll position when switching menus
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  return (
    <div className={`app ${themeClass}`}>
      <Sidebar />
      <main className="main" ref={mainRef}>
        <Topbar />
        <div className="page-content-wrapper">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
      <SystemNotification />
    </div>
  );
}
