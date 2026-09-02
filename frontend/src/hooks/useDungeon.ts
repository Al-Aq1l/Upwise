import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useDungeonToday() {
  return useQuery({
    queryKey: ["dungeon-today"],
    queryFn: async () => {
      const res = await api.get("/dungeon/today");
      return res.data;
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { mood: string; energy: number; note?: string }) => {
      const res = await api.post("/dungeon/check-in", data);
      return res.data;
    },
    onMutate: async (newCheckIn) => {
      await queryClient.cancelQueries({ queryKey: ["dungeon-today"] });
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });

      const previousDungeon = queryClient.getQueryData(["dungeon-today"]);
      const previousDashboard = queryClient.getQueryData(["dashboard"]);

      queryClient.setQueryData(["dungeon-today"], {
        status: "active",
        session: {
          status: "active",
          mood: newCheckIn.mood,
          energy: newCheckIn.energy,
          note: newCheckIn.note,
          check_in_at: new Date().toISOString(),
        },
      });

      queryClient.setQueryData(["dashboard"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          dungeon_status: "active",
          profile: {
            ...old.profile,
            exp: (old.profile?.exp ?? 0) + 25,
          },
        };
      });

      return { previousDungeon, previousDashboard };
    },
    onError: (_err, _newCheckIn, context) => {
      if (context?.previousDungeon) {
        queryClient.setQueryData(["dungeon-today"], context.previousDungeon);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(["dashboard"], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dungeon-today"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reflection?: string; learning?: string; productivity: number; end_mood: string }) => {
      const res = await api.post("/dungeon/check-out", data);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["dungeon-today"] });
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });

      const previousDungeon = queryClient.getQueryData(["dungeon-today"]);
      const previousDashboard = queryClient.getQueryData(["dashboard"]);

      queryClient.setQueryData(["dungeon-today"], {
        status: "completed",
      });

      queryClient.setQueryData(["dashboard"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          dungeon_status: "completed",
        };
      });

      return { previousDungeon, previousDashboard };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDungeon) {
        queryClient.setQueryData(["dungeon-today"], context.previousDungeon);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(["dashboard"], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dungeon-today"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
