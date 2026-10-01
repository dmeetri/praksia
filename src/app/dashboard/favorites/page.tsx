"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, FileText, Clock, FolderOpen } from "lucide-react";
import { getFavoriteDocuments } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import type { SavedDocument } from "@/types";

export default function FavoritesPage() {
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavoriteDocuments().then(setDocs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Избранное</h1>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1,2].map(i => <div key={i} className="card h-24 animate-pulse" style={{background:"var(--border)"}} />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Нет избранных документов</p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">На главную</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map(doc => (
            <Link key={doc.id} href={`/editor/${doc.templateId}?docId=${doc.id}`} className="card group flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"var(--brand-light)"}}>
                <FileText className="w-4 h-4" style={{color:"var(--brand)"}} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:text-[var(--brand)] transition-colors truncate" style={{color:"var(--text)"}}>{doc.name}</p>
                <p className="text-xs mt-0.5" style={{color:"var(--text-muted)"}}>{doc.categoryName}</p>
                <p className="text-xs mt-1 flex items-center gap-1" style={{color:"var(--text-muted)"}}>
                  <Clock className="w-3 h-3" /> {formatDate(doc.updatedAt)}
                </p>
              </div>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
