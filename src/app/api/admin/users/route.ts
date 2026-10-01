import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, name: true, image: true,
      isAdmin: true, isBlocked: true, createdAt: true,
      subscription: { select: { plan: true, status: true } },
    },
  });
  return NextResponse.json(users);
}
