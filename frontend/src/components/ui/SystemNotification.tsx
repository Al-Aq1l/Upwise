import React from "react";
import { Sparkles, Trophy, Timer, Swords, CheckCircle2, X } from "lucide-react";
import { useNotificationStore } from "@/lib/notifications";

export default function SystemNotification() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="system-toast-container">
      {toasts.map((toast) => {
        let Icon = Sparkles;
        let badgeColor = "cyan";

        if (toast.type === "quest") {
          Icon = CheckCircle2;
          badgeColor = "cyan";
        } else if (toast.type === "level" || toast.type === "achievement") {
          Icon = Trophy;
          badgeColor = "amber";
        } else if (toast.type === "focus") {
          Icon = Timer;
          badgeColor = "purple";
        } else if (toast.type === "dungeon") {
          Icon = Swords;
          badgeColor = "rose";
        }

        return (
          <div key={toast.id} className={`system-toast type-${toast.type} badge-${badgeColor}`}>
            <div className="system-toast-glow" />
            <div className="system-toast-content">
              <div className="system-toast-header">
                <div className="system-toast-tag">
                  <span className="system-tag-pulse" />
                  <span>SYSTEM NOTIFICATION</span>
                </div>
                <button
                  className="system-toast-close"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Tutup"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="system-toast-body">
                <div className="system-toast-icon">
                  <Icon size={20} />
                </div>
                <div className="system-toast-text">
                  <strong className="system-toast-title">{toast.title}</strong>
                  <p className="system-toast-message">{toast.message}</p>
                </div>
                {toast.exp && (
                  <div className="system-toast-exp">
                    <span>+{toast.exp} EXP</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
