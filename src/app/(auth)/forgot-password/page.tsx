"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Ошибка. Попробуйте позже.");
      }
    } catch {
      setError("Ошибка сервера. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: "var(--text)" }}>Praksia</span>
        </Link>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Письмо отправлено</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Если аккаунт с адресом <strong>{email}</strong> существует, вы получите письмо со ссылкой для сброса пароля.
              </p>
              <Link href="/login" className="btn-primary px-6 py-2.5">
                Вернуться к входу
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Восстановление пароля</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Введите email вашего аккаунта. Мы отправим ссылку для сброса пароля.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Отправить ссылку"}
                </button>
              </form>

              <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
                <Link href="/login" className="text-blue-600 hover:underline">← Вернуться к входу</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
