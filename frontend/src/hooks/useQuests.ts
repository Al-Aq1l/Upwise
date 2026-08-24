import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type Quest = {
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

export function useQuests(date?: string) {
  return useQuery<{ quests: Quest[] }>({
    queryKey: ["quests", date],
    queryFn: async () => {
      const res = await api.get("/quests", { params: { date } });
      return res.data;
    },
  });
}

export function useCreateQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; difficulty: "Easy" | "Normal" | "Hard"; category?: string }) => {
      const res = await api.post("/quests", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; title: string; description?: string; difficulty: "Easy" | "Normal" | "Hard"; category?: string }) => {
      const res = await api.put(`/quests/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/quests/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useToggleQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/quests/${id}/toggle`);
      return res.data;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["quests"] });
      queryClient.setQueriesData({ queryKey: ["quests"] }, (old: any) => {
        if (!old || !old.quests) return old;
        return {
          ...old,
          quests: old.quests.map((q: Quest) =>
            q.id === id ? { ...q, completed: !q.completed } : q
          ),
        };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
