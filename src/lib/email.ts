import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
  });
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export function welcomeEmail(name: string) {
  return {
    subject: "Добро пожаловать в Praksia!",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: white; max-width: 560px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
  h1 { color: #1f2937; font-size: 20px; margin-bottom: 16px; }
  p { color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
  .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px; }
  .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
</style></head>
<body>
  <div class="card">
    <div class="logo">📄 Praksia</div>
    <h1>Добро пожаловать, ${name}!</h1>
    <p>Вы успешно зарегистрировались в Praksia — сервисе умных документов.</p>
    <p>Теперь вы можете создавать заявления, приказы, рапорты и другие официальные документы за считанные минуты.</p>
    <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">Перейти к документам →</a>
    <div class="footer">Praksia · ${process.env.NEXTAUTH_URL}</div>
  </div>
</body>
</html>`,
  };
}

export function documentReadyEmail(name: string, documentName: string) {
  return {
    subject: `Ваш документ готов: ${documentName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: white; max-width: 560px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
  h1 { color: #1f2937; font-size: 20px; margin-bottom: 16px; }
  p { color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
  .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px; }
  .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
</style></head>
<body>
  <div class="card">
    <div class="logo">📄 Praksia</div>
    <h1>${name}, ваш документ готов!</h1>
    <p>Документ <strong>«${documentName}»</strong> был успешно создан и сохранён.</p>
    <p>Вы можете скачать его в формате PDF или DOCX в личном кабинете.</p>
    <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">Открыть документ →</a>
    <div class="footer">Praksia · ${process.env.NEXTAUTH_URL}</div>
  </div>
</body>
</html>`,
  };
}
