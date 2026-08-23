import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type Journal = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedJournals = {
  data: Journal[];
  current_page: number;
  last_page: number;
  total: number;
};

export function useJournals(page = 1) {
  return useQuery<PaginatedJournals>({
    queryKey: ["journals", page],
    queryFn: async () => {
      const res = await api.get("/journals", { params: { page } });
      return res.data;
    },
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; body: string }) => {
      const res = await api.post("/journals", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; title: string; body: string }) => {
      const res = await api.put(`/journals/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/journals/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
