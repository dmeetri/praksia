"use client";

import { useEffect, useState } from "react";
import { Search, Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function toggleAdmin(id: string, isAdmin: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !isAdmin }),
    });
    load();
  }

  async function toggleBlock(id: string, isBlocked: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    load();
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <p className="text-gray-500 mt-1">{users.length} пользователей зарегистрировано</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по email или имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-6 py-3 text-left">Пользователь</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Роль</th>
              <th className="px-6 py-3 text-left">Статус</th>
              <th className="px-6 py-3 text-left">Зарегистрирован</th>
              <th className="px-6 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-3">
                    <div className="h-5 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {u.name ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.isAdmin ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.isAdmin ? "Администратор" : "Пользователь"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        (u as unknown as { isBlocked: boolean }).isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {(u as unknown as { isBlocked: boolean }).isBlocked ? "Заблокирован" : "Активен"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleAdmin(u.id, u.isAdmin)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title={u.isAdmin ? "Снять права админа" : "Сделать админом"}
                        >
                          {u.isAdmin
                            ? <ShieldOff className="w-4 h-4 text-gray-500" />
                            : <Shield className="w-4 h-4 text-blue-500" />}
                        </button>
                        <button
                          onClick={() => toggleBlock(u.id, (u as unknown as { isBlocked: boolean }).isBlocked)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title={(u as unknown as { isBlocked: boolean }).isBlocked ? "Разблокировать" : "Заблокировать"}
                        >
                          {(u as unknown as { isBlocked: boolean }).isBlocked
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <Ban className="w-4 h-4 text-red-500" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
