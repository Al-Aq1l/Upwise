import { useState, useEffect } from "react";
import {
  Sparkles,
  Dumbbell,
  Home,
  CheckCircle2,
  ChevronRight,
  X,
  Zap,
  Flame,
  Layers,
  HeartPulse,
  Utensils,
} from "lucide-react";
import { useGenerateStarterQuests } from "@/hooks/useQuests";
import { useNotificationStore } from "@/lib/notifications";
import { useAuthStore } from "@/lib/auth";

type SplitOption = "ppl" | "upper_lower" | "solo_awakening" | "home";

export default function OnboardingQuestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [splitType, setSplitType] = useState<SplitOption>("ppl");
  const [fitnessFocus, setFitnessFocus] = useState<string[]>(["nutrition", "cardio"]);

  const user = useAuthStore((s) => s.user);
  const generateMutation = useGenerateStarterQuests();
  const { showToast } = useNotificationStore();

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    const completed = localStorage.getItem(`sl-onboarding-completed-${user.id}`);
    const needsOnboarding = localStorage.getItem(`sl-needs-onboarding-${user.id}`) === "true";

    // Open if marked as needing onboarding or never completed
    if (needsOnboarding || !completed) {
      setIsOpen(true);
    }
  }, [user]);

  const handleToggleFocus = (item: string) => {
    setFitnessFocus((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`sl-onboarding-completed-${user.id}`, "true");
      localStorage.removeItem(`sl-needs-onboarding-${user.id}`);
    }
    setIsOpen(false);
  };

  const handleApply = () => {
    generateMutation.mutate(
      {
        workout_type: splitType,
        split_type: splitType,
        fitness_focus: fitnessFocus,
      },
      {
        onSuccess: (data: any) => {
          showToast({
            type: "info",
            title: "Program Gym Diaktifkan!",
            message: `${data.created_count || "Paket"} quest latihan gym berhasil disiapkan di dashboard.`,
          });
          handleClose();
        },
        onError: (err: any) => {
          showToast({
            type: "info",
            title: "Gagal Generate Quest",
            message: err?.response?.data?.message || "Terjadi kesalahan sistem.",
          });
          handleClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="onboarding-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="onboarding-header">
          <div className="onboarding-badge">
            <Sparkles size={14} className="text-cyan animate-pulse" />
            <span>INITIALIZE GYM SYSTEM · AWAKENING</span>
          </div>
          <h2>Pilih Pola Split & Program Gym</h2>
          <p>
            Selamat datang di <strong>Upwise Gym OS</strong>. Tentukan pola latihan dan target fisikmu
            agar sistem menyiapkan <strong>Daily Workout Quests</strong> pertamamu hari ini.
          </p>
        </div>

        {/* Section 1: Workout Split Selection */}
        <div className="onboarding-section">
          <span className="onboarding-step-label">1. Pilih Pola Split Latihan Utama</span>
          <div className="workout-cards-grid">
            <button
              type="button"
              className={`workout-card ${splitType === "ppl" ? "active" : ""}`}
              onClick={() => setSplitType("ppl")}
            >
              <div className="workout-card-icon gym-icon">
                <Dumbbell size={24} />
              </div>
              <div className="workout-card-text">
                <div className="workout-card-title">
                  <strong>Push - Pull - Legs (PPL)</strong>
                  {splitType === "ppl" && <CheckCircle2 size={16} className="text-cyan" />}
                </div>
                <p>Dada, bahu, punggung, kaki, dan lengan terbagi teratur untuk hipertrofi maksimal.</p>
                <div className="card-perks">
                  <span>Gym Compound</span>
                  <span>Hypertrophy & Strength</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`workout-card ${splitType === "upper_lower" ? "active" : ""}`}
              onClick={() => setSplitType("upper_lower")}
            >
              <div className="workout-card-icon home-icon">
                <Layers size={24} />
              </div>
              <div className="workout-card-text">
                <div className="workout-card-title">
                  <strong>Upper - Lower Split</strong>
                  {splitType === "upper_lower" && <CheckCircle2 size={16} className="text-cyan" />}
                </div>
                <p>4 hari per minggu dengan frekuensi stimulasi dan pemulihan otot seimbang.</p>
                <div className="card-perks">
                  <span>Upper / Lower</span>
                  <span>Fast Recovery</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`workout-card ${splitType === "solo_awakening" ? "active" : ""}`}
              onClick={() => setSplitType("solo_awakening")}
            >
              <div className="workout-card-icon gym-icon">
                <Flame size={24} />
              </div>
              <div className="workout-card-text">
                <div className="workout-card-title">
                  <strong>Solo Leveling Protocol</strong>
                  {splitType === "solo_awakening" && <CheckCircle2 size={16} className="text-cyan" />}
                </div>
                <p>Latihan harian Jin-Woo: 100 Push-ups, 100 Sit-ups, 100 Squats, dan Lari.</p>
                <div className="card-perks">
                  <span>Hunter Protocol</span>
                  <span>Extreme Stamina</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`workout-card ${splitType === "home" ? "active" : ""}`}
              onClick={() => setSplitType("home")}
            >
              <div className="workout-card-icon home-icon">
                <Home size={24} />
              </div>
              <div className="workout-card-text">
                <div className="workout-card-title">
                  <strong>Calisthenics & Home</strong>
                  {splitType === "home" && <CheckCircle2 size={16} className="text-cyan" />}
                </div>
                <p>Latihan beban tubuh fleksibel tanpa alat berat: push-up, squat, lunges & plank.</p>
                <div className="card-perks">
                  <span>Bodyweight</span>
                  <span>Anywhere</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Fitness & Nutrition Focus */}
        <div className="onboarding-section">
          <span className="onboarding-step-label">2. Target Nutrisi & Kondisioning Tambahan</span>
          <div className="growth-options-list">
            <label
              className={`growth-option-row ${fitnessFocus.includes("nutrition") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={fitnessFocus.includes("nutrition")}
                onChange={() => handleToggleFocus("nutrition")}
              />
              <div className="growth-icon study-bg">
                <Utensils size={18} />
              </div>
              <div className="growth-text">
                <strong>Target Protein Harian & Hidrasi 3 Liter</strong>
                <small>Quest asupan protein (120-150g) dan hidrasi untuk regenerasi otot</small>
              </div>
            </label>

            <label
              className={`growth-option-row ${fitnessFocus.includes("cardio") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={fitnessFocus.includes("cardio")}
                onChange={() => handleToggleFocus("cardio")}
              />
              <div className="growth-icon mindful-bg">
                <HeartPulse size={18} />
              </div>
              <div className="growth-text">
                <strong>Kardio & Fat Burn Stamina</strong>
                <small>Target 20 menit treadmill incline atau jogging untuk kebugaran jantung</small>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="onboarding-footer">
          <button
            type="button"
            className="secondary ghost-btn"
            onClick={handleClose}
            disabled={generateMutation.isPending}
          >
            Lewati untuk Sekarang
          </button>

          <button
            type="button"
            className="primary activate-btn"
            onClick={handleApply}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              "Mengonfigurasi Program..."
            ) : (
              <>
                <Zap size={16} />
                <span>Aktifkan Program Gym</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
