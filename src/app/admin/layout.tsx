"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Users, LogOut, ChevronRight,
  MessageSquare, Home,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Дашборд", icon: LayoutDashboard, href: "/admin" },
  { label: "Шаблоны", icon: FileText, href: "/admin/templates" },
  { label: "Пользователи", icon: Users, href: "/admin/users" },
  { label: "Сообщения", icon: MessageSquare, href: "/admin/feedback" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen" style={{ background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "#e2e8f0" }}>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Praksia</p>
              <p className="text-xs text-gray-500">Администратор</p>
            </div>
          </Link>
        </div>

        <nav className="p-3 flex-1 space-y-0.5">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active =
              pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-0.5" style={{ borderColor: "#e2e8f0" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            На сайт
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
