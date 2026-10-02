"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка регистрации");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
    } catch {
      setError("Ошибка сервера. Попробуйте позже.");
      setLoading(false);
    }
  }

  const passwordsMatch = confirm === "" || password === confirm;

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
          <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: "var(--text)" }}>Регистрация</h1>
          <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Войти</Link>
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee2e2", color: "#b91c1c" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Имя</label>
              <input
                type="text"
                className="input"
                placeholder="Иван Петров"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Пароль</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Минимум 8 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Повторите пароль</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`input pr-10 ${confirm && !passwordsMatch ? "border-red-400" : confirm && passwordsMatch ? "border-green-400" : ""}`}
                  placeholder="Введите пароль ещё раз"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && !passwordsMatch && (
                <p className="text-xs mt-1 text-red-500">Пароли не совпадают</p>
              )}
              {confirm && passwordsMatch && (
                <p className="text-xs mt-1 text-green-600">Пароли совпадают ✓</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || (confirm !== "" && !passwordsMatch)}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Создать аккаунт"}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            Регистрируясь, вы соглашаетесь с условиями использования сервиса
          </p>
        </div>
      </div>
    </div>
  );
}
