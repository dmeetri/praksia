import Link from "next/link";
import { Check, Crown, Sparkles, Cloud, Lock, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const FREE_FEATURES = [
  "До 10 документов в браузере",
  "Все базовые шаблоны",
  "Экспорт PDF и DOCX",
  "Отправка по email",
];

const PREMIUM_FEATURES = [
  "Неограниченные документы",
  "Облачное хранение",
  "ИИ-помощник для редактирования",
  "Приоритетная поддержка",
  "Ранний доступ к новым шаблонам",
];

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 badge badge-yellow px-3 py-1.5 text-sm mb-4">
            <Crown className="w-4 h-4" /> Premium план
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>
            Расширьте возможности
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Текущий план — Бесплатный. Обновитесь до Premium для неограниченного доступа.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className="card p-6">
            <div className="mb-4">
              <p className="text-sm font-semibold badge badge-gray mb-2">Бесплатный</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold" style={{ color: "var(--text)" }}>0 ₽</span>
                <span style={{ color: "var(--text-muted)" }}>/мес</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="btn-secondary w-full justify-center py-2.5" disabled>
              Текущий план
            </button>
          </div>

          {/* Premium */}
          <div className="card p-6 relative overflow-hidden" style={{ border: "2px solid var(--brand)" }}>
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
              Популярный
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold badge badge-blue mb-2 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Premium
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold" style={{ color: "var(--text)" }}>199 ₽</span>
                <span style={{ color: "var(--text-muted)" }}>/мес</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Всё из бесплатного, плюс:
              </li>
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="btn-primary w-full justify-center py-2.5 cursor-not-allowed opacity-70"
              disabled
            >
              <Lock className="w-4 h-4" />
              Скоро доступно
            </button>
          </div>
        </div>

        {/* Coming soon notice */}
        <div
          className="rounded-2xl p-8 text-center mb-10"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Оплата Premium временно недоступна
          </h2>
          <p className="max-w-md mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
            Мы готовим систему оплаты. Оставьте email — мы уведомим вас, когда Premium станет доступен со специальной скидкой для первых подписчиков.
          </p>
          <form
            action="/api/email/notify"
            method="POST"
            className="flex gap-2 max-w-sm mx-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="input flex-1"
            />
            <button type="submit" className="btn-primary px-4">
              Уведомить
            </button>
          </form>
        </div>

        {/* Feature breakdown */}
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--text)" }}>
          Что входит в Premium
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Cloud, title: "Облачное хранение", desc: "Ваши документы доступны с любого устройства. Синхронизация в реальном времени." },
            { icon: Sparkles, title: "ИИ-помощник", desc: "Умный ассистент поможет улучшить текст, исправить ошибки и предложит варианты." },
            { icon: Zap, title: "Приоритет", desc: "Первыми получаете новые шаблоны и функции. Поддержка в течение 24 часов." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>{title}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
