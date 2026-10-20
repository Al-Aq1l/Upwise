import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Layers,
  ChevronRight,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useCreateQuest } from "@/hooks/useQuests";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";

export type DaySchedule = {
  dayName: string; // "Senin", "Selasa", ...
  splitTitle: string; // "Push Day - Dada & Bahu"
  focusArea: string; // "Dada, Bahu Depan/Samping, Triceps"
  category: "Push" | "Pull" | "Legs" | "Core" | "Cardio" | "Recovery";
  isRestDay: boolean;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    category: string;
    difficulty: "Easy" | "Normal" | "Hard";
  }[];
};

export type SplitTemplate = "ppl" | "upper_lower" | "bro_split" | "solo_awakening";

const DEFAULT_SCHEDULES: Record<SplitTemplate, { name: string; desc: string; days: DaySchedule[] }> = {
  ppl: {
    name: "Push - Pull - Legs (PPL 6 Hari)",
    desc: "Program gym klasik paling efektif untuk pembentukan hipertrofi dan kekuatan otot teratur.",
    days: [
      {
        dayName: "Senin",
        splitTitle: "Push Day 1: Dada & Bahu",
        focusArea: "Dada, Bahu, Triceps",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "p1-1", name: "Barbell Bench Press", sets: 4, reps: "8-10 reps", category: "Push", difficulty: "Hard" },
          { id: "p1-2", name: "Incline Dumbbell Press", sets: 3, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "p1-3", name: "Overhead Dumbbell Shoulder Press", sets: 3, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "p1-4", name: "Lateral Raises (Bahu Samping)", sets: 4, reps: "15 reps", category: "Push", difficulty: "Normal" },
          { id: "p1-5", name: "Triceps Rope Pushdown", sets: 3, reps: "12-15 reps", category: "Push", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Selasa",
        splitTitle: "Pull Day 1: Punggung & Biceps",
        focusArea: "Sayap Punggung, Upper Back, Biceps",
        category: "Pull",
        isRestDay: false,
        exercises: [
          { id: "pl1-1", name: "Lat Pulldown / Wide Pull-ups", sets: 4, reps: "8-10 reps", category: "Pull", difficulty: "Hard" },
          { id: "pl1-2", name: "Barbell Bent-Over Row", sets: 4, reps: "8-10 reps", category: "Pull", difficulty: "Hard" },
          { id: "pl1-3", name: "Chest Supported Dumbbell Row", sets: 3, reps: "10-12 reps", category: "Pull", difficulty: "Normal" },
          { id: "pl1-4", name: "Face Pulls (Rear Delts)", sets: 4, reps: "15 reps", category: "Pull", difficulty: "Easy" },
          { id: "pl1-5", name: "Incline Dumbbell Biceps Curl", sets: 3, reps: "12 reps", category: "Pull", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Rabu",
        splitTitle: "Leg Day 1: Quads & Hamstrings",
        focusArea: "Paha Depan, Paha Belakang, Betis",
        category: "Legs",
        isRestDay: false,
        exercises: [
          { id: "l1-1", name: "Barbell Back Squat", sets: 4, reps: "6-8 reps", category: "Legs", difficulty: "Hard" },
          { id: "l1-2", name: "Romanian Deadlift (RDL)", sets: 3, reps: "10-12 reps", category: "Legs", difficulty: "Hard" },
          { id: "l1-3", name: "Leg Press", sets: 3, reps: "12-15 reps", category: "Legs", difficulty: "Normal" },
          { id: "l1-4", name: "Leg Extension & Hamstring Curl", sets: 3, reps: "15 reps", category: "Legs", difficulty: "Normal" },
          { id: "l1-5", name: "Standing Calf Raises", sets: 4, reps: "15-20 reps", category: "Legs", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Kamis",
        splitTitle: "Push Day 2: Hypertrophy & Dips",
        focusArea: "Dada Bawah/Tengah, Bahu, Triceps",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "p2-1", name: "Dumbbell Flat Bench Press", sets: 4, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "p2-2", name: "Chest Dips (Weighted / Bodyweight)", sets: 3, reps: "10-12 reps", category: "Push", difficulty: "Hard" },
          { id: "p2-3", name: "Cable Chest Flyes", sets: 3, reps: "15 reps", category: "Push", difficulty: "Normal" },
          { id: "p2-4", name: "Seated Arnold Press", sets: 3, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "p2-5", name: "Skull Crushers (Triceps Extension)", sets: 3, reps: "12 reps", category: "Push", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Jumat",
        splitTitle: "Pull Day 2: Deadlift & Thickness",
        focusArea: "Punggung Tengah, Trapezius, Lengan",
        category: "Pull",
        isRestDay: false,
        exercises: [
          { id: "pl2-1", name: "Conventional / Trap Bar Deadlift", sets: 3, reps: "5-6 reps", category: "Pull", difficulty: "Hard" },
          { id: "pl2-2", name: "Seated Cable Row (V-Grip)", sets: 4, reps: "10-12 reps", category: "Pull", difficulty: "Normal" },
          { id: "pl2-3", name: "Single Arm Dumbbell Row", sets: 3, reps: "10 reps", category: "Pull", difficulty: "Normal" },
          { id: "pl2-4", name: "Hammer Curls (Brachialis)", sets: 3, reps: "12-15 reps", category: "Pull", difficulty: "Normal" },
          { id: "pl2-5", name: "Barbell Shrugs (Traps)", sets: 3, reps: "15 reps", category: "Pull", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Sabtu",
        splitTitle: "Legs & Core Conditioning",
        focusArea: "Paha, Glutes, Perut & Core",
        category: "Legs",
        isRestDay: false,
        exercises: [
          { id: "l2-1", name: "Bulgarian Split Squats", sets: 3, reps: "10 reps per leg", category: "Legs", difficulty: "Hard" },
          { id: "l2-2", name: "Goblet Squats", sets: 3, reps: "12-15 reps", category: "Legs", difficulty: "Normal" },
          { id: "l2-3", name: "Hanging Leg Raises (Perut Bawah)", sets: 4, reps: "12-15 reps", category: "Core", difficulty: "Normal" },
          { id: "l2-4", name: "Plank 3 Menit & Ab Wheel Rollout", sets: 3, reps: "10-12 reps", category: "Core", difficulty: "Normal" },
          { id: "l2-5", name: "Incline Treadmill Cardio 20m", sets: 1, reps: "20 menit", category: "Cardio", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Minggu",
        splitTitle: "Rest & Active Muscle Recovery",
        focusArea: "Regenerasi Serat Otot, Hidrasi & Protein",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "r-1", name: "Penuhi Target Protein 150g", sets: 1, reps: "Sepanjang hari", category: "Recovery", difficulty: "Easy" },
          { id: "r-2", name: "Foam Rolling & Full Body Stretching 15m", sets: 1, reps: "15 menit", category: "Recovery", difficulty: "Easy" },
          { id: "r-3", name: "Tidur Berkualitas 8 Jam untuk Recovery", sets: 1, reps: "Malam hari", category: "Recovery", difficulty: "Easy" },
        ],
      },
    ],
  },
  upper_lower: {
    name: "Upper - Lower Split (4 Hari)",
    desc: "Optimal untuk yang ingin latihan 4 kali seminggu dengan frekuensi pemulihan otot maksimal.",
    days: [
      {
        dayName: "Senin",
        splitTitle: "Upper Body Power",
        focusArea: "Dada, Punggung, Bahu, Lengan",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "ul-1", name: "Barbell Bench Press", sets: 4, reps: "6-8 reps", category: "Push", difficulty: "Hard" },
          { id: "ul-2", name: "Barbell Bent-Over Row", sets: 4, reps: "6-8 reps", category: "Pull", difficulty: "Hard" },
          { id: "ul-3", name: "Overhead Military Press", sets: 3, reps: "8-10 reps", category: "Push", difficulty: "Normal" },
          { id: "ul-4", name: "Pull-ups / Chin-ups", sets: 3, reps: "8-10 reps", category: "Pull", difficulty: "Hard" },
          { id: "ul-5", name: "Barbell Biceps Curl & Dips Superset", sets: 3, reps: "12 reps", category: "Push", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Selasa",
        splitTitle: "Lower Body Power",
        focusArea: "Squat, Deadlift Variation, Kaki Kuat",
        category: "Legs",
        isRestDay: false,
        exercises: [
          { id: "ul-6", name: "Barbell Back Squat", sets: 4, reps: "6-8 reps", category: "Legs", difficulty: "Hard" },
          { id: "ul-7", name: "Romanian Deadlift", sets: 3, reps: "8-10 reps", category: "Legs", difficulty: "Hard" },
          { id: "ul-8", name: "Leg Press", sets: 3, reps: "10-12 reps", category: "Legs", difficulty: "Normal" },
          { id: "ul-9", name: "Standing Calf Raises", sets: 4, reps: "15 reps", category: "Legs", difficulty: "Easy" },
          { id: "ul-10", name: "Cable Woodchoppers (Core)", sets: 3, reps: "12 reps", category: "Core", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Rabu",
        splitTitle: "Rest Day & Mobility",
        focusArea: "Pemulihan & Peregangan Sendi",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "ul-11", name: "Jalan Santai 8.000 Langkah", sets: 1, reps: "Sepanjang hari", category: "Cardio", difficulty: "Easy" },
          { id: "ul-12", name: "Mobility & Hip Opener Stretching", sets: 1, reps: "15 menit", category: "Recovery", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Kamis",
        splitTitle: "Upper Body Hypertrophy",
        focusArea: "Incline Chest, Lats, Bahu Samping & Arms",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "ul-13", name: "Incline Dumbbell Press", sets: 4, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "ul-14", name: "Lat Pulldown (Close Grip)", sets: 4, reps: "10-12 reps", category: "Pull", difficulty: "Normal" },
          { id: "ul-15", name: "Lateral Raises (Dumbbell / Cable)", sets: 4, reps: "15 reps", category: "Push", difficulty: "Normal" },
          { id: "ul-16", name: "Cable Flyes & Face Pulls", sets: 3, reps: "15 reps", category: "Push", difficulty: "Normal" },
          { id: "ul-17", name: "Hammer Curls & Triceps Pushdown", sets: 3, reps: "12-15 reps", category: "Pull", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Jumat",
        splitTitle: "Lower Body & Core Hypertrophy",
        focusArea: "Hamstring, Quads, Betis & Abdominals",
        category: "Legs",
        isRestDay: false,
        exercises: [
          { id: "ul-18", name: "Front Squats / Hack Squats", sets: 3, reps: "10-12 reps", category: "Legs", difficulty: "Hard" },
          { id: "ul-19", name: "Lying Hamstring Leg Curl", sets: 4, reps: "12-15 reps", category: "Legs", difficulty: "Normal" },
          { id: "ul-20", name: "Dumbbell Walking Lunges", sets: 3, reps: "12 langkah/kaki", category: "Legs", difficulty: "Normal" },
          { id: "ul-21", name: "Hanging Knee Raises & Plank", sets: 4, reps: "15 reps", category: "Core", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Sabtu",
        splitTitle: "Rest & Active Recovery",
        focusArea: "Nutrisi & Regenerasi",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "ul-22", name: "Penuhi Kebutuhan Protein & Tidur Cukup", sets: 1, reps: "Optimal", category: "Recovery", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Minggu",
        splitTitle: "Rest Day",
        focusArea: "Persiapan Minggu Berikutnya",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "ul-23", name: "Evaluasi Beban & Rencana Minggu Depan", sets: 1, reps: "Review", category: "Recovery", difficulty: "Easy" },
        ],
      },
    ],
  },
  bro_split: {
    name: "Classic Bro Split (5 Hari)",
    desc: "1 Bagian otot per hari dengan volume latihan terfokus untuk setiap bagian tubuh.",
    days: [
      {
        dayName: "Senin",
        splitTitle: "Chest Day (Dada)",
        focusArea: "Dada Atas, Tengah & Bawah",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "bs-1", name: "Flat Barbell Bench Press", sets: 4, reps: "8-10 reps", category: "Push", difficulty: "Hard" },
          { id: "bs-2", name: "Incline Dumbbell Press", sets: 4, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "bs-3", name: "Decline Bench Press / Dips", sets: 3, reps: "10-12 reps", category: "Push", difficulty: "Normal" },
          { id: "bs-4", name: "Cable Crossover Flyes", sets: 4, reps: "15 reps", category: "Push", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Selasa",
        splitTitle: "Back Day (Punggung)",
        focusArea: "Lebar Sayap, Ketebalan & Lower Back",
        category: "Pull",
        isRestDay: false,
        exercises: [
          { id: "bs-5", name: "Deadlift", sets: 4, reps: "5-6 reps", category: "Pull", difficulty: "Hard" },
          { id: "bs-6", name: "Lat Pulldown", sets: 4, reps: "10-12 reps", category: "Pull", difficulty: "Normal" },
          { id: "bs-7", name: "Barbell T-Bar Row", sets: 3, reps: "10-12 reps", category: "Pull", difficulty: "Hard" },
          { id: "bs-8", name: "Seated Cable Row", sets: 3, reps: "12 reps", category: "Pull", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Rabu",
        splitTitle: "Shoulder Day (Bahu)",
        focusArea: "Bahu Depan, Samping & Belakang",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "bs-9", name: "Seated Overhead Dumbbell Press", sets: 4, reps: "8-10 reps", category: "Push", difficulty: "Hard" },
          { id: "bs-10", name: "Dumbbell Lateral Raises", sets: 5, reps: "12-15 reps", category: "Push", difficulty: "Normal" },
          { id: "bs-11", name: "Rear Delt Reverse Flyes", sets: 4, reps: "15 reps", category: "Push", difficulty: "Normal" },
          { id: "bs-12", name: "Barbell Shrugs (Traps)", sets: 4, reps: "15 reps", category: "Push", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Kamis",
        splitTitle: "Leg Day (Kaki)",
        focusArea: "Quads, Hamstrings & Betis",
        category: "Legs",
        isRestDay: false,
        exercises: [
          { id: "bs-13", name: "Barbell Squats", sets: 4, reps: "8-10 reps", category: "Legs", difficulty: "Hard" },
          { id: "bs-14", name: "Leg Press", sets: 4, reps: "12 reps", category: "Legs", difficulty: "Normal" },
          { id: "bs-15", name: "Lying Leg Curls", sets: 4, reps: "12-15 reps", category: "Legs", difficulty: "Normal" },
          { id: "bs-16", name: "Standing Calf Raises", sets: 4, reps: "15-20 reps", category: "Legs", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Jumat",
        splitTitle: "Arms Day (Biceps & Triceps)",
        focusArea: "Lengan Penuh & Definisi",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "bs-17", name: "EZ-Bar Biceps Curl", sets: 4, reps: "10-12 reps", category: "Pull", difficulty: "Normal" },
          { id: "bs-18", name: "Close Grip Bench Press", sets: 4, reps: "8-10 reps", category: "Push", difficulty: "Hard" },
          { id: "bs-19", name: "Hammer Curls", sets: 3, reps: "12 reps", category: "Pull", difficulty: "Normal" },
          { id: "bs-20", name: "Triceps Rope Pushdown", sets: 4, reps: "12-15 reps", category: "Push", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Sabtu",
        splitTitle: "Core & Light Cardio",
        focusArea: "Perut, Daya Tahan & Fat Burn",
        category: "Cardio",
        isRestDay: false,
        exercises: [
          { id: "bs-21", name: "Hanging Leg Raises & Plank", sets: 4, reps: "15 reps", category: "Core", difficulty: "Normal" },
          { id: "bs-22", name: "Treadmill Jogging / Incline Walk 25m", sets: 1, reps: "25 menit", category: "Cardio", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Minggu",
        splitTitle: "Rest Day",
        focusArea: "Pemulihan Total",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "bs-23", name: "Protein 150g & Istirahat Total", sets: 1, reps: "Recovery", category: "Recovery", difficulty: "Easy" },
        ],
      },
    ],
  },
  solo_awakening: {
    name: "Solo Leveling Hunter Daily Quest",
    desc: "Protokol latihan harian sistem hunter Sung Jin-Woo: 100 Push-ups, 100 Sit-ups, 100 Squats, dan Lari.",
    days: [
      {
        dayName: "Senin",
        splitTitle: "Daily Quest: Quest Harian Menjadi Kuat",
        focusArea: "Full Body Awakening & Stamina",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "sl-1", name: "Push-up 100x (Bisa dibagi beberapa set)", sets: 5, reps: "20 reps", category: "Push", difficulty: "Hard" },
          { id: "sl-2", name: "Sit-up 100x (Core Conditioning)", sets: 5, reps: "20 reps", category: "Core", difficulty: "Hard" },
          { id: "sl-3", name: "Squats 100x (Leg Stamina)", sets: 5, reps: "20 reps", category: "Legs", difficulty: "Hard" },
          { id: "sl-4", name: "Lari / Jogging 5-10 Km", sets: 1, reps: "5-10 km", category: "Cardio", difficulty: "Hard" },
        ],
      },
      {
        dayName: "Selasa",
        splitTitle: "Upper Body Strength Hunter",
        focusArea: "Dada, Punggung & Bahu Beban",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "sl-5", name: "Barbell Bench Press (Heavy)", sets: 4, reps: "8 reps", category: "Push", difficulty: "Hard" },
          { id: "sl-6", name: "Weighted Pull-ups / Lat Pulldown", sets: 4, reps: "8 reps", category: "Pull", difficulty: "Hard" },
          { id: "sl-7", name: "Overhead Barbell Press", sets: 3, reps: "8-10 reps", category: "Push", difficulty: "Hard" },
          { id: "sl-8", name: "Dips 4 Set", sets: 4, reps: "12 reps", category: "Push", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Rabu",
        splitTitle: "Lower Body & Battle Agility",
        focusArea: "Kekuatan Kaki & Daya Ledak",
        category: "Legs",
        isRestDay: false,
        exercises: [
          { id: "sl-9", name: "Barbell Back Squat", sets: 5, reps: "5 reps", category: "Legs", difficulty: "Hard" },
          { id: "sl-10", name: "Deadlift Power Set", sets: 3, reps: "5 reps", category: "Pull", difficulty: "Hard" },
          { id: "sl-11", name: "Box Jumps / Jump Squats", sets: 4, reps: "10 reps", category: "Legs", difficulty: "Normal" },
          { id: "sl-12", name: "Plank 4 Menit Total", sets: 4, reps: "60 detik", category: "Core", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Kamis",
        splitTitle: "Active Recovery & Mana Recharge",
        focusArea: "Stretching, Mobilitas & Hidrasi",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "sl-13", name: "Peregangan Penuh Otot (Stretching)", sets: 1, reps: "20 menit", category: "Recovery", difficulty: "Easy" },
          { id: "sl-14", name: "Minum 3 Liter Air & Penuhi Nutrisi", sets: 1, reps: "3 liter", category: "Recovery", difficulty: "Easy" },
        ],
      },
      {
        dayName: "Jumat",
        splitTitle: "Daily Quest: Quest Harian Menjadi Kuat",
        focusArea: "Full Body Awakening & Stamina",
        category: "Push",
        isRestDay: false,
        exercises: [
          { id: "sl-15", name: "Push-up 100x", sets: 5, reps: "20 reps", category: "Push", difficulty: "Hard" },
          { id: "sl-16", name: "Sit-up 100x", sets: 5, reps: "20 reps", category: "Core", difficulty: "Hard" },
          { id: "sl-17", name: "Squats 100x", sets: 5, reps: "20 reps", category: "Legs", difficulty: "Hard" },
          { id: "sl-18", name: "Lari 5 Km", sets: 1, reps: "5 km", category: "Cardio", difficulty: "Hard" },
        ],
      },
      {
        dayName: "Sabtu",
        splitTitle: "Calisthenics & Power Conditioning",
        focusArea: "Pull-ups, Dips & Core",
        category: "Pull",
        isRestDay: false,
        exercises: [
          { id: "sl-19", name: "Wide Grip Pull-ups 50x Total", sets: 5, reps: "10 reps", category: "Pull", difficulty: "Hard" },
          { id: "sl-20", name: "Bar Dips 50x Total", sets: 5, reps: "10 reps", category: "Push", difficulty: "Hard" },
          { id: "sl-21", name: "Hanging Leg Raises 4x15", sets: 4, reps: "15 reps", category: "Core", difficulty: "Normal" },
        ],
      },
      {
        dayName: "Minggu",
        splitTitle: "Rest & System Recovery",
        focusArea: "Pemulihan Status & EXP Review",
        category: "Recovery",
        isRestDay: true,
        exercises: [
          { id: "sl-22", name: "Tidur 8 Jam Penuh & Nutrisi Tinggi Protein", sets: 1, reps: "Recovery", category: "Recovery", difficulty: "Easy" },
        ],
      },
    ],
  },
};

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function WorkoutSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createQuestMutation = useCreateQuest();
  const { showToast } = useNotificationStore();

  // Determine current day of week (0=Minggu, 1=Senin, ...)
  const todayDayName = DAY_NAMES[new Date().getDay()];

  // Active template state
  const [selectedTemplate, setSelectedTemplate] = useState<SplitTemplate>("ppl");
  const [schedules, setSchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES.ppl.days);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // New exercise form states
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState("10-12 reps");
  const [newExCategory, setNewExCategory] = useState<DaySchedule["category"]>("Push");
  const [newExDifficulty, setNewExDifficulty] = useState<"Easy" | "Normal" | "Hard">("Normal");
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  // Load custom schedule from localStorage if available
  useEffect(() => {
    if (!user) return;
    const savedTemplate = localStorage.getItem(`sl-schedule-template-${user.id}`);
    const savedData = localStorage.getItem(`sl-schedule-data-${user.id}`);

    if (savedTemplate && DEFAULT_SCHEDULES[savedTemplate as SplitTemplate]) {
      setSelectedTemplate(savedTemplate as SplitTemplate);
    }
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length === 7) {
          setSchedules(parsed);
        }
      } catch (e) {}
    }

    // Default select today's day
    const idx = DAY_NAMES.indexOf(todayDayName);
    // Find index in schedules array (starts Monday/Senin usually)
    const scheduleIdx = schedules.findIndex((s) => s.dayName === todayDayName);
    if (scheduleIdx !== -1) {
      setActiveDayIndex(scheduleIdx);
    }
  }, [user]);

  const handleSelectTemplate = (templateKey: SplitTemplate) => {
    setSelectedTemplate(templateKey);
    const newDays = DEFAULT_SCHEDULES[templateKey].days;
    setSchedules(newDays);

    if (user) {
      localStorage.setItem(`sl-schedule-template-${user.id}`, templateKey);
      localStorage.setItem(`sl-schedule-data-${user.id}`, JSON.stringify(newDays));
    }

    showToast({
      type: "info",
      title: "Split Latihan Diperbarui",
      message: `Program diganti ke "${DEFAULT_SCHEDULES[templateKey].name}".`,
    });
  };

  const currentDay = schedules[activeDayIndex] || schedules[0];
  const isSelectedDayToday = currentDay.dayName === todayDayName;

  // Add custom exercise to current day
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newExercise = {
      id: `custom-${Date.now()}`,
      name: newExName.trim(),
      sets: Number(newExSets) || 3,
      reps: newExReps.trim() || "10-12 reps",
      category: newExCategory,
      difficulty: newExDifficulty,
    };

    const updated = schedules.map((d, i) => {
      if (i === activeDayIndex) {
        return {
          ...d,
          isRestDay: false,
          exercises: [...d.exercises, newExercise],
        };
      }
      return d;
    });

    setSchedules(updated);
    if (user) {
      localStorage.setItem(`sl-schedule-data-${user.id}`, JSON.stringify(updated));
    }

    setNewExName("");
    setIsAddingExercise(false);

    showToast({
      type: "info",
      title: "Latihan Ditambahkan",
      message: `"${newExercise.name}" ditambahkan ke jadwal hari ${currentDay.dayName}.`,
    });
  };

  // Delete exercise from current day
  const handleDeleteExercise = (exId: string) => {
    const updated = schedules.map((d, i) => {
      if (i === activeDayIndex) {
        return {
          ...d,
          exercises: d.exercises.filter((ex) => ex.id !== exId),
        };
      }
      return d;
    });

    setSchedules(updated);
    if (user) {
      localStorage.setItem(`sl-schedule-data-${user.id}`, JSON.stringify(updated));
    }

    showToast({
      type: "info",
      title: "Latihan Dihapus",
      message: "Latihan dihapus dari jadwal.",
    });
  };

  // Reset to template default
  const handleResetToDefault = () => {
    if (window.confirm("Kembalikan jadwal ke setelan awal template?")) {
      const def = DEFAULT_SCHEDULES[selectedTemplate].days;
      setSchedules(def);
      if (user) {
        localStorage.setItem(`sl-schedule-data-${user.id}`, JSON.stringify(def));
      }
      showToast({
        type: "info",
        title: "Jadwal Direset",
        message: "Jadwal telah dikembalikan ke template awal.",
      });
    }
  };

  // Convert current day's exercises into Active Daily Quests
  const handleApplyToDailyQuests = () => {
    if (currentDay.exercises.length === 0) {
      showToast({
        type: "info",
        title: "Tidak Ada Latihan",
        message: "Tambahkan latihan ke hari ini terlebih dahulu.",
      });
      return;
    }

    let count = 0;
    currentDay.exercises.forEach((ex) => {
      createQuestMutation.mutate({
        title: `${ex.name} (${ex.sets} Set x ${ex.reps})`,
        difficulty: ex.difficulty,
        category: ex.category,
      });
      count++;
    });

    showToast({
      type: "quest",
      title: "Jadwal Dimasukkan ke Daily Quest!",
      message: `${count} latihan hari ${currentDay.dayName} berhasil dijadikan quest aktif hari ini!`,
      exp: count * 35,
    });

    navigate("/daily-quest");
  };

  return (
    <div className="schedule-page-container">
      {/* Header Banner */}
      <section className="schedule-hero-panel">
        <div className="schedule-hero-info">
          <div className="schedule-badge-tag">
            <Dumbbell size={15} />
            <span>GYM WORKOUT SPLIT</span>
          </div>
          <h1 className="schedule-hero-title">Jadwal Latihan & Program Gym</h1>
          <p className="schedule-hero-desc">
            Atur rutinitas angkat beban mingguan, target kelompok otot, dan masukkan langsung ke Daily Quest harianmu.
          </p>
        </div>

        {/* Quick actions in hero */}
        <div className="schedule-hero-actions">
          <button
            type="button"
            className="secondary-btn-glass"
            onClick={handleResetToDefault}
            title="Reset ke setelan template"
          >
            <RotateCcw size={15} />
            <span>Reset Template</span>
          </button>
        </div>
      </section>

      {/* Split Template Selector Pills */}
      <section className="schedule-template-selector-panel">
        <span className="template-selector-label">Pilih Pola Split:</span>
        <div className="template-pills-row">
          {(Object.keys(DEFAULT_SCHEDULES) as SplitTemplate[]).map((key) => {
            const tmpl = DEFAULT_SCHEDULES[key];
            const isActive = selectedTemplate === key;
            return (
              <button
                key={key}
                type="button"
                className={`template-pill-btn ${isActive ? "active" : ""}`}
                onClick={() => handleSelectTemplate(key)}
              >
                <Layers size={15} />
                <span>{tmpl.name}</span>
              </button>
            );
          })}
        </div>
        <p className="template-active-desc">{DEFAULT_SCHEDULES[selectedTemplate].desc}</p>
      </section>

      {/* 7 Days Navigation Bar */}
      <div className="schedule-days-bar">
        {schedules.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const isToday = day.dayName === todayDayName;

          return (
            <button
              key={day.dayName}
              type="button"
              className={`schedule-day-tab ${isActive ? "active" : ""} ${isToday ? "is-today" : ""}`}
              onClick={() => setActiveDayIndex(idx)}
            >
              <div className="day-tab-header">
                <span className="day-tab-name">{day.dayName}</span>
                {isToday && <span className="day-today-indicator">HARI INI</span>}
              </div>
              <span className="day-tab-split">{day.isRestDay ? "Rest Day" : day.category}</span>
              <span className="day-tab-count">{day.exercises.length} Latihan</span>
            </button>
          );
        })}
      </div>

      {/* Active Day Detail Card */}
      <section className="panel schedule-detail-panel">
        <div className="schedule-detail-header">
          <div className="schedule-detail-titles">
            <div className="schedule-day-badge-row">
              <span className="day-label-pill">{currentDay.dayName}</span>
              {isSelectedDayToday && <span className="today-glow-badge">Target Hari Ini</span>}
              <span className={`category-tag cat-${currentDay.category.toLowerCase()}`}>
                {currentDay.category}
              </span>
            </div>
            <h2 className="schedule-day-headline">{currentDay.splitTitle}</h2>
            <p className="schedule-day-focus">
              <strong>Fokus Otot:</strong> {currentDay.focusArea}
            </p>
          </div>

          {/* Action to transfer into Daily Quest */}
          <div className="schedule-detail-cta">
            <button
              type="button"
              className="primary-btn-glow apply-quest-btn"
              onClick={handleApplyToDailyQuests}
            >
              <Zap size={16} />
              <span>Jadikan Quest Hari Ini</span>
            </button>
          </div>
        </div>

        {/* Exercises List for the selected day */}
        <div className="schedule-exercises-container">
          <div className="schedule-exercises-header">
            <PanelTitle icon={Dumbbell} title={`Daftar Latihan (${currentDay.exercises.length})`} />
            <button
              type="button"
              className="secondary-btn-glass small-btn"
              onClick={() => setIsAddingExercise(!isAddingExercise)}
            >
              <Plus size={14} />
              <span>{isAddingExercise ? "Tutup Form" : "Tambah Latihan"}</span>
            </button>
          </div>

          {/* Form to add custom exercise */}
          {isAddingExercise && (
            <form onSubmit={handleAddExercise} className="add-exercise-form">
              <div className="form-grid-exercise">
                <div className="form-field full-span">
                  <label htmlFor="ex-name">Nama Latihan / Gerakan</label>
                  <input
                    id="ex-name"
                    type="text"
                    placeholder="Contoh: Incline Dumbbell Curl / Cable Row"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="ex-sets">Jumlah Set</label>
                  <input
                    id="ex-sets"
                    type="number"
                    min="1"
                    max="10"
                    value={newExSets}
                    onChange={(e) => setNewExSets(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="ex-reps">Target Repetisi / Durasi</label>
                  <input
                    id="ex-reps"
                    type="text"
                    placeholder="Contoh: 10-12 reps / 60 detik"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="ex-category">Kategori Otot</label>
                  <select
                    id="ex-category"
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value as any)}
                  >
                    <option value="Push">Push (Dada, Bahu, Triceps)</option>
                    <option value="Pull">Pull (Punggung, Biceps)</option>
                    <option value="Legs">Legs (Paha, Betis, Glutes)</option>
                    <option value="Core">Core & Abs</option>
                    <option value="Cardio">Cardio & Stamina</option>
                    <option value="Recovery">Recovery / Nutrisi</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="ex-diff">Tingkat Kesulitan</label>
                  <select
                    id="ex-diff"
                    value={newExDifficulty}
                    onChange={(e) => setNewExDifficulty(e.target.value as any)}
                  >
                    <option value="Easy">Easy (Mudah)</option>
                    <option value="Normal">Normal (Sedang)</option>
                    <option value="Hard">Hard (Berat)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions-exercise">
                <button type="submit" className="primary-btn-glow">
                  <Plus size={15} />
                  <span>Simpan ke Jadwal {currentDay.dayName}</span>
                </button>
                <button
                  type="button"
                  className="secondary-btn-glass"
                  onClick={() => setIsAddingExercise(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* List of exercises */}
          {currentDay.exercises.length > 0 ? (
            <div className="exercise-cards-list">
              {currentDay.exercises.map((ex, index) => (
                <div key={ex.id} className="exercise-card-item">
                  <div className="exercise-index-bubble">{index + 1}</div>
                  <div className="exercise-card-body">
                    <div className="exercise-title-row">
                      <strong className="exercise-name">{ex.name}</strong>
                      <span className={`diff-pill diff-${ex.difficulty.toLowerCase()}`}>
                        {ex.difficulty}
                      </span>
                    </div>
                    <div className="exercise-meta-row">
                      <span className="exercise-stat-pill">
                        <strong>{ex.sets}</strong> Set
                      </span>
                      <span className="exercise-stat-pill">
                        <strong>{ex.reps}</strong>
                      </span>
                      <span className="exercise-category-sub">{ex.category}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="exercise-delete-btn"
                    onClick={() => handleDeleteExercise(ex.id)}
                    title="Hapus latihan dari jadwal"
                    aria-label={`Hapus ${ex.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-schedule-card">
              <Dumbbell size={32} className="empty-icon" />
              <p className="empty-title">Hari ini belum ada latihan terjadwal</p>
              <p className="empty-desc">
                Klik tombol "Tambah Latihan" di atas untuk menyusun menu latihan hari {currentDay.dayName}.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
