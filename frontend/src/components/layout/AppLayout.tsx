import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNavigation from "./BottomNavigation";
import SystemNotification from "@/components/ui/SystemNotification";
import { useAuthStore } from "@/lib/auth";

export default function AppLayout() {
  const { profile } = useAuthStore();
  const themeClass = profile?.theme === "light" ? "light" : "dark";

  return (
    <div className={`app ${themeClass}`}>
      <Sidebar />
      <main className="main">
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
