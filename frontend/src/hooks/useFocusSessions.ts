import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type FocusSession = {
  id: number;
  quest_id: number | null;
  duration_minutes: number;
  quest_title: string | null;
  started_at: string;
  completed_at: string;
  date: string;
};

export function useFocusSessions(date?: string) {
  return useQuery<{ sessions: FocusSession[]; total_minutes: number }>({
    queryKey: ["focus-sessions", date],
    queryFn: async () => {
      const res = await api.get("/focus-sessions", { params: { date } });
      return res.data;
    },
  });
}

export function useCreateFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { quest_id?: number | null; quest_title?: string; duration_minutes: number }) => {
      const res = await api.post("/focus-sessions", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
