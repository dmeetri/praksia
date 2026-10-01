import Link from "next/link";
import { FileText, Shield, Zap, Clock, ChevronRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="header">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--text)" }}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Praksia
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Войти</Link>
            <Link href="/register" className="btn-primary">Начать бесплатно</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 badge badge-blue mb-6 px-3 py-1.5 text-sm">
            <Star className="w-3.5 h-3.5" /> Более 100 шаблонов документов
          </div>
          <h1 className="text-5xl font-bold mb-6 text-balance leading-tight" style={{ color: "var(--text)" }}>
            Умные документы за{" "}
            <span style={{ color: "var(--brand)" }}>минуты</span>
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Заявления, приказы, рапорты и другие официальные документы. Заполни поля — получи готовый документ.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="btn-primary text-base px-6 py-3">
              Создать документ <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-6 py-3">
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--text)" }}>
            Почему Praksia?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Быстро",
                desc: "Заполните несколько полей и получите готовый документ. Никаких сложных редакторов.",
                color: "#fbbf24",
              },
              {
                icon: Shield,
                title: "Безопасно",
                desc: "Ваши данные хранятся в вашем браузере. Мы не получаем доступ к содержимому документов.",
                color: "#34d399",
              },
              {
                icon: Clock,
                title: "Экономит время",
                desc: "Что раньше занимало часы — теперь минуты. Сохраняйте шаблоны и повторно используйте.",
                color: "#60a5fa",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--text)" }}>{title}</h3>
                <p style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>Категории документов</h2>
          <p className="mb-10" style={{ color: "var(--text-muted)" }}>Кадровые, юридические, воинские, бухгалтерские и учебные документы</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["Кадровые", "Бухгалтерские", "Юридические", "Воинские", "Учебные"].map((cat) => (
              <div key={cat} className="card p-4 text-center">
                <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{cat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: "var(--brand)", color: "white" }}>
        <h2 className="text-3xl font-bold mb-4">Начните прямо сейчас — бесплатно</h2>
        <p className="mb-8 opacity-80 text-lg">До 10 документов бесплатно. Навсегда.</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Создать аккаунт <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm border-t" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <p>© 2024 Praksia · Умные документы · <Link href="/subscription" className="hover:underline">Подписка</Link></p>
      </footer>
    </div>
  );
}
