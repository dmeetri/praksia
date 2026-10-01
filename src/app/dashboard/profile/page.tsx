"use client";

import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Crown, Mail, User } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>Профиль</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={user?.image} name={user?.name ?? user?.email} size="lg" />
          <div>
            <p className="font-semibold text-lg" style={{ color: "var(--text)" }}>
              {user?.name ?? "Пользователь"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            {user?.isAdmin && (
              <span className="badge badge-blue mt-1 inline-flex">Администратор</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--bg)" }}>
            <User className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Имя</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{user?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--bg)" }}>
            <Mail className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Email</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>Подписка</h2>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ background: "var(--bg)" }}>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Текущий план</p>
            <p className="font-semibold" style={{ color: "var(--text)" }}>Бесплатный</p>
          </div>
          <span className="badge badge-gray">FREE</span>
        </div>
        <Link href="/subscription" className="btn-primary w-full justify-center">
          <Crown className="w-4 h-4 text-amber-300" />
          Перейти на Premium
        </Link>
      </div>
    </div>
  );
}
