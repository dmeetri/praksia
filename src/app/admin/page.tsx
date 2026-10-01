import { FileText, Users, LayoutDashboard, TrendingUp } from "lucide-react";
import db from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Админ-панель" };

export default async function AdminDashboard() {
  const [templateCount, userCount, categoryCount, recentUsers] = await Promise.all([
    db.template.count(),
    db.user.count(),
    db.category.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, isAdmin: true },
    }),
  ]);

  const stats = [
    { label: "Шаблонов", value: templateCount, icon: FileText, href: "/admin/templates", color: "#3b82f6" },
    { label: "Пользователей", value: userCount, icon: Users, href: "/admin/users", color: "#8b5cf6" },
    { label: "Категорий", value: categoryCount, icon: LayoutDashboard, href: "/admin/templates", color: "#10b981" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-500 mt-1">Обзор состояния сервиса Praksia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Последние пользователи</h2>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Все →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-6 py-3 text-left">Пользователь</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Роль</th>
              <th className="px-6 py-3 text-left">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.name ?? "—"}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.isAdmin ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {u.isAdmin ? "Админ" : "Пользователь"}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
