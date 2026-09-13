import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type HistorySummary = {
  total_focus_minutes: number;
  total_completed_quests: number;
  total_dungeon_clears: number;
  total_journals: number;
};

export type HistoryFocusSession = {
  id: number;
  quest_id: number | null;
  quest_title: string;
  duration_minutes: number;
  started_at: string;
  completed_at: string;
  date: string;
};

export type HistoryQuest = {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Normal" | "Hard";
  category: string;
  exp_reward: number;
  completed: boolean;
  completed_at: string | null;
  date: string;
};

export type HistoryDungeonSession = {
  id: number;
  date: string;
  started_at: string | null;
  completed_at: string | null;
  status: string;
  intention: string | null;
  reflection: string | null;
  rating: number | null;
};

export type HistoryJournal = {
  id: number;
  title: string;
  body: string;
  mood?: string | null;
  created_at: string;
  date?: string | null;
};

export type HistoryData = {
  summary: HistorySummary;
  focus_sessions: HistoryFocusSession[];
  quests: HistoryQuest[];
  dungeon_sessions: HistoryDungeonSession[];
  journals: HistoryJournal[];
};

export function useHistory() {
  return useQuery<HistoryData>({
    queryKey: ["history"],
    queryFn: async () => {
      const res = await api.get("/history");
      return res.data;
    },
  });
}
