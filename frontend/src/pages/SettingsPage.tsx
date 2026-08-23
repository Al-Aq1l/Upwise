import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Save,
  Trash2,
  Download,
  BookOpenText,
  BarChart3,
  Trophy,
  Volume2,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import {
  useUpdateProfile,
  useUpdateNotifications,
  useExportData,
  useResetData,
} from "@/hooks/useSettings";
import { sound } from "@/lib/audio";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { requestBrowserPermission, showToast } = useNotificationStore();

  const updateProfileMutation = useUpdateProfile();
  const updateNotificationsMutation = useUpdateNotifications();
  const exportDataMutation = useExportData();
  const resetDataMutation = useResetData();

  const [name, setName] = useState(user?.name || "");
  const [title, setTitle] = useState(user?.title || "");
  const [sfxEnabled, setSfxEnabled] = useState(sound.enabled);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const [notifications, setNotifications] = useState({
    checkIn: profile?.notifications?.checkIn ?? true,
    checkOut: profile?.notifications?.checkOut ?? true,
    quest: profile?.notifications?.quest ?? false,
  });

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
      showToast({
        type: "achievement",
        title: "Aplikasi Terinstall!",
        message: "Upwise kini tersedia di layar utama perangkat Anda.",
      });
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      { name, title },
      {
        onSuccess: () => {
          showToast({
            type: "info",
            title: "Profil Diperbarui",
            message: "Data hunter berhasil disimpan.",
          });
        },
      }
    );
  };

  const handleNotificationChange = async (key: "checkIn" | "checkOut" | "quest") => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateNotificationsMutation.mutate(updated);

    if (updated[key]) {
      const granted = await requestBrowserPermission();
      if (granted) {
        showToast({
          type: "info",
          title: "Notifikasi Diaktifkan",
          message: "Izin notifikasi browser berhasil diberikan.",
        });
      }
    }
  };

  const handleToggleSfx = () => {
    const next = sound.toggleSound();
    setSfxEnabled(next);
    if (next) {
      sound.playQuestComplete();
    }
    showToast({
      type: "info",
      title: next ? "SFX Diaktifkan" : "SFX Dinonaktifkan",
      message: next ? "Efek audio game & system aktif." : "Mode audio hening diaktifkan.",
    });
  };

  const handleExport = () => {
    exportDataMutation.mutate(undefined, {
      onSuccess: (data) => {
        const dataStr =
          "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute(
          "download",
          `pgos_backup_${new Date().toISOString().slice(0, 10)}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      },
    });
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin MERESET semua data? Semua data dungeon, quest, fokus, dan jurnal akan DIHAPUS PERMANEN."
      )
    ) {
      resetDataMutation.mutate();
    }
  };

  return (
    <div className="content-grid two-col settings-view-wrapper">
      <section className="panel form-panel">
        <PanelTitle icon={User} title="Profil Hunter" />
        <form onSubmit={handleProfileSave} className="form-container">
          <label>
            Nama Tampilan
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Hunter Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <button className="primary" type="submit" disabled={updateProfileMutation.isPending}>
            <Save size={18} />{" "}
            {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </section>

      <div className="settings-right-column">
        {/* PWA & Audio Preferences */}
        <section className="panel form-panel">
          <PanelTitle icon={Volume2} title="Audio & Aplikasi" />
          <div className="notification-options">
            <label className="toggle-row">
              <div className="toggle-label-with-desc">
                <span>Sound FX & Game Audio</span>
                <small className="muted">Efek suara quest, level up, dan chamber</small>
              </div>
              <input type="checkbox" checked={sfxEnabled} onChange={handleToggleSfx} />
            </label>

            {installPrompt && !isInstalled && (
              <div className="pwa-install-banner">
                <div className="pwa-info">
                  <Smartphone size={20} className="text-cyan" />
                  <div>
                    <strong>Install Upwise PWA</strong>
                    <small>Gunakan sebagai aplikasi standalone di HP atau Desktop</small>
                  </div>
                </div>
                <button type="button" className="primary-btn-glow" onClick={handleInstallPWA}>
                  Install App
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="panel form-panel notification-settings-panel">
          <PanelTitle icon={Bell} title="Pengingat & Notifikasi" />
          <div className="notification-options">
            <label className="toggle-row">
              <div className="toggle-label-with-desc">
                <span>Pengingat check-in pagi</span>
                <small className="muted">Pengingat harian untuk membuka dungeon gate</small>
              </div>
              <input
                type="checkbox"
                checked={notifications.checkIn}
                onChange={() => handleNotificationChange("checkIn")}
              />
            </label>
            <label className="toggle-row">
              <div className="toggle-label-with-desc">
                <span>Pengingat check-out sore/malam</span>
                <small className="muted">Pengingat evaluasi harian dan klaim EXP</small>
              </div>
              <input
                type="checkbox"
                checked={notifications.checkOut}
                onChange={() => handleNotificationChange("checkOut")}
              />
            </label>
            <label className="toggle-row">
              <div className="toggle-label-with-desc">
                <span>Pengingat quest harian</span>
                <small className="muted">Notifikasi sisa quest yang belum selesai</small>
              </div>
              <input
                type="checkbox"
                checked={notifications.quest}
                onChange={() => handleNotificationChange("quest")}
              />
            </label>
          </div>
        </section>

        <section className="panel form-panel database-management-panel">
          <PanelTitle icon={Trash2} title="Data & System Management" />
          <div className="action-column">
            <button
              className="secondary"
              onClick={handleExport}
              disabled={exportDataMutation.isPending}
            >
              <Download size={18} />{" "}
              {exportDataMutation.isPending ? "Mengekspor..." : "Ekspor Semua Data (JSON)"}
            </button>
            <button
              className="danger-btn"
              onClick={handleReset}
              disabled={resetDataMutation.isPending}
            >
              <Trash2 size={18} />{" "}
              {resetDataMutation.isPending ? "Mereset..." : "Reset Akun & Data Harian"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
