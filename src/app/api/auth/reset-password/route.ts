import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return NextResponse.json(
      { error: "Ссылка недействительна или устарела. Запросите новую." },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}
