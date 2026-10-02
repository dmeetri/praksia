"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Недействительная ссылка</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Ссылка для сброса пароля недействительна или устарела.
        </p>
        <Link href="/forgot-password" className="btn-primary px-6 py-2.5">
          Запросить новую ссылку
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Пароль изменён</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Пароль успешно обновлён. Войдите с новым паролем.
        </p>
        <Link href="/login" className="btn-primary px-6 py-2.5">
          Войти
        </Link>
      </div>
    );
  }

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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Ошибка. Попробуйте запросить ссылку снова.");
      }
    } catch {
      setError("Ошибка сервера. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Новый пароль</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Введите новый пароль для вашей учётной записи.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee2e2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Новый пароль</label>
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
          <input
            type="password"
            className={`input ${confirm && password !== confirm ? "border-red-400" : ""}`}
            placeholder="Введите пароль ещё раз"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {confirm && password !== confirm && (
            <p className="text-xs mt-1 text-red-500">Пароли не совпадают</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || (confirm !== "" && password !== confirm)}
          className="btn-primary w-full justify-center py-2.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить пароль"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-center py-4" style={{ color: "var(--text-muted)" }}>Загрузка...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
