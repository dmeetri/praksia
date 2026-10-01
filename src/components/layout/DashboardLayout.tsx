"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FileText, Star, Archive, Users, Calculator, Scale, Shield, GraduationCap,
  Search, Bell, Plus, LogOut, Settings, Crown, ChevronRight, LayoutDashboard
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Category } from "@/types";

const categoryIcons: Record<string, React.ElementType> = {
  Users, Calculator, Scale, Shield, GraduationCap, FileText,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const workspaceItems = [
    { label: "Мои документы", icon: FileText, href: "/dashboard" },
    { label: "Избранное", icon: Star, href: "/dashboard/favorites" },
    { label: "Архив", icon: Archive, href: "/dashboard/archive" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Left Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col sidebar overflow-y-auto scrollbar-hide">
        {/* Logo */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: "var(--text)" }}>
              Praksia
            </span>
          </Link>
        </div>

        {/* Workspace */}
        <div className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: "var(--text-muted)" }}>
            Рабочее пространство
          </p>
          <nav className="space-y-0.5">
            {workspaceItems.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "sidebar-item",
                  pathname === href && "active"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Categories */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: "var(--text-muted)" }}>
            Категории
          </p>
          <nav className="space-y-0.5">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.icon] ?? FileText;
              const href = `/dashboard/category/${cat.id}`;
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className={cn("sidebar-item", pathname === href && "active")}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{cat.name}</span>
                  {cat._count?.templates !== undefined && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {cat._count.templates}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
          {session?.user?.isAdmin && (
            <Link href="/admin" className={cn("sidebar-item", pathname.startsWith("/admin") && "active")}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Администратор</span>
            </Link>
          )}
          <Link href="/subscription" className="sidebar-item">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Подписка</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-item w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="header h-14 flex items-center px-6 gap-4">
          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Поиск шаблонов и документов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <button className="btn-ghost relative">
              <Bell className="w-4 h-4" />
            </button>

            {/* New doc button */}
            <Link href="/dashboard" className="btn-primary">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Новый документ</span>
            </Link>

            {/* User */}
            <Link href="/dashboard/profile" className="flex items-center gap-2 ml-1 hover:opacity-80 transition-opacity">
              <Avatar
                src={session?.user?.image}
                name={session?.user?.name ?? session?.user?.email}
                size="sm"
              />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
