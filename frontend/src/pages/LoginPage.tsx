import { useState } from "react";
import { Shield, ChevronRight } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

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
          <p>Masuk, pilih quest harian, jalankan sesi fokus, lalu tutup hari dengan refleksi dan EXP.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <span className="eyebrow">Single-user access</span>
          <h2>Hunter Login</h2>
          <label>
            Email atau username
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
          {loginMutation.isError && (
            <p className="form-error">
              {(loginMutation.error as any)?.response?.data?.message || "Login gagal. Coba lagi."}
            </p>
          )}
          <button
            className="primary"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Entering System..." : "Enter System"}
            <ChevronRight size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}
