"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, FileText, Clock, FolderOpen, RotateCcw, Trash2 } from "lucide-react";
import { getArchivedDocuments, updateDocument, deleteDocument } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import type { SavedDocument } from "@/types";

export default function ArchivePage() {
  const [docs, setDocs] = useState<SavedDocument[]>([]);

  const load = () => getArchivedDocuments().then(setDocs);
  useEffect(() => { load(); }, []);

  async function restore(id: string) {
    await updateDocument(id, { isArchived: false });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Удалить навсегда?")) return;
    await deleteDocument(id);
    load();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Archive className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Архив</h1>
      </div>

      {docs.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Архив пуст</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map(doc => (
            <div key={doc.id} className="card flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"var(--bg)"}}>
                <FileText className="w-4 h-4" style={{color:"var(--text-muted)"}} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{color:"var(--text)"}}>{doc.name}</p>
                <p className="text-xs mt-0.5" style={{color:"var(--text-muted)"}}>{doc.categoryName}</p>
                <p className="text-xs mt-1 flex items-center gap-1" style={{color:"var(--text-muted)"}}>
                  <Clock className="w-3 h-3" /> {formatDate(doc.updatedAt)}
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => restore(doc.id)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Восстановить
                  </button>
                  <button onClick={() => remove(doc.id)} className="btn-secondary text-xs py-1 px-2 text-red-500 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
