import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search") ?? "";

  const where = {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [items, total] = await Promise.all([
    db.template.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: limit,
    }),
    db.template.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}
