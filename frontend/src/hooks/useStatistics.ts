import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type DailyStatItem = {
  label: string;
  date: string;
  exp: number;
  quests_completed: number;
  quests_total: number;
  quests: number;
  focus: number;
  productivity: number;
};

export type StatisticsSummary = {
  total_exp: number;
  total_quests_completed: number;
  total_focus_minutes: number;
  avg_productivity: number;
  current_streak: number;
  longest_streak: number;
  level_progress: {
    level: number;
    current_exp: number;
    current_level_exp: number;
    next_level_exp: number;
    progress: number;
  };
};

export type StatisticsData = {
  period: "weekly" | "monthly";
  stats: DailyStatItem[];
  summary: StatisticsSummary;
};

export function useStatistics(period: "weekly" | "monthly" = "weekly") {
  return useQuery<StatisticsData>({
    queryKey: ["statistics", period],
    queryFn: async () => {
      const res = await api.get("/statistics", { params: { period } });
      return res.data;
    },
  });
}

export type HeatmapItem = {
  date: string;
  intensity: number;
  exp: number;
};

export function useHeatmap() {
  return useQuery<{ heatmap: HeatmapItem[] }>({
    queryKey: ["statistics-heatmap"],
    queryFn: async () => {
      const res = await api.get("/statistics/heatmap");
      return res.data;
    },
  });
}
