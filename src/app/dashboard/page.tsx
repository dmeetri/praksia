"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Plus, Star, Archive, Trash2, MoreVertical, Clock, FolderOpen, Search
} from "lucide-react";
import { getAllDocuments, deleteDocument, toggleFavorite, archiveDocument, getDocumentCount, MAX_FREE_DOCS } from "@/lib/storage";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { formatDate } from "@/lib/utils";
import type { SavedDocument, Template } from "@/types";

export default function DashboardPage() {
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [d, count] = await Promise.all([getAllDocuments(), getDocumentCount()]);
    setDocs(d);
    setDocCount(count);
  }, []);

  useEffect(() => {
    fetch("/api/templates?limit=6")
      .then((r) => r.json())
      .then((data) => setTemplates(data.items ?? []))
      .catch(() => {});
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  async function handleDelete(id: string) {
    if (!confirm("Удалить документ? Это действие необратимо.")) return;
    await deleteDocument(id);
    loadData();
    setActiveMenu(null);
  }

  async function handleToggleFavorite(id: string) {
    await toggleFavorite(id);
    loadData();
    setActiveMenu(null);
  }

  async function handleArchive(id: string) {
    await archiveDocument(id);
    loadData();
    setActiveMenu(null);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Storage bar */}
      <div className="mb-6 p-3 rounded-xl flex items-center gap-3 text-sm"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span style={{ color: "var(--text-muted)" }}>Хранилище браузера</span>
            <span style={{ color: "var(--text)" }}>{docCount} / {MAX_FREE_DOCS} документов</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(docCount / MAX_FREE_DOCS) * 100}%`,
                background: docCount >= MAX_FREE_DOCS ? "#ef4444" : "var(--brand)",
              }}
            />
          </div>
        </div>
        {docCount >= MAX_FREE_DOCS * 0.8 && (
          <Link href="/subscription" className="badge badge-yellow whitespace-nowrap">
            Расширить →
          </Link>
        )}
      </div>

      {/* My documents */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ color: "var(--text)" }}>
            Мои документы
          </h2>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{docs.length} шт.</span>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map((i) => (
              <div key={i} className="card animate-pulse h-28" style={{ background: "var(--border)" }} />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="font-medium mb-1" style={{ color: "var(--text)" }}>Документов пока нет</p>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Выберите шаблон ниже и создайте первый документ
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <div key={doc.id} className="card group relative">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: "var(--brand-light)" }}>
                    <FileText className="w-4 h-4" style={{ color: "var(--brand)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{doc.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{doc.categoryName}</p>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <Clock className="w-3 h-3" /> {formatDate(doc.updatedAt)}
                    </p>
                  </div>
                  {doc.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/editor/${doc.templateId}?docId=${doc.id}`}
                    className="btn-secondary text-xs py-1 px-2 flex-1 justify-center"
                  >
                    Открыть
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === doc.id ? null : doc.id)}
                      className="btn-ghost p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenu === doc.id && (
                      <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl shadow-lg overflow-hidden"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <button onClick={() => handleToggleFavorite(doc.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--bg)] transition-colors" style={{ color: "var(--text)" }}>
                          <Star className="w-3.5 h-3.5" />
                          {doc.isFavorite ? "Убрать из избранного" : "В избранное"}
                        </button>
                        <button onClick={() => handleArchive(doc.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--bg)] transition-colors" style={{ color: "var(--text)" }}>
                          <Archive className="w-3.5 h-3.5" /> В архив
                        </button>
                        <button onClick={() => handleDelete(doc.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 transition-colors text-red-600">
                          <Trash2 className="w-3.5 h-3.5" /> Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ color: "var(--text)" }}>
            Популярные шаблоны
          </h2>
          <Link href="/dashboard/templates" className="text-sm font-medium" style={{ color: "var(--brand)" }}>
            Все шаблоны →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
          <Link href="/dashboard/templates"
            className="card flex items-center justify-center gap-2 text-sm font-medium cursor-pointer hover:shadow-card-hover"
            style={{ color: "var(--text-muted)", minHeight: 80 }}>
            <Search className="w-4 h-4" /> Найти больше шаблонов
          </Link>
        </div>
      </section>
    </div>
  );
}
