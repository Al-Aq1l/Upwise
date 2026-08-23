import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type Achievement = {
  id: number;
  name: string;
  description: string;
  badge_icon: string;
  condition_type: string;
  condition_value: number;
  current_value: number;
  unlocked: boolean;
  unlocked_at: string | null;
};

export function useAchievements() {
  return useQuery<{ achievements: Achievement[] }>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await api.get("/achievements");
      return res.data;
    },
  });
}
