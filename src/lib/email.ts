import nodemailer from "nodemailer";

// ── Timeweb MCP: https://api-mail.timeweb.com/mcp
// Настройки SMTP задаются через .env:
//   SMTP_HOST=smtp.timeweb.ru
//   SMTP_PORT=465
//   SMTP_USER=no-reply@praksia.ru
//   SMTP_PASSWORD=ваш_пароль
//   SMTP_FROM=Praksia <no-reply@praksia.ru>

const smtpPort = Number(process.env.SMTP_PORT ?? 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.timeweb.ru",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const FROM = process.env.SMTP_FROM ?? "Praksia <no-reply@praksia.ru>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://praksia.ru";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function layout(body: string) {
  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;margin:0;padding:24px}
  .wrap{max-width:560px;margin:0 auto}
  .card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .logo{font-size:22px;font-weight:700;color:#2563eb;margin-bottom:28px}
  h1{color:#111827;font-size:20px;margin:0 0 16px}
  p{color:#4b5563;line-height:1.65;margin:0 0 16px}
  .btn{display:inline-block;background:#2563eb;color:#fff!important;padding:13px 26px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;margin-top:8px}
  .divider{height:1px;background:#e5e7eb;margin:24px 0}
  .footer{color:#9ca3af;font-size:12px;text-align:center;margin-top:20px}
</style></head>
<body><div class="wrap"><div class="card">
<div class="logo">📄 Praksia</div>
${body}
</div><div class="footer">Praksia · <a href="${BASE_URL}" style="color:#9ca3af">${BASE_URL}</a></div></div></body></html>`;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export function welcomeEmail(name: string) {
  return {
    subject: "Добро пожаловать в Praksia!",
    html: layout(`
      <h1>Добро пожаловать, ${name}!</h1>
      <p>Вы успешно зарегистрировались в Praksia — сервисе умных документов.</p>
      <p>Теперь создавайте заявления, приказы, рапорты и другие официальные документы за считанные минуты.</p>
      <a href="${BASE_URL}/dashboard" class="btn">Перейти к документам →</a>
    `),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Сброс пароля — Praksia",
    html: layout(`
      <h1>Сброс пароля</h1>
      <p>Мы получили запрос на сброс пароля для вашей учётной записи.</p>
      <p>Нажмите на кнопку ниже, чтобы задать новый пароль. Ссылка действительна <strong>1 час</strong>.</p>
      <a href="${resetUrl}" class="btn">Сбросить пароль →</a>
      <div class="divider"></div>
      <p style="font-size:13px">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется прежним.</p>
    `),
  };
}

export function waitlistEmail(email: string) {
  return {
    subject: "Вы в списке ожидания — Praksia Premium",
    html: layout(`
      <h1>Вы успешно записаны!</h1>
      <p>Мы получили ваш запрос на доступ к Praksia Premium (${email}).</p>
      <p>Как только Premium-план будет доступен, мы сразу вам напишем.</p>
      <p>Пока что вы можете пользоваться бесплатной версией сервиса.</p>
      <a href="${BASE_URL}/dashboard" class="btn">Открыть Praksia →</a>
    `),
  };
}

export function documentNotifyEmail(documentName: string) {
  return {
    subject: `Документ готов: ${documentName}`,
    html: layout(`
      <h1>Ваш документ готов</h1>
      <p>Документ <strong>«${documentName}»</strong> был создан и сохранён в вашем аккаунте.</p>
      <p>Вы можете скачать его в формате PDF или DOCX в личном кабинете.</p>
      <a href="${BASE_URL}/dashboard" class="btn">Открыть документ →</a>
    `),
  };
}
