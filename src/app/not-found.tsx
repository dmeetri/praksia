import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center">
        <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "var(--text-muted)" }} />
        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>404</h1>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>Страница не найдена</p>
        <Link href="/dashboard" className="btn-primary">На главную</Link>
      </div>
    </div>
  );
}
