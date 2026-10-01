"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Что-то пошло не так</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{error.message}</p>
        <button onClick={reset} className="btn-primary">Попробовать снова</button>
      </div>
    </div>
  );
}
