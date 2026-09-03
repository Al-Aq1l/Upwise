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

let themeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastUserChosenTheme: "dark" | "light" | null = null;

export function useUpdateTheme() {
  const setTheme = useAuthStore((s) => s.setTheme);

  const mutation = useMutation({
    mutationFn: async (theme: "dark" | "light") => {
      const res = await api.put("/settings/theme", { theme });
      return { ...res.data, sentTheme: theme };
    },
    onSuccess: (data) => {
      // Guard against race conditions:
      // Only apply if user hasn't changed theme again since this request was sent
      const currentStoreTheme = useAuthStore.getState().profile?.theme;
      if (currentStoreTheme === data.sentTheme) {
        setTheme(data.theme);
      }
    },
    onError: (_err, sentTheme) => {
      // Only rollback if the user is still on the theme that failed
      const currentStoreTheme = useAuthStore.getState().profile?.theme;
      if (currentStoreTheme === sentTheme) {
        setTheme(sentTheme === "dark" ? "light" : "dark");
      }
    },
  });

  const updateTheme = (newTheme: "dark" | "light") => {
    // 1. Instant 0ms visual switch
    lastUserChosenTheme = newTheme;
    setTheme(newTheme);

    // 2. Debounce backend sync so rapid toggling doesn't send conflicting out-of-order requests
    if (themeDebounceTimer) {
      clearTimeout(themeDebounceTimer);
    }

    themeDebounceTimer = setTimeout(() => {
      if (lastUserChosenTheme) {
        mutation.mutate(lastUserChosenTheme);
      }
    }, 450);
  };

  return {
    ...mutation,
    updateTheme,
  };
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
