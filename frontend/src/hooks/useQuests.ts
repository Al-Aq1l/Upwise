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
      if (!date) {
        localStorage.setItem("sl-quests-cache", JSON.stringify(res.data));
      }
      return res.data;
    },
    initialData: () => {
      if (date) return undefined;
      try {
        const cached = localStorage.getItem("sl-quests-cache");
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
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
    onMutate: async (newQuestData) => {
      await queryClient.cancelQueries({ queryKey: ["quests"] });
      const previousQuests = queryClient.getQueriesData({ queryKey: ["quests"] });

      const expRewards = { Easy: 50, Normal: 80, Hard: 120 };
      const optimisticQuest: Quest = {
        id: Date.now(),
        title: newQuestData.title,
        description: newQuestData.description || "Quest personal hari ini.",
        difficulty: newQuestData.difficulty,
        category: newQuestData.category || "Personal",
        exp_reward: expRewards[newQuestData.difficulty] || 80,
        completed: false,
        completed_at: null,
        date: new Date().toISOString().split("T")[0],
      };

      queryClient.setQueriesData({ queryKey: ["quests"] }, (old: any) => {
        if (!old || !old.quests) return { quests: [optimisticQuest] };
        return {
          ...old,
          quests: [optimisticQuest, ...old.quests],
        };
      });

      return { previousQuests };
    },
    onError: (_err, _newQuest, context) => {
      if (context?.previousQuests) {
        context.previousQuests.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
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
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["quests"] });
      const previousQuests = queryClient.getQueriesData({ queryKey: ["quests"] });

      queryClient.setQueriesData({ queryKey: ["quests"] }, (old: any) => {
        if (!old || !old.quests) return old;
        return {
          ...old,
          quests: old.quests.filter((q: Quest) => q.id !== id),
        };
      });

      return { previousQuests };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQuests) {
        context.previousQuests.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
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
