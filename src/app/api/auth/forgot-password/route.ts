import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { sendEmail, passwordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
  }

  // Always respond 200 to prevent user enumeration
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpires: expires },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://praksia.ru";
  const resetUrl = `${base}/reset-password?token=${token}`;

  try {
    const { subject, html } = passwordResetEmail(resetUrl);
    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.error("Forgot-password email error:", err);
  }

  return NextResponse.json({ ok: true });
}
