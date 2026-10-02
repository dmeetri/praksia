"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export function Modal({
  open,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
  onConfirm,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>
            {title}
          </h3>
          <button onClick={onClose} className="btn-ghost p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {message && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {message}
            </p>
          )}
          {children}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">
              {cancelText}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="btn-primary px-4 py-2 text-sm"
              style={danger ? { background: "#ef4444" } : undefined}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
