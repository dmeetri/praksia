import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  documentName: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { to, subject, documentName } = parsed.data;

  try {
    await sendEmail({
      to,
      subject: `Документ «${subject}» из Praksia`,
      html: `
        <p>Вам отправлен документ <strong>«${documentName}»</strong> из сервиса Praksia.</p>
        <p>Для просмотра документа перейдите в ваш личный кабинет: <a href="${process.env.NEXTAUTH_URL}/dashboard">${process.env.NEXTAUTH_URL}</a></p>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 });
  }
}
