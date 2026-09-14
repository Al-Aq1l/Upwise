import { useState } from "react";
import { Shield, ChevronRight, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { useLogin, useRegister } from "@/hooks/useAuth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // Login fields
  const [email, setEmail] = useState("hunter@solo.local");
  const [password, setPassword] = useState("hunter123");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    loginMutation.mutate({ email, password });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!regName.trim()) {
      setLocalError("Nama lengkap wajib diisi.");
      return;
    }

    if (regPassword.length < 6) {
      setLocalError("Password minimal 6 karakter.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLocalError("Konfirmasi password tidak cocok.");
      return;
    }

    registerMutation.mutate({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
  };

  const activeMutation = mode === "login" ? loginMutation : registerMutation;
  const serverError =
    (activeMutation.error as any)?.response?.data?.message ||
    (activeMutation.error as any)?.response?.data?.errors?.email?.[0] ||
    "";

  return (
    <div className="login-shell dark">
      <section className="login-panel">
        <div className="login-visual">
          <div className="gate">
            <img
              src="/logo-transparent.png"
              alt="Upwise"
              width={64}
              height={64}
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1>Upwise</h1>
          <p>
            Tingkatkan disiplin, selesaikan quest harian, jalankan sesi fokus mendalam, dan raih
            kenaikan level serta evaluasi produktivitas terukur.
          </p>
        </div>

        <div className="login-form">
          {/* Mode Switch Tabs */}
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setLocalError("");
              }}
            >
              <LogIn size={15} />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => {
                setMode("register");
                setLocalError("");
              }}
            >
              <UserPlus size={15} />
              <span>Buat Akun</span>
            </button>
          </div>

          <span className="eyebrow">
            {mode === "login" ? "Akses Akun Terdaftar" : "Registrasi Hunter Baru"}
          </span>
          <h2>{mode === "login" ? "Hunter Login" : "Buat Akun Baru"}</h2>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} style={{ display: "grid", gap: "16px" }}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hunter@solo.local"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>

              {(serverError || localError) && (
                <p className="form-error">
                  <AlertCircle size={14} style={{ display: "inline", marginRight: "6px" }} />
                  {localError || serverError}
                </p>
              )}

              <button
                className="primary"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Memverifikasi..." : "Enter System"}
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="auth-toggle-link"
                onClick={() => {
                  setMode("register");
                  setLocalError("");
                }}
              >
                Belum punya akun? Buat akun sekarang →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: "grid", gap: "14px" }}>
              <label>
                Nama Lengkap / Hunter Name
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Misal: Sung Jin-Woo"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </label>

              <label>
                Konfirmasi Password
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                />
              </label>

              {(serverError || localError) && (
                <p className="form-error">
                  <AlertCircle size={14} style={{ display: "inline", marginRight: "6px" }} />
                  {localError || serverError}
                </p>
              )}

              <button
                className="primary"
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Mendaftarkan Akun..." : "Awaken Account (Daftar)"}
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="auth-toggle-link"
                onClick={() => {
                  setMode("login");
                  setLocalError("");
                }}
              >
                Sudah punya akun? Masuk di sini →
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
