import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post("/login", data);
      return res.data;
    },
    onSuccess: async (data) => {
      setAuth(data.token, data.user);
      // Fetch profile after login
      const me = await api.get("/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (me.data.profile) {
        setProfile(me.data.profile);
      }
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      await api.post("/logout");
    },
    onSettled: () => {
      logout();
    },
  });
}
