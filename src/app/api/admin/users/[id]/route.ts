import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

async function requireAdmin(currentUserId?: string, targetId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  // Prevent self-block / self-demotion
  if (currentUserId === targetId) return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!await requireAdmin(session?.user?.id, params.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ["isAdmin", "isBlocked"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  const user = await db.user.update({ where: { id: params.id }, data });
  return NextResponse.json(user);
}
