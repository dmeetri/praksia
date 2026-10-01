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

  const templates = await db.template.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, categoryId, description, content, isActive, isPremium, fields } = body;

  if (!name || !categoryId || !content) {
    return NextResponse.json({ error: "Название, категория и контент обязательны" }, { status: 400 });
  }

  const template = await db.template.create({
    data: { name, categoryId, description, content, isActive, isPremium, fields },
  });
  return NextResponse.json(template, { status: 201 });
}
