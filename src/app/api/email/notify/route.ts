import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    if (!email) return NextResponse.redirect(new URL("/subscription?notify=error", req.url));

    // Send notification email
    await sendEmail({
      to: email,
      subject: "Вы в списке ожидания Praksia Premium",
      html: `
        <p>Спасибо за интерес к Praksia Premium!</p>
        <p>Мы уведомим вас по адресу <strong>${email}</strong>, когда оплата станет доступна. Первым подписчикам — специальная скидка.</p>
        <p><a href="${process.env.NEXTAUTH_URL}">Praksia — Умные документы</a></p>
      `,
    });

    // Also notify admin
    if (process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "Новая заявка на Premium",
        html: `<p>Новая заявка на Premium: <strong>${email}</strong></p>`,
      }).catch(console.error);
    }

    return NextResponse.redirect(new URL("/subscription?notify=ok", req.url));
  } catch {
    return NextResponse.redirect(new URL("/subscription?notify=error", req.url));
  }
}
