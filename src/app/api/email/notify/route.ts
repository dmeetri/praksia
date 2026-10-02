import { NextResponse } from "next/server";
import { sendEmail, waitlistEmail } from "@/lib/email";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = (formData.get("email") as string)?.trim();
    if (!email) return NextResponse.redirect(new URL("/subscription?notify=error", req.url));

    // Save to DB (admin can see it in feedback section)
    await db.feedbackMessage.create({
      data: { email, type: "waitlist" },
    });

    // Send confirmation to user
    const { subject, html } = waitlistEmail(email);
    await sendEmail({ to: email, subject, html });

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Новая заявка на Premium: ${email}`,
        html: `<p>Новый пользователь записался в лист ожидания: <strong>${email}</strong></p>`,
      }).catch(console.error);
    }

    return NextResponse.redirect(new URL("/subscription?notify=ok", req.url));
  } catch (err) {
    console.error("Waitlist email error:", err);
    return NextResponse.redirect(new URL("/subscription?notify=error", req.url));
  }
}
