"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Template } from "@/types";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch("/api/admin/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Удалить шаблон? Это действие нельзя отменить.")) return;
    await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шаблоны</h1>
          <p className="text-gray-500 mt-1">{templates.length} шаблонов в базе</p>
        </div>
        <Link href="/admin/templates/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Добавить шаблон
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по названию или категории..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-6 py-3 text-left">Шаблон</th>
              <th className="px-6 py-3 text-left">Категория</th>
              <th className="px-6 py-3 text-left">Полей</th>
              <th className="px-6 py-3 text-left">Статус</th>
              <th className="px-6 py-3 text-left">Обновлён</th>
              <th className="px-6 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-3">
                      <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {t.category?.name ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {Array.isArray(t.fields) ? t.fields.length : 0}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {t.isActive ? "Активен" : "Скрыт"}
                      </span>
                      {t.isPremium && (
                        <span className="ml-1 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Premium
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatDate(t.updatedAt)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleActive(t.id, t.isActive)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                          title={t.isActive ? "Скрыть" : "Показать"}
                        >
                          {t.isActive ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/templates/${t.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                          title="Редактировать"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
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
