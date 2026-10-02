export const dynamic = "force-dynamic";

import { FileText, Users, LayoutDashboard, MessageSquare, TrendingUp, Shield } from "lucide-react";
import db from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Администратор — Praksia" };

export default async function AdminDashboard() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    templateCount,
    activeTemplateCount,
    userCount,
    newUsersThisWeek,
    categoryCount,
    feedbackCount,
    unreadFeedbackCount,
    recentUsers,
    recentFeedback,
  ] = await Promise.all([
    db.template.count(),
    db.template.count({ where: { isActive: true } }),
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.category.count(),
    db.feedbackMessage.count(),
    db.feedbackMessage.count({ where: { read: false } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true, isAdmin: true, isBlocked: true },
    }),
    db.feedbackMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    {
      label: "Шаблонов",
      value: templateCount,
      sub: `${activeTemplateCount} активных`,
      icon: FileText,
      href: "/admin/templates",
      color: "#3b82f6",
    },
    {
      label: "Пользователей",
      value: userCount,
      sub: `+${newUsersThisWeek} за неделю`,
      icon: Users,
      href: "/admin/users",
      color: "#8b5cf6",
    },
    {
      label: "Категорий",
      value: categoryCount,
      sub: "разделов",
      icon: LayoutDashboard,
      href: "/admin/templates",
      color: "#10b981",
    },
    {
      label: "Сообщений",
      value: feedbackCount,
      sub: unreadFeedbackCount > 0 ? `${unreadFeedbackCount} непрочитанных` : "все прочитаны",
      icon: MessageSquare,
      href: "/admin/feedback",
      color: unreadFeedbackCount > 0 ? "#f59e0b" : "#6b7280",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-500 mt-1">Обзор состояния сервиса Praksia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Последние пользователи</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Все →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name ?? "—"}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {u.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Shield className="w-3 h-3" /> Админ
                    </span>
                  )}
                  {u.isBlocked && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Заблокирован
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(u.createdAt, "dd.MM.yyyy")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent feedback */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Последние сообщения</h2>
            <Link href="/admin/feedback" className="text-sm text-blue-600 hover:underline">Все →</Link>
          </div>
          {recentFeedback.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Сообщений нет</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentFeedback.map((f) => (
                <div key={f.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{f.email}</p>
                      {f.message && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{f.message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!f.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      <span className="text-xs text-gray-400">{formatDate(f.createdAt, "dd.MM")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
