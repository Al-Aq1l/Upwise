import { create } from "zustand";
import { sound } from "./audio";

export type SystemToast = {
  id: string;
  title: string;
  message: string;
  type: "quest" | "level" | "dungeon" | "focus" | "achievement" | "info";
  exp?: number;
  duration?: number;
};

interface NotificationState {
  toasts: SystemToast[];
  showToast: (toast: Omit<SystemToast, "id">) => void;
  removeToast: (id: string) => void;
  requestBrowserPermission: () => Promise<boolean>;
  sendBrowserNotification: (title: string, body: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],

  showToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: SystemToast = { ...toast, id };

    // Play appropriate sound effect
    if (toast.type === "quest") {
      sound.playQuestComplete();
    } else if (toast.type === "level" || toast.type === "achievement") {
      sound.playLevelUp();
    } else if (toast.type === "focus") {
      sound.playTimerFinish();
    } else if (toast.type === "dungeon") {
      sound.playCheckIn();
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove toast after duration
    const duration = toast.duration || 4500;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  requestBrowserPermission: async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;

    const perm = await Notification.requestPermission();
    return perm === "granted";
  },

  sendBrowserNotification: (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(`[UPWISE SYSTEM] ${title}`, {
          body,
          icon: "/favicon.png",
          badge: "/favicon.png",
        });
      } catch (e) {}
    }
  },
}));
