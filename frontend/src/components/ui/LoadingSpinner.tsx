import { Shield } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <div className="gate loading-pulse">
          <Shield size={48} className="spin-slow" />
        </div>
        <p className="loading-text animate-pulse">Memuat System...</p>
      </div>
    </div>
  );
}
