import { useState, useEffect } from "react";
import {
  Sparkles,
  Dumbbell,
  Home,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  X,
  Zap,
} from "lucide-react";
import { useGenerateStarterQuests } from "@/hooks/useQuests";
import { useNotificationStore } from "@/lib/notifications";
import { useAuthStore } from "@/lib/auth";

type WorkoutType = "home" | "gym";

export default function OnboardingQuestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState<WorkoutType>("home");
  const [growthFocus, setGrowthFocus] = useState<string[]>(["study", "reading"]);

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

  const handleToggleGrowth = (item: string) => {
    setGrowthFocus((prev) =>
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
      { workout_type: workoutType, growth_focus: growthFocus },
      {
        onSuccess: (data: any) => {
          showToast({
            type: "info",
            title: "Sistem Quest Diaktifkan!",
            message: `${data.created_count || "Paket"} quest harian berhasil ditambahkan ke dashboard.`,
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
            <span>INITIALIZE SYSTEM · AWAKENING</span>
          </div>
          <h2>Pilih Jalur Pelatihan Awalmu</h2>
          <p>
            Selamat datang di <strong>Upwise</strong>. Tentukan fokus latihan dan pengembangan diri
            agar sistem otomatis menyiapkan <strong>Daily Quests</strong> pertamamu hari ini.
          </p>
        </div>

        {/* Section 1: Physical Workout Selection */}
        <div className="onboarding-section">
          <span className="onboarding-step-label">1. Pilih Lokasi & Gaya Latihan Fisik</span>
          <div className="workout-cards-grid">
            <button
              type="button"
              className={`workout-card ${workoutType === "home" ? "active" : ""}`}
              onClick={() => setWorkoutType("home")}
            >
              <div className="workout-card-icon home-icon">
                <Home size={24} />
              </div>
              <div className="workout-card-text">
                <div className="workout-card-title">
                  <strong>Home Workout</strong>
                  {workoutType === "home" && <CheckCircle2 size={16} className="text-cyan" />}
                </div>
                <p>Push-up, Sit-up, Plank, Squat. Fleksibel & mandiri tanpa alat berat di rumah.</p>
                <div className="card-perks">
                  <span>+3 Quests Fisik</span>
                  <span>Calisthenics</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`workout-card ${workoutType === "gym" ? "active" : ""}`}
              onClick={() => setWorkoutType("gym")}
            >
              <div className="workout-card-icon gym-icon">
                <Dumbbell size={24} />
              </div>
              <div className="workout-card-text">
                <div className="workout-card-title">
                  <strong>Gym & Iron Path</strong>
                  {workoutType === "gym" && <CheckCircle2 size={16} className="text-amber" />}
                </div>
                <p>Angkat beban terarah, asupan nutrisi protein harian, dan target kardio.</p>
                <div className="card-perks">
                  <span>+3 Quests Gym</span>
                  <span>Strength & Muscle</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Personal Growth Focus */}
        <div className="onboarding-section">
          <span className="onboarding-step-label">2. Fokus Pertumbuhan Tambahan (Bisa Pilih Banyak)</span>
          <div className="growth-options-list">
            <label
              className={`growth-option-row ${growthFocus.includes("study") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={growthFocus.includes("study")}
                onChange={() => handleToggleGrowth("study")}
              />
              <div className="growth-icon study-bg">
                <GraduationCap size={18} />
              </div>
              <div className="growth-text">
                <strong>Studi / Skripsi / Pekerjaan Mendalam</strong>
                <small>Quest Deep Focus 45-90 menit tanpa distraksi ponsel</small>
              </div>
            </label>

            <label
              className={`growth-option-row ${growthFocus.includes("reading") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={growthFocus.includes("reading")}
                onChange={() => handleToggleGrowth("reading")}
              />
              <div className="growth-icon reading-bg">
                <BookOpen size={18} />
              </div>
              <div className="growth-text">
                <strong>Membaca Buku / Jurnal Ilmiah</strong>
                <small>Target membaca 15 halaman literasi berkualitas setiap hari</small>
              </div>
            </label>

            <label
              className={`growth-option-row ${growthFocus.includes("mindfulness") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={growthFocus.includes("mindfulness")}
                onChange={() => handleToggleGrowth("mindfulness")}
              />
              <div className="growth-icon mindful-bg">
                <HeartHandshake size={18} />
              </div>
              <div className="growth-text">
                <strong>Jurnal Refleksi & Disiplin Harian</strong>
                <small>Evaluasi pencapaian, rasa syukur, dan penutupan hari di jurnal</small>
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
              "Mengonfigurasi Quest..."
            ) : (
              <>
                <Zap size={16} />
                <span>Aktifkan Quest Sistem</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
