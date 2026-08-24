import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export type DashboardData = {
  dungeon_status: "not-started" | "active" | "completed";
  dungeon_session: any;
  profile: {
    exp: number;
    level: number;
    rank: string;
    streak: number;
    longest_streak: number;
    battle_power: number;
    theme: "dark" | "light";
  };
  level_progress: {
    level: number;
    current_exp: number;
    current_level_exp: number;
    next_level_exp: number;
    progress: number;
  };
  quests: {
    completed: number;
    total: number;
    completion_percent: number;
    items: any[];
  };
  focus: {
    total_minutes: number;
    session_count: number;
  };
  weekly_stats: { label: string; date: string; exp: number; quests: number; focus: number }[];
  heatmap: { date: string; intensity: number }[];
  recent_achievement: { name: string; unlocked: boolean };
};

export function useDashboard() {
  const setProfile = useAuthStore((s) => s.setProfile);

  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      if (res.data.profile) {
        setProfile(res.data.profile);
      }
      localStorage.setItem("sl-dashboard-cache", JSON.stringify(res.data));
      return res.data;
    },
    initialData: () => {
      try {
        const cached = localStorage.getItem("sl-dashboard-cache");
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
    },
    refetchInterval: 30000,
  });
}
