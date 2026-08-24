import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: { name: string; title: string }) => {
      const res = await api.put("/settings/profile", data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTheme() {
  const setTheme = useAuthStore((s) => s.setTheme);

  return useMutation({
    mutationFn: async (theme: "dark" | "light") => {
      const res = await api.put("/settings/theme", { theme });
      return res.data;
    },
    onMutate: (theme) => {
      setTheme(theme);
    },
    onSuccess: (data) => {
      setTheme(data.theme);
    },
  });
}

export function useUpdateNotifications() {
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (notifications: { checkIn: boolean; checkOut: boolean; quest: boolean }) => {
      const res = await api.put("/settings/notifications", { notifications });
      return res.data;
    },
    onMutate: (notifications) => {
      const cached = localStorage.getItem("sl-profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.notifications = notifications;
        setProfile(parsed);
      }
    },
    onSuccess: (data) => {
      const cached = localStorage.getItem("sl-profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.notifications = data.notifications;
        setProfile(parsed);
      }
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/settings/export");
      return res.data;
    },
  });
}

export function useResetData() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/settings/reset");
      return res.data;
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      window.location.href = "/";
    },
  });
}
