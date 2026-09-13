import { create } from "zustand";
import { sound } from "./audio";

export type AmbientType = "none" | "rain" | "brown-noise" | "dungeon";

export type QuestSelection = {
  id: number | null;
  title: string;
};

interface PomodoroState {
  duration: number; // in minutes
  timeLeft: number; // in seconds
  isRunning: boolean;
  targetEndTime: number | null; // epoch timestamp in ms
  ambientSound: AmbientType;
  selectedQuest: QuestSelection;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (minutes: number) => void;
  setAmbientSound: (sound: AmbientType) => void;
  setSelectedQuest: (quest: QuestSelection) => void;
  syncWithRealTime: () => void;
}

const STORAGE_KEY = "upwise_pomodoro_state";
const ORIGINAL_TITLE = "Upwise — Personal Growth OS";

function formatMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateTabTitle(seconds: number, isRunning: boolean) {
  if (typeof document === "undefined") return;
  if (isRunning && seconds > 0) {
    document.title = `[${formatMMSS(seconds)}] Focus Session — Upwise`;
  } else {
    document.title = ORIGINAL_TITLE;
  }
}

// Hydrate initial state from localStorage if available
function getInitialState() {
  const defaultState = {
    duration: 25,
    timeLeft: 25 * 60,
    isRunning: false,
    targetEndTime: null as number | null,
    ambientSound: "none" as AmbientType,
    selectedQuest: { id: null, title: "General Focus" } as QuestSelection,
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);

    // If it was running, check if targetEndTime is still in the future
    if (parsed.isRunning && parsed.targetEndTime) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((parsed.targetEndTime - now) / 1000));
      if (remaining > 0) {
        return {
          ...parsed,
          timeLeft: remaining,
        };
      } else {
        return {
          ...parsed,
          timeLeft: 0,
          isRunning: false,
          targetEndTime: null,
        };
      }
    }

    return {
      ...defaultState,
      duration: parsed.duration || 25,
      timeLeft: parsed.timeLeft || 25 * 60,
      ambientSound: parsed.ambientSound || "none",
      selectedQuest: parsed.selectedQuest || { id: null, title: "General Focus" },
    };
  } catch (e) {
    return defaultState;
  }
}

let completionCallback: (() => void) | null = null;

export const setOnPomodoroComplete = (cb: () => void) => {
  completionCallback = cb;
};

let tickerInterval: NodeJS.Timeout | null = null;

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  const initial = getInitialState();

  const persist = (state: Partial<PomodoroState>) => {
    try {
      const current = {
        duration: get().duration,
        timeLeft: get().timeLeft,
        isRunning: get().isRunning,
        targetEndTime: get().targetEndTime,
        ambientSound: get().ambientSound,
        selectedQuest: get().selectedQuest,
        ...state,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {}
  };

  const handleComplete = () => {
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }

    sound.stopAmbient();
    sound.playTimerFinish();
    updateTabTitle(0, false);

    if (completionCallback) {
      try {
        completionCallback();
      } catch (e) {}
    }

    const duration = get().duration;
    const nextState = {
      isRunning: false,
      targetEndTime: null,
      timeLeft: duration * 60,
    };
    set(nextState);
    persist(nextState);
  };

  const startTicker = () => {
    if (tickerInterval) clearInterval(tickerInterval);

    tickerInterval = setInterval(() => {
      const { isRunning, targetEndTime } = get();
      if (!isRunning || !targetEndTime) {
        if (tickerInterval) {
          clearInterval(tickerInterval);
          tickerInterval = null;
        }
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

      set({ timeLeft: remaining });
      updateTabTitle(remaining, true);

      if (remaining <= 0) {
        handleComplete();
      }
    }, 1000);
  };

  // If page booted with a running timer, start ticker and ambient
  if (initial.isRunning && initial.targetEndTime) {
    startTicker();
    if (initial.ambientSound !== "none") {
      sound.startAmbient(initial.ambientSound as "rain" | "brown-noise" | "dungeon");
    }
    updateTabTitle(initial.timeLeft, true);
  }

  return {
    ...initial,
    onSessionComplete: null,

    startTimer: () => {
      const { timeLeft, ambientSound } = get();
      const targetEndTime = Date.now() + timeLeft * 1000;

      const next = {
        isRunning: true,
        targetEndTime,
      };

      set(next);
      persist(next);

      if (ambientSound !== "none") {
        sound.startAmbient(ambientSound as "rain" | "brown-noise" | "dungeon");
      }

      updateTabTitle(timeLeft, true);
      startTicker();
    },

    pauseTimer: () => {
      if (tickerInterval) {
        clearInterval(tickerInterval);
        tickerInterval = null;
      }

      const { targetEndTime } = get();
      let remaining = get().timeLeft;
      if (targetEndTime) {
        remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
      }

      sound.stopAmbient();
      updateTabTitle(remaining, false);

      const next = {
        isRunning: false,
        targetEndTime: null,
        timeLeft: remaining,
      };

      set(next);
      persist(next);
    },

    resetTimer: () => {
      if (tickerInterval) {
        clearInterval(tickerInterval);
        tickerInterval = null;
      }

      sound.stopAmbient();
      const duration = get().duration;
      updateTabTitle(duration * 60, false);

      const next = {
        isRunning: false,
        targetEndTime: null,
        timeLeft: duration * 60,
      };

      set(next);
      persist(next);
    },

    setDuration: (minutes: number) => {
      const isRunning = get().isRunning;
      const next = {
        duration: minutes,
        ...(isRunning ? {} : { timeLeft: minutes * 60 }),
      };
      set(next);
      persist(next);
    },

    setAmbientSound: (ambient: AmbientType) => {
      set({ ambientSound: ambient });
      persist({ ambientSound: ambient });

      if (get().isRunning) {
        if (ambient !== "none") {
          sound.startAmbient(ambient as "rain" | "brown-noise" | "dungeon");
        } else {
          sound.stopAmbient();
        }
      }
    },

    setSelectedQuest: (quest: QuestSelection) => {
      set({ selectedQuest: quest });
      persist({ selectedQuest: quest });
    },

    syncWithRealTime: () => {
      const { isRunning, targetEndTime } = get();
      if (!isRunning || !targetEndTime) return;

      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

      set({ timeLeft: remaining });
      updateTabTitle(remaining, true);

      if (remaining <= 0) {
        handleComplete();
      }
    },
  };
});

// Attach Page Visibility & Focus listeners to eliminate tab-throttling lag
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      usePomodoroStore.getState().syncWithRealTime();
    }
  });

  window.addEventListener("focus", () => {
    usePomodoroStore.getState().syncWithRealTime();
  });
}
