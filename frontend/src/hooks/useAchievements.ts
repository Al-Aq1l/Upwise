import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type Achievement = {
  id: number;
  name: string;
  description: string;
  badge_icon: string;
  condition_type: string;
  condition_value: number;
  current_value: number;
  unlocked: boolean;
  unlocked_at: string | null;
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    name: "First Gate Cleared",
    description: "Selesaikan quest pertama di dalam gate.",
    condition_type: "quest_completed_total",
    condition_value: 1,
    current_value: 1,
    unlocked: true,
    unlocked_at: "2026-09-01T10:00:00Z",
    badge_icon: "sword",
  },
  {
    id: 2,
    name: "Dungeon Discipline",
    description: "Capai streak 7 hari berturut-turut.",
    condition_type: "streak",
    condition_value: 7,
    current_value: 5,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "flame",
  },
  {
    id: 3,
    name: "Awakened Hunter",
    description: "Naik ke Level 5 dalam sistem Solo Leveling.",
    condition_type: "level",
    condition_value: 5,
    current_value: 5,
    unlocked: true,
    unlocked_at: "2026-09-05T14:30:00Z",
    badge_icon: "sparkles",
  },
  {
    id: 4,
    name: "Scholar of Shadows",
    description: "Tulis 5 entri jurnal petualangan harian.",
    condition_type: "journal_count",
    condition_value: 5,
    current_value: 3,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "book-open",
  },
  {
    id: 5,
    name: "Focus Blade",
    description: "Kumpulkan 120 menit fokus penuh waktu.",
    condition_type: "focus_minutes_total",
    condition_value: 120,
    current_value: 90,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "timer",
  },
  {
    id: 6,
    name: "Quest Machine",
    description: "Selesaikan 50 quest harian total.",
    condition_type: "quest_completed_total",
    condition_value: 50,
    current_value: 18,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "target",
  },
  {
    id: 7,
    name: "Iron Will",
    description: "Pertahankan kedisiplinan streak hingga 14 hari.",
    condition_type: "streak",
    condition_value: 14,
    current_value: 5,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "shield",
  },
  {
    id: 8,
    name: "Shadow Monarch",
    description: "Tembus batas kebangkitan dan capai Level 10.",
    condition_type: "level",
    condition_value: 10,
    current_value: 6,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "crown",
  },
  {
    id: 9,
    name: "Time Mage",
    description: "Akumulasikan 500 menit fokus di dalam dungeon.",
    condition_type: "focus_minutes_total",
    condition_value: 500,
    current_value: 90,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "clock",
  },
  {
    id: 10,
    name: "S-Rank Candidate",
    description: "Lewati 8.000 Battle Power pada radar sistem.",
    condition_type: "battle_power",
    condition_value: 8000,
    current_value: 3450,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "zap",
  },
  {
    id: 11,
    name: "Arise!",
    description: "Capai Level 20 dan panggil pasukan bayangan.",
    condition_type: "level",
    condition_value: 20,
    current_value: 6,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "swords",
  },
  {
    id: 12,
    name: "Dungeon Master",
    description: "Selesaikan 30 sesi eksplorasi dungeon penuh.",
    condition_type: "dungeon_sessions_total",
    condition_value: 30,
    current_value: 12,
    unlocked: false,
    unlocked_at: null,
    badge_icon: "castle",
  },
];

export function useAchievements() {
  return useQuery<{ achievements: Achievement[] }>({
    queryKey: ["achievements"],
    queryFn: async () => {
      try {
        const res = await api.get("/achievements");
        if (res.data?.achievements && res.data.achievements.length > 0) {
          return res.data;
        }
      } catch (err) {
        // Fall back gracefully to seeded offline registry
      }
      return { achievements: DEFAULT_ACHIEVEMENTS };
    },
  });
}
