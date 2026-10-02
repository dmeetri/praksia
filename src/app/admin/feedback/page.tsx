"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Mail, Trash2, CheckCheck, Circle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

interface FeedbackMessage {
  id: string;
  email: string;
  name: string | null;
  message: string | null;
  type: string;
  read: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  waitlist: "Лист ожидания",
  contact: "Обратная связь",
  support: "Поддержка",
};

export default function AdminFeedbackPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  async function load() {
    const res = await fetch("/api/admin/feedback");
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRead(msg: FeedbackMessage) {
    const res = await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, read: !msg.read }),
    });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: !m.read } : m));
    }
  }

  async function handleDelete() {
    if (!deleteModal.id) return;
    const res = await fetch("/api/admin/feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteModal.id }),
    });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== deleteModal.id));
      toast.success("Сообщение удалено");
    }
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
          <p className="text-gray-500 mt-1">
            {messages.length} всего{unread > 0 ? `, ${unread} непрочитанных` : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Загрузка...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400">Сообщений нет</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${!msg.read ? "bg-blue-50/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {!msg.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    )}
                    {msg.read && <div className="w-2 h-2 mt-2 flex-shrink-0" />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{msg.email}</span>
                        {msg.name && <span className="text-gray-500 text-sm">({msg.name})</span>}
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          {TYPE_LABELS[msg.type] ?? msg.type}
                        </span>
                      </div>
                      {msg.message && (
                        <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(msg.createdAt, "d MMMM yyyy, HH:mm")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleRead(msg)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title={msg.read ? "Отметить непрочитанным" : "Отметить прочитанным"}
                    >
                      {msg.read ? <Circle className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                    </button>
                    <a
                      href={`mailto:${msg.email}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Ответить по email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setDeleteModal({ open: true, id: msg.id })}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={deleteModal.open}
        title="Удалить сообщение?"
        message="Это действие необратимо."
        confirmText="Удалить"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}
