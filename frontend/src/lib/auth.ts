import { create } from "zustand";

export type UserData = {
  id: number;
  name: string;
  email: string;
  title: string;
};

export type ProfileData = {
  exp: number;
  level: number;
  rank: string;
  streak: number;
  longest_streak: number;
  battle_power: number;
  theme: "dark" | "light";
  notifications: {
    checkIn: boolean;
    checkOut: boolean;
    quest: boolean;
  };
};

type AuthStore = {
  token: string | null;
  user: UserData | null;
  profile: ProfileData | null;
  setAuth: (token: string, user: UserData) => void;
  setProfile: (profile: ProfileData) => void;
  setUser: (user: UserData) => void;
  setTheme: (theme: "dark" | "light") => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem("sl-token"),
  user: JSON.parse(localStorage.getItem("sl-user") || "null"),
  profile: JSON.parse(localStorage.getItem("sl-profile") || "null"),

  setAuth: (token, user) => {
    localStorage.setItem("sl-token", token);
    localStorage.setItem("sl-user", JSON.stringify(user));
    set({ token, user });
  },

  setProfile: (profile) => {
    localStorage.setItem("sl-profile", JSON.stringify(profile));
    set({ profile });
  },

  setUser: (user) => {
    localStorage.setItem("sl-user", JSON.stringify(user));
    set({ user });
  },

  setTheme: (theme) => {
    set((state) => {
      const newProfile = state.profile ? { ...state.profile, theme } : null;
      if (newProfile) localStorage.setItem("sl-profile", JSON.stringify(newProfile));
      return { profile: newProfile };
    });
  },

  logout: () => {
    localStorage.removeItem("sl-token");
    localStorage.removeItem("sl-user");
    localStorage.removeItem("sl-profile");
    set({ token: null, user: null, profile: null });
  },
}));
