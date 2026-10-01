import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const template = await db.template.findUnique({
    where: { id: params.id, isActive: true },
    include: { category: true },
  });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}
