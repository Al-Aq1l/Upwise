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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dungeon-today"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
